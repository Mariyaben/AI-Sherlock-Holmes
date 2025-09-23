# Sherlock Holmes AI Frontend

A modern React frontend for the Sherlock Holmes AI chatbot application.

## Features

- **Modern Chat Interface**: Beautiful, responsive chat UI with real-time messaging
- **Cases Browser**: Browse and search through Sherlock Holmes case files
- **Session Management**: Persistent conversation history
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: Elegant dark theme with Victorian-inspired styling
- **Markdown Support**: Rich text rendering for AI responses
- **Real-time Updates**: Smooth animations and transitions

## Tech Stack

- **React 18**: Modern React with hooks
- **Styled Components**: CSS-in-JS styling
- **Framer Motion**: Smooth animations
- **Axios**: HTTP client for API communication
- **React Router**: Client-side routing
- **React Hot Toast**: Beautiful notifications
- **React Markdown**: Markdown rendering

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend server running on http://localhost:5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will open at http://localhost:3000

### Building for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ChatInterface.js    # Main chat interface
│   ├── Header.js          # App header
│   ├── Sidebar.js         # Navigation sidebar
│   └── CasesBrowser.js    # Cases browser
├── services/            # API services
│   └── api.js              # HTTP client and API calls
├── hooks/               # Custom React hooks
│   └── useAuth.js          # Authentication hook
├── utils/               # Utility functions
│   └── session.js          # Session management
├── styles/              # Global styles
│   └── GlobalStyles.js     # Styled components
├── App.js               # Main app component
└── index.js             # App entry point
```

## API Integration

The frontend communicates with the Flask backend through REST API endpoints:

- `POST /api/chat` - Send messages to Sherlock
- `GET /api/chat/history/:sessionId` - Get chat history
- `DELETE /api/chat/history/:sessionId` - Clear chat history
- `GET /api/cases` - List available cases
- `GET /api/cases/:name` - Get case content
- `POST /api/search` - Search through cases

## Environment Variables

Create a `.env` file in the frontend directory:

```
REACT_APP_API_URL=http://localhost:5000
```

## Features in Detail

### Chat Interface
- Real-time messaging with Sherlock Holmes
- Message history persistence
- Typing indicators
- Markdown rendering for rich responses
- Mobile-responsive design

### Cases Browser
- Browse all Sherlock Holmes cases
- Search functionality
- Case content preview
- Full case reading

### Session Management
- Automatic session ID generation
- Local storage backup
- Session persistence across browser refreshes

## Styling

The app uses a dark theme with:
- Victorian-inspired color palette
- Gradient backgrounds
- Smooth animations
- Responsive design
- Custom scrollbars

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Code Style

- ESLint configuration included
- Prettier formatting
- Component-based architecture
- Custom hooks for reusable logic

## Deployment

The built app can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- Azure Static Web Apps

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
