/**
 * Multi-AI Chatbot Aggregator Application
 * Main application logic
 */

class MultiAIChatbotApp {
    constructor() {
        // DOM Elements
        this.messagesContainer = document.getElementById('messages');
        this.promptInput = document.getElementById('promptInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettingsBtn = document.querySelector('#settingsModal .close-btn');
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        this.cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.loadingText = document.getElementById('loadingText');
        this.loadingProgress = document.getElementById('loadingProgress');
        this.statusText = document.getElementById('statusText');
        this.modelStatus = document.getElementById('modelStatus');

        // Settings elements
        this.useChatGPT = document.getElementById('useChatGPT');
        this.useGemini = document.getElementById('useGemini');
        this.usePerplexity = document.getElementById('usePerplexity');
        this.useClaude = document.getElementById('useClaude');
        this.summarizerModel = document.getElementById('summarizerModel');
        this.showIndividualResponses = document.getElementById('showIndividualResponses');
        this.showSources = document.getElementById('showSources');

        // AI Service
        this.aiService = new AIService();
        
        // State
        this.conversationHistory = [];
        this.isProcessing = false;
        this.currentRequestId = null;
        
        // Initialize
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.loadSettings();
        this.bindEvents();
        this.updateUI();
        this.autoResizeTextarea();
        this.scrollToBottom();
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        const savedSettings = localStorage.getItem('ai-chatbot-settings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                this.aiService.init(settings);
                this.updateSettingsUI();
            } catch (e) {
                console.error('Error loading settings:', e);
            }
        }
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        const settings = this.aiService.getSettings();
        localStorage.setItem('ai-chatbot-settings', JSON.stringify(settings));
    }

    /**
     * Update settings UI to match current settings
     */
    updateSettingsUI() {
        const settings = this.aiService.getSettings();
        this.useChatGPT.checked = settings.useChatGPT;
        this.useGemini.checked = settings.useGemini;
        this.usePerplexity.checked = settings.usePerplexity;
        this.useClaude.checked = settings.useClaude;
        this.summarizerModel.value = settings.summarizerModel;
        this.showIndividualResponses.checked = settings.showIndividualResponses;
        this.showSources.checked = settings.showSources;
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Send message
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Enter key in textarea
        this.promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Textarea input for auto-resize
        this.promptInput.addEventListener('input', () => this.autoResizeTextarea());

        // Clear chat
        this.clearChatBtn.addEventListener('click', () => this.clearChat());

        // Settings modal
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.cancelSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.saveSettingsBtn.addEventListener('click', () => this.saveAndCloseSettings());

        // Close modal on outside click
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.settingsModal.classList.contains('active')) {
                this.closeSettings();
            }
        });
    }

    /**
     * Auto-resize textarea based on content
     */
    autoResizeTextarea() {
        this.promptInput.style.height = 'auto';
        this.promptInput.style.height = Math.min(this.promptInput.scrollHeight, 200) + 'px';
    }

    /**
     * Send a message
     */
    async sendMessage() {
        const prompt = this.promptInput.value.trim();
        if (!prompt || this.isProcessing) return;

        // Clear input
        this.promptInput.value = '';
        this.autoResizeTextarea();

        // Add user message to UI
        this.addMessage(prompt, 'user');

        // Update state
        this.isProcessing = true;
        this.updateStatus('Processing your request...');
        this.updateModelStatus('waiting');

        // Show loading overlay
        this.showLoadingOverlay();

        // Generate request ID
        this.currentRequestId = Date.now().toString();

        try {
            // Query all enabled models
            this.updateLoadingText('Querying AI models...');
            const responses = await this.aiService.queryAllModels(prompt, this.conversationHistory);

            // Update loading progress
            this.updateLoadingProgress(responses);

            // Summarize responses
            this.updateLoadingText('Summarizing responses...');
            const summary = await this.aiService.summarizeResponses(prompt, responses, this.conversationHistory);

            // Add responses to conversation history
            this.conversationHistory.push({
                prompt,
                responses,
                summary,
                timestamp: new Date().toISOString()
            });

            // Display results
            this.displayResults(prompt, responses, summary);

            // Success
            this.updateStatus('Ready');
            this.updateModelStatus('completed');

        } catch (error) {
            console.error('Error processing message:', error);
            this.addMessage(`Error: ${error.message}`, 'system');
            this.updateStatus('Error occurred');
            this.updateModelStatus('error');
        } finally {
            this.isProcessing = false;
            this.hideLoadingOverlay();
            this.scrollToBottom();
        }
    }

    /**
     * Display results from AI models
     */
    displayResults(prompt, responses, summary) {
        const settings = this.aiService.getSettings();
        
        // Display individual responses if enabled
        if (settings.showIndividualResponses && summary.individualResponses) {
            summary.individualResponses.forEach(response => {
                if (response.success) {
                    this.addIndividualResponse(response);
                }
            });
        }

        // Display summary
        if (summary.success) {
            this.addSummaryMessage(summary);
        } else {
            this.addMessage(summary.error || 'Failed to generate summary', 'system');
        }
    }

    /**
     * Add a message to the chat
     */
    addMessage(text, type = 'ai', modelId = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const avatar = type === 'user' ? '👤' : type === 'system' ? '⚠️' : '🤖';
        const model = modelId ? this.aiService.getModel(modelId) : null;
        const modelAvatar = model ? model.icon : avatar;

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-avatar">${modelAvatar}</div>
                <div class="message-text">${this.formatMessage(text)}</div>
            </div>
            <div class="message-timestamp">${timestamp}</div>
        `;

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    /**
     * Add an individual AI response
     */
    addIndividualResponse(response) {
        const model = this.aiService.getModel(response.modelId);
        const modelColor = model ? model.color : '#666';
        const modelName = model ? model.name : response.modelId;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message individual-response ${response.modelId}`;

        let sourcesHtml = '';
        if (this.aiService.showSources && response.sources && response.sources.length > 0) {
            sourcesHtml = `
                <div class="sources">
                    <div class="sources-title">Sources:</div>
                    ${response.sources.map(source => 
                        `<a href="${source}" target="_blank" class="source-item">🔗 ${this.extractDomain(source)}</a>`
                    ).join('')}
                </div>
            `;
        }

        messageDiv.innerHTML = `
            <div class="individual-header">
                <span class="model-indicator ${response.modelId}" style="background-color: ${modelColor}"></span>
                <span class="model-name">${modelName}</span>
            </div>
            <div class="message-text">${this.formatMessage(response.response)}</div>
            ${sourcesHtml}
        `;

        this.messagesContainer.appendChild(messageDiv);
    }

    /**
     * Add a summary message
     */
    addSummaryMessage(summary) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai summary-section';

        let sourcesHtml = '';
        if (this.aiService.showSources && summary.sources && summary.sources.length > 0) {
            sourcesHtml = `
                <div class="sources">
                    <div class="sources-title">Combined Sources:</div>
                    ${summary.sources.map(source => 
                        `<a href="${source}" target="_blank" class="source-item">🔗 ${this.extractDomain(source)}</a>`
                    ).join('')}
                </div>
            `;
        }

        // Add model badges for the models that contributed
        const modelBadges = summary.individualResponses ? 
            summary.individualResponses.map(r => {
                const model = this.aiService.getModel(r.modelId);
                return model ? `<span class="model-badge ${r.modelId}" style="background-color: ${model.color}20; color: ${model.color}">${model.icon} ${model.name}</span>` : '';
            }).join('') : '';

        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-avatar">🌐</div>
                <div class="message-text">
                    <div class="summary-header">
                        <span>🎯 Multi-AI Summary</span>
                        ${modelBadges}
                    </div>
                    <div class="summary-content">${this.formatMessage(summary.response)}</div>
                    ${sourcesHtml}
                </div>
            </div>
            <div class="message-timestamp">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        `;

        this.messagesContainer.appendChild(messageDiv);
    }

    /**
     * Format message text (add markdown support)
     */
    formatMessage(text) {
        // Escape HTML
        let formatted = this.escapeHtml(text);

        // Convert markdown to HTML
        formatted = this.markdownToHtml(formatted);

        // Add code block copy buttons
        formatted = this.addCopyButtonsToCodeBlocks(formatted);

        return formatted;
    }

    /**
     * Escape HTML special characters
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Convert markdown to HTML (basic support)
     */
    markdownToHtml(text) {
        return text
            // Headers
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            
            // Code blocks
            .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
            
            // Inline code
            .replace(/`(.*?)`/g, '<code>$1</code>')
            
            // Links
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
            
            // Line breaks
            .replace(/\n/g, '<br>')
            
            // Lists
            .replace(/^\- (.*$)/gm, '<li>$1</li>')
            .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)+/g, '<ul>$&</ul>')
            
            // Blockquotes
            .replace(/^"> (.*$)/gm, '<blockquote>$1</blockquote>')
            
            // Horizontal rule
            .replace(/^---$/gm, '<hr>');
    }

    /**
     * Add copy buttons to code blocks
     */
    addCopyButtonsToCodeBlocks(html) {
        return html.replace(/<pre>([\s\S]*?)<\/pre>/g, (match, content) => {
            const codeId = 'code-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            return `
                <div class="code-block">
                    <div class="code-header">
                        <span>Code</span>
                        <button class="copy-btn" onclick="copyCode('${codeId}')">Copy</button>
                    </div>
                    <pre id="${codeId}">${content}</pre>
                </div>
            `;
        });
    }

    /**
     * Extract domain from URL
     */
    extractDomain(url) {
        try {
            const domain = new URL(url).hostname;
            return domain.replace('www.', '');
        } catch {
            return url;
        }
    }

    /**
     * Clear the chat
     */
    clearChat() {
        if (confirm('Are you sure you want to clear the chat? This cannot be undone.')) {
            this.messagesContainer.innerHTML = `
                <div class="message welcome-message">
                    <div class="message-content">
                        <div class="message-avatar">👋</div>
                        <div class="message-text">
                            <p><strong>Welcome to Multi-AI Chatbot Aggregator!</strong></p>
                            <p>I'll send your prompts to multiple AI services (ChatGPT, Gemini, Perplexity, Claude) and then summarize all their responses into a comprehensive answer.</p>
                            <p><em>Try asking me anything!</em></p>
                        </div>
                    </div>
                </div>
            `;
            this.conversationHistory = [];
            this.updateStatus('Chat cleared');
        }
    }

    /**
     * Open settings modal
     */
    openSettings() {
        this.updateSettingsUI();
        this.settingsModal.classList.add('active');
    }

    /**
     * Close settings modal
     */
    closeSettings() {
        this.settingsModal.classList.remove('active');
    }

    /**
     * Save settings and close modal
     */
    saveAndCloseSettings() {
        const settings = {
            useChatGPT: this.useChatGPT.checked,
            useGemini: this.useGemini.checked,
            usePerplexity: this.usePerplexity.checked,
            useClaude: this.useClaude.checked,
            summarizerModel: this.summarizerModel.value,
            showIndividualResponses: this.showIndividualResponses.checked,
            showSources: this.showSources.checked
        };

        this.aiService.updateSettings(settings);
        this.saveSettings();
        this.updateUI();
        this.closeSettings();
    }

    /**
     * Update UI based on current state
     */
    updateUI() {
        this.updateModelStatus();
    }

    /**
     * Update model status indicators
     */
    updateModelStatus(status = null) {
        const enabledModels = this.aiService.getEnabledModels();
        
        if (status === 'waiting') {
            this.modelStatus.innerHTML = enabledModels.map(model => 
                `<span class="tooltip">${model.icon} ${model.name}
                    <span class="tooltiptext">Querying...</span>
                </span>`
            ).join('');
        } else if (status === 'completed') {
            this.modelStatus.innerHTML = enabledModels.map(model => 
                `<span class="tooltip">${model.icon} ${model.name}
                    <span class="tooltiptext">✓ Completed</span>
                </span>`
            ).join('');
        } else if (status === 'error') {
            this.modelStatus.innerHTML = enabledModels.map(model => 
                `<span class="tooltip">${model.icon} ${model.name}
                    <span class="tooltiptext">✗ Error</span>
                </span>`
            ).join('');
        } else {
            this.modelStatus.innerHTML = enabledModels.map(model => 
                `<span class="tooltip">${model.icon} ${model.name}
                    <span class="tooltiptext">Enabled</span>
                </span>`
            ).join('');
        }
    }

    /**
     * Update status text
     */
    updateStatus(text) {
        this.statusText.textContent = text;
    }

    /**
     * Show loading overlay
     */
    showLoadingOverlay() {
        this.loadingOverlay.classList.remove('hidden');
    }

    /**
     * Hide loading overlay
     */
    hideLoadingOverlay() {
        this.loadingOverlay.classList.add('hidden');
    }

    /**
     * Update loading text
     */
    updateLoadingText(text) {
        this.loadingText.textContent = text;
    }

    /**
     * Update loading progress
     */
    updateLoadingProgress(responses) {
        const enabledModels = this.aiService.getEnabledModels();
        const totalModels = enabledModels.length;
        const completed = responses.filter(r => r.success).length;
        const errors = responses.filter(r => !r.success).length;

        this.loadingProgress.innerHTML = enabledModels.map(model => {
            const response = responses.find(r => r.modelId === model.id);
            let status = 'waiting';
            let text = model.name;
            
            if (response) {
                if (response.success) {
                    status = 'completed';
                    text = `✓ ${model.name}`;
                } else {
                    status = 'error';
                    text = `✗ ${model.name}`;
                }
            }
            
            return `<span class="progress-item ${status}">${text}</span>`;
        }).join('');
    }

    /**
     * Scroll to bottom of chat
     */
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// Global function for copying code
function copyCode(codeId) {
    const codeElement = document.getElementById(codeId);
    if (!codeElement) return;

    const text = codeElement.textContent;
    navigator.clipboard.writeText(text).then(() => {
        // Show feedback
        const button = codeElement.parentElement.querySelector('.copy-btn');
        if (button) {
            button.textContent = 'Copied!';
            button.classList.add('copied');
            setTimeout(() => {
                button.textContent = 'Copy';
                button.classList.remove('copied');
            }, 2000);
        }
    }).catch(err => {
        console.error('Failed to copy code:', err);
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MultiAIChatbotApp();
});