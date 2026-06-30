# Clander - Minimal Calendar App

A lightweight, fast calendar application designed to compete with Google Calendar.

## Features

- **Month & Week Views** - Switch between different calendar perspectives
- **Event Management** - Create, edit, and delete events easily
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Local Storage** - All data stored locally in your browser
- **No Account Required** - Start using immediately

## 🚀 New: Multi-AI Chatbot Aggregator

We've added a powerful **Multi-AI Chatbot Aggregator** feature! This allows you to:

- Query multiple AI services (ChatGPT, Gemini, Perplexity, Claude) simultaneously
- Get comprehensive answers by combining insights from all models
- Customize which AI services to use
- View individual responses or just the final summary

**To use the AI Chatbot:**
1. Navigate to the `ai-chatbot` directory
2. Open `ai-chatbot/index.html` in your browser
3. Start chatting with multiple AI models at once!

See [ai-chatbot/README.md](ai-chatbot/README.md) for detailed documentation.

## Quick Start

### Option 1: Open Directly
```bash
# Simply open index.html in your browser
open index.html
```

### Option 2: Local Server (Recommended)
```bash
# Using Python 3
python -m http.server 8000

# Or using Node.js
npx http-server
```

Then visit `http://localhost:8000`

## Project Structure

```
Clander/
├── index.html          # Main HTML file (Calendar)
├── css/
│   └── styles.css      # Calendar styling
├── js/
│   └── app.js          # Calendar application logic
├── ai-chatbot/         # Multi-AI Chatbot Aggregator
│   ├── index.html      # Chatbot HTML
│   ├── css/
│   │   └── styles.css  # Chatbot styling
│   ├── js/
│   │   ├── app.js      # Chatbot application logic
│   │   └── ai-service.js # AI service integration
│   └── README.md       # Chatbot documentation
├── data/
│   └── events.json     # Sample events
└── README.md           # This file
```

## Usage

### Calendar App
1. **View Calendar** - Navigate months using arrows
2. **Create Event** - Click on any date
3. **Edit Event** - Click on an event to modify
4. **Delete Event** - Remove events with delete button
5. **Switch Views** - Toggle between month and week views

### AI Chatbot
1. **Type your prompt** - Enter any question or request
2. **Send message** - Press Enter or click the send button
3. **View responses** - See individual AI responses and the final summary
4. **Customize settings** - Choose which AI models to use

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript (No frameworks)
- LocalStorage API

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

### Calendar
- [ ] Cloud sync (Google Drive, Dropbox)
- [ ] Recurring events
- [ ] Event reminders & notifications
- [ ] Multiple calendars
- [ ] Color-coded events
- [ ] Dark mode
- [ ] Export to iCal format
- [ ] Sharing functionality

### AI Chatbot
- [ ] Real backend integration with official APIs
- [ ] Web scraping implementation for services without APIs
- [ ] Authentication management for AI services
- [ ] Rate limiting and error handling
- [ ] Conversation memory and context
- [ ] Model performance comparison
- [ ] Voice input/output
- [ ] Image generation support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this however you like.

## Support

For issues or suggestions, please open an issue on GitHub.