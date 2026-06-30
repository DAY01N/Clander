# Multi-AI Chatbot Aggregator

A powerful web application that aggregates responses from multiple AI chatbots (ChatGPT, Gemini, Perplexity, Claude) and provides a comprehensive, unified answer.

## Features

- **Multi-AI Querying**: Send your prompts to multiple AI services simultaneously
- **Intelligent Summarization**: Automatically summarizes all responses into a comprehensive answer
- **Customizable**: Choose which AI models to query and which one to use for summarization
- **Source Tracking**: Shows sources and citations when available
- **Conversation History**: Maintains context across multiple messages
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Local Storage**: Settings are saved in your browser

## How It Works

1. **User Input**: You type a prompt in the chat interface
2. **Multi-AI Query**: The app sends your prompt to all enabled AI services (ChatGPT, Gemini, Perplexity, Claude)
3. **Response Collection**: All AI responses are collected
4. **Intelligent Summarization**: A selected AI model (default: Gemini) analyzes all responses and creates a comprehensive, unified answer
5. **Result Display**: You get both individual responses (optional) and the final summary

## Quick Start

### Option 1: Open Directly
```bash
# Simply open the index.html file in your browser
open ai-chatbot/index.html
```

### Option 2: Local Server (Recommended)
```bash
# Navigate to the ai-chatbot directory
cd ai-chatbot

# Using Python 3
python -m http.server 8000

# Or using Node.js
npx http-server
```

Then visit `http://localhost:8000`

## Project Structure

```
ai-chatbot/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Styling and theming
└── js/
    ├── app.js          # Main application logic
    └── ai-service.js   # AI service integration
```

## Configuration

### Settings Panel
Click the ⚙️ Settings button to customize:

- **AI Models**: Enable/disable individual AI services
- **Summarization**: Choose which AI to use for final summarization
- **Display Options**: Show/hide individual responses and sources

### Supported AI Models

| Model | Color | Status |
|-------|-------|--------|
| ChatGPT | Green | ✅ Enabled by default |
| Gemini | Yellow | ✅ Enabled by default |
| Perplexity | Blue | ✅ Enabled by default |
| Claude | Purple | ✅ Enabled by default |

## Usage Examples

### Basic Query
```
User: What is the capital of France?
Multi-AI: [Aggregates responses from all enabled models and provides a comprehensive answer]
```

### Complex Analysis
```
User: Explain the economic impact of AI on the job market in 2024
Multi-AI: [Provides a detailed analysis combining insights from all AI models]
```

### Code Generation
```
User: Write a Python function to sort a list of dictionaries by a key
Multi-AI: [Shows code examples from different models and provides the best solution]
```

## Technical Implementation

### Architecture
The app uses a modular architecture:

1. **AIService Class** (`ai-service.js`):
   - Manages communication with AI models
   - Handles query execution and response collection
   - Performs intelligent summarization
   - Manages settings and configuration

2. **MultiAIChatbotApp Class** (`app.js`):
   - Handles user interface
   - Manages chat state and conversation history
   - Coordinates between UI and AI service
   - Provides rich formatting and display options

### Current Implementation Status

✅ **Frontend**: Complete with responsive design and rich UI
✅ **AI Service**: Mock implementation with simulated responses
✅ **Settings**: Full customization options
✅ **Conversation**: History tracking and context
⚠️ **Backend Integration**: Requires implementation for real AI queries

## Backend Integration (Required for Production)

To make this app work with real AI services, you need to implement a backend proxy service. Here's why:

1. **CORS Restrictions**: Web browsers prevent direct cross-origin requests to AI services
2. **Authentication**: Most AI services require API keys or authentication
3. **Rate Limiting**: Direct client-side requests may be blocked or rate-limited
4. **Security**: API keys should not be exposed in client-side code

### Backend Options

#### Option 1: Node.js Proxy Server
```javascript
// server.js
const express = require('express');
const axios = require('axios');
const app = express();

app.post('/api/query', async (req, res) => {
    const { model, prompt } = req.body;
    
    // Implement query logic for each model
    // Use official APIs or web scraping libraries
    
    res.json({ response: 'AI response here' });
});

app.listen(3000, () => console.log('Proxy server running on port 3000'));
```

#### Option 2: Python Flask Server
```python
# server.py
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

@app.route('/api/query', methods=['POST'])
def query_ai():
    data = request.json
    model = data.get('model')
    prompt = data.get('prompt')
    
    # Implement query logic for each model
    
    return jsonify({'response': 'AI response here'})

if __name__ == '__main__':
    app.run(port=3000)
```

#### Option 3: Serverless Functions (Vercel, Netlify, etc.)
```javascript
// api/query.js (Vercel)
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { model, prompt } = req.body;
        
        // Implement query logic
        
        res.status(200).json({ response: 'AI response here' });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
```

### API Integration

Once you have a backend, update the `queryModelProxy` method in `ai-service.js`:

```javascript
async queryModelProxy(modelId, prompt, conversationContext) {
    try {
        const response = await fetch('http://localhost:3000/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: modelId,
                prompt: prompt,
                context: conversationContext
            })
        });
        
        return await response.json();
    } catch (error) {
        console.error('Proxy error:', error);
        return { text: `Error querying ${modelId}: ${error.message}` };
    }
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

- [ ] Real backend integration with official APIs
- [ ] Web scraping implementation for services without APIs
- [ ] Authentication management for AI services
- [ ] Rate limiting and error handling
- [ ] Conversation memory and context
- [ ] Model performance comparison
- [ ] Custom prompts and system messages
- [ ] Export chat history
- [ ] Dark/light mode toggle
- [ ] Voice input/output
- [ ] Image generation support
- [ ] Plugin system for additional AI services

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this however you like.

## Support

For issues or suggestions, please open an issue on GitHub.

---

**Note**: This app currently uses mock responses for demonstration. To use real AI services, you need to implement the backend integration as described above.