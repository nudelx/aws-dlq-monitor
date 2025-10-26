# AWS DLQ Monitor Dashboard

A modern, dark-themed React dashboard for monitoring AWS Dead Letter Queues (DLQs).

## Features

- 🎨 **Dark Modern Theme** - Beautiful dark UI with gradient backgrounds
- 📊 **Real-time Statistics** - Overview of queue status and message counts
- 🔄 **Auto-refresh** - Automatically updates every 30 seconds
- 📱 **Responsive Design** - Works on desktop and mobile devices
- ⚡ **Fast Loading** - Optimized for performance

## Screenshots

The dashboard displays:

- **Header** with title, last updated time, and refresh button
- **Statistics Panel** showing total queues, active queues, error queues, and total messages
- **Queue Cards** with detailed information for each DLQ

## Local Development

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### GitHub Pages

1. Install gh-pages:

```bash
npm install --save-dev gh-pages
```

2. Deploy to GitHub Pages:

```bash
npm run deploy
```

### Firebase (Future)

The dashboard is designed to work with Firebase for real-time data. To integrate:

1. Install Firebase:

```bash
npm install firebase
```

2. Configure Firebase in `src/firebase.js`
3. Replace mock data in `App.js` with Firebase calls

## Project Structure

```
dashboard/
├── public/
│   └── index.html          # Main HTML file
├── src/
│   ├── components/         # React components
│   │   ├── Header.js      # Dashboard header
│   │   ├── StatsPanel.js  # Statistics overview
│   │   └── DLQCard.js     # Individual queue cards
│   ├── App.js             # Main app component
│   ├── App.css            # Main styles
│   ├── index.js           # React entry point
│   └── index.css          # Global styles
├── server.js              # Express server (for local development)
└── package.json           # Dependencies and scripts
```

## Configuration

### DLQ Names

Update the `DLQ_NAMES` array in `src/App.js` to include your AWS DLQ names:

```javascript
const DLQ_NAMES = [
  "your-queue-name-1-dlq",
  "your-queue-name-2-dlq",
  // ... add your DLQ names
];
```

### Styling

The dashboard uses a dark theme with:

- Primary colors: `#0f0f23`, `#1a1a2e`, `#16213e`
- Accent colors: `#4a9eff`, `#4ade80`, `#ff6b6b`
- Text colors: `#ffffff`, `#a0a0a0`

## Future Enhancements

- [ ] Firebase integration for real-time data
- [ ] AWS credentials management
- [ ] Queue message details view
- [ ] Historical data charts
- [ ] Alert notifications
- [ ] Export functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC
