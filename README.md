# Clander - Minimal Calendar App

A lightweight, fast calendar application designed to compete with Google Calendar.

## Features

- **Month & Week Views** - Switch between different calendar perspectives
- **Event Management** - Create, edit, and delete events easily
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Local Storage** - All data stored locally in your browser
- **No Account Required** - Start using immediately

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
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Styling
├── js/
│   └── app.js          # Application logic
├── data/
│   └── events.json     # Sample events
└── README.md           # This file
```

## Usage

1. **View Calendar** - Navigate months using arrows
2. **Create Event** - Click on any date
3. **Edit Event** - Click on an event to modify
4. **Delete Event** - Remove events with delete button
5. **Switch Views** - Toggle between month and week views

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

- [ ] Cloud sync (Google Drive, Dropbox)
- [ ] Recurring events
- [ ] Event reminders & notifications
- [ ] Multiple calendars
- [ ] Color-coded events
- [ ] Dark mode
- [ ] Export to iCal format
- [ ] Sharing functionality

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this however you like.

## Support

For issues or suggestions, please open an issue on GitHub.