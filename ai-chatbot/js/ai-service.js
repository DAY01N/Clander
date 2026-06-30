/**
 * AI Service Module
 * Handles communication with various AI APIs
 * Uses web scraping approach for ChatGPT, Gemini, Perplexity, and Claude
 */

class AIService {
    constructor() {
        this.models = {
            chatgpt: {
                name: 'ChatGPT',
                color: '#10b981',
                icon: '🟢',
                enabled: true,
                url: 'https://chat.openai.com/'
            },
            gemini: {
                name: 'Gemini',
                color: '#fbbf24',
                icon: '🟡',
                enabled: true,
                url: 'https://gemini.google.com/'
            },
            perplexity: {
                name: 'Perplexity',
                color: '#3b82f6',
                icon: '🔵',
                enabled: true,
                url: 'https://www.perplexity.ai/'
            },
            claude: {
                name: 'Claude',
                color: '#8b5cf6',
                icon: '🟣',
                enabled: true,
                url: 'https://claude.ai/'
            }
        };
        
        this.summarizerModel = 'gemini';
        this.showIndividualResponses = true;
        this.showSources = true;
    }

    /**
     * Initialize the service with user settings
     */
    init(settings) {
        if (settings) {
            this.models.chatgpt.enabled = settings.useChatGPT !== false;
            this.models.gemini.enabled = settings.useGemini !== false;
            this.models.perplexity.enabled = settings.usePerplexity !== false;
            this.models.claude.enabled = settings.useClaude !== false;
            this.summarizerModel = settings.summarizerModel || 'gemini';
            this.showIndividualResponses = settings.showIndividualResponses !== false;
            this.showSources = settings.showSources !== false;
        }
    }

    /**
     * Get enabled models
     */
    getEnabledModels() {
        return Object.entries(this.models)
            .filter(([key, model]) => model.enabled)
            .map(([key, model]) => ({ id: key, ...model }));
    }

    /**
     * Get model by ID
     */
    getModel(modelId) {
        return this.models[modelId];
    }

    /**
     * Query a single AI model
     * This uses a web scraping approach via a proxy server
     */
    async queryModel(modelId, prompt, conversationContext = []) {
        const model = this.models[modelId];
        if (!model || !model.enabled) {
            return { 
                success: false, 
                error: `Model ${modelId} is not available or enabled` 
            };
        }

        try {
            // For security and reliability, we'll use a backend proxy
            // This is a placeholder for the actual implementation
            const response = await this.queryModelProxy(modelId, prompt, conversationContext);
            
            return {
                success: true,
                modelId,
                modelName: model.name,
                response: response.text || response,
                sources: response.sources || [],
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`Error querying ${modelId}:`, error);
            return {
                success: false,
                modelId,
                modelName: model.name,
                error: `Failed to query ${model.name}: ${error.message}`
            };
        }
    }

    /**
     * Query all enabled models in parallel
     */
    async queryAllModels(prompt, conversationContext = []) {
        const enabledModels = this.getEnabledModels();
        const results = [];
        
        // Create an array of promises for all enabled models
        const promises = enabledModels.map(model => 
            this.queryModel(model.id, prompt, conversationContext)
                .then(result => {
                    results.push(result);
                    return { modelId: model.id, status: result.success ? 'completed' : 'error' };
                })
        );

        // Wait for all promises to complete
        await Promise.all(promises);
        
        return results;
    }

    /**
     * Summarize multiple AI responses into a single comprehensive answer
     */
    async summarizeResponses(prompt, responses, conversationContext = []) {
        const enabledModels = this.getEnabledModels();
        
        // Filter successful responses
        const successfulResponses = responses.filter(r => r.success);
        
        if (successfulResponses.length === 0) {
            return {
                success: false,
                error: 'No successful responses to summarize'
            };
        }

        if (successfulResponses.length === 1) {
            // If only one response, return it directly
            return successfulResponses[0];
        }

        // Create a summary prompt
        const summaryPrompt = this.createSummaryPrompt(prompt, successfulResponses, enabledModels);
        
        try {
            // Use the selected summarizer model
            const summarizer = this.summarizerModel;
            const summaryResponse = await this.queryModel(summarizer, summaryPrompt, conversationContext);
            
            if (summaryResponse.success) {
                return {
                    success: true,
                    modelId: 'summary',
                    modelName: 'Multi-AI Summary',
                    response: summaryResponse.response,
                    sources: this.extractAllSources(successfulResponses),
                    individualResponses: successfulResponses,
                    timestamp: new Date().toISOString()
                };
            } else {
                // Fallback: create a simple concatenation
                return this.createFallbackSummary(prompt, successfulResponses);
            }
        } catch (error) {
            console.error('Error during summarization:', error);
            // Fallback to simple concatenation
            return this.createFallbackSummary(prompt, successfulResponses);
        }
    }

    /**
     * Create a summary prompt for the summarizer AI
     */
    createSummaryPrompt(originalPrompt, responses, enabledModels) {
        const modelNames = enabledModels.map(m => m.name).join(', ');
        
        const responseTexts = responses.map((r, index) => {
            const model = enabledModels.find(m => m.id === r.modelId);
            const modelName = model ? model.name : r.modelId;
            return `${index + 1}. ${modelName} Response:\n${r.response}\n`;
        }).join('\n');

        return `You are an expert AI aggregator. Please analyze the following responses from different AI models (${modelNames}) to the prompt: "${originalPrompt}"

${responseTexts}

Your task is to:
1. Identify the key points, insights, and information from each response
2. Resolve any contradictions or differences between the models
3. Combine the best aspects of each response
4. Provide a comprehensive, well-structured final answer that is better than any individual response
5. Include citations indicating which model provided which information when relevant
6. Format the response clearly with proper markdown

Please provide your expert synthesis:`;
    }

    /**
     * Create a fallback summary when the summarizer fails
     */
    createFallbackSummary(originalPrompt, responses) {
        const responseTexts = responses.map(r => {
            const model = this.models[r.modelId];
            const modelName = model ? model.name : r.modelId;
            return `**${modelName}:**\n${r.response}\n`;
        }).join('\n---\n\n');

        return {
            success: true,
            modelId: 'summary',
            modelName: 'Multi-AI Summary',
            response: `Here are the responses from all AI models to your prompt: "${originalPrompt}"\n\n${responseTexts}\n\n*Note: Automatic summarization failed, showing all individual responses.*`,
            sources: this.extractAllSources(responses),
            individualResponses: responses,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Extract all sources from responses
     */
    extractAllSources(responses) {
        const allSources = [];
        responses.forEach(response => {
            if (response.sources && Array.isArray(response.sources)) {
                allSources.push(...response.sources);
            }
        });
        return [...new Set(allSources)]; // Remove duplicates
    }

    /**
     * Proxy method for querying AI models
     * This is a placeholder - in production, you would need a backend service
     * due to CORS and authentication requirements
     */
    async queryModelProxy(modelId, prompt, conversationContext) {
        // This is a mock implementation
        // In a real application, you would:
        // 1. Set up a backend server (Node.js, Python, etc.)
        // 2. Use official APIs or web scraping libraries
        // 3. Handle authentication (API keys, cookies, etc.)
        // 4. Return the actual AI responses
        
        // For now, we'll simulate responses with a delay
        await this.delay(1000 + Math.random() * 2000);
        
        // Mock responses for each model
        const mockResponses = {
            chatgpt: {
                text: `ChatGPT Response: ${this.generateMockResponse(prompt, 'ChatGPT')}`,
                sources: this.generateMockSources('ChatGPT')
            },
            gemini: {
                text: `Gemini Response: ${this.generateMockResponse(prompt, 'Gemini')}`,
                sources: this.generateMockSources('Gemini')
            },
            perplexity: {
                text: `Perplexity Response: ${this.generateMockResponse(prompt, 'Perplexity')}`,
                sources: this.generateMockSources('Perplexity')
            },
            claude: {
                text: `Claude Response: ${this.generateMockResponse(prompt, 'Claude')}`,
                sources: this.generateMockSources('Claude')
            }
        };

        return mockResponses[modelId] || { text: `Response from ${modelId}: I couldn't generate a response for this model.` };
    }

    /**
     * Generate a mock response for demonstration
     */
    generateMockResponse(prompt, modelName) {
        const responses = [
            `Based on my analysis, ${prompt.substring(0, 50)}... Here's what I found: This is a comprehensive response from ${modelName} that addresses your query with detailed information and insights.`,
            `${modelName} provides the following perspective: ${prompt.substring(0, 40)}... This response includes multiple viewpoints and considers various aspects of your question.`,
            `From ${modelName}'s perspective: ${prompt.substring(0, 60)}... This answer combines factual information with analytical insights to give you a complete picture.`,
            `${modelName} suggests: ${prompt.substring(0, 45)}... This response is carefully crafted to provide accurate and helpful information based on the latest data.`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    /**
     * Generate mock sources for demonstration
     */
    generateMockSources(modelName) {
        const sources = [
            `https://${modelName.toLowerCase()}.ai/source1`,
            `https://${modelName.toLowerCase()}.ai/source2`,
            `https://example.com/${modelName.toLowerCase()}-reference`
        ];
        return Math.random() > 0.5 ? sources.slice(0, Math.floor(Math.random() * 3) + 1) : [];
    }

    /**
     * Delay function for simulating API calls
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get current settings
     */
    getSettings() {
        return {
            useChatGPT: this.models.chatgpt.enabled,
            useGemini: this.models.gemini.enabled,
            usePerplexity: this.models.perplexity.enabled,
            useClaude: this.models.claude.enabled,
            summarizerModel: this.summarizerModel,
            showIndividualResponses: this.showIndividualResponses,
            showSources: this.showSources
        };
    }

    /**
     * Update settings
     */
    updateSettings(settings) {
        this.models.chatgpt.enabled = settings.useChatGPT !== false;
        this.models.gemini.enabled = settings.useGemini !== false;
        this.models.perplexity.enabled = settings.usePerplexity !== false;
        this.models.claude.enabled = settings.useClaude !== false;
        this.summarizerModel = settings.summarizerModel || this.summarizerModel;
        this.showIndividualResponses = settings.showIndividualResponses !== false;
        this.showSources = settings.showSources !== false;
    }
}

// Export for use in other modules
window.AIService = AIService;