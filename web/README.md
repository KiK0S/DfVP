# DfVP Web - Multiplayer Tower Defense Game

A web-based version of the original DfVP Python game, featuring modern multiplayer functionality with room-based gameplay.

## Features

- **Modern Web Interface**: Clean, responsive UI with room-based multiplayer
- **Real-time Gameplay**: WebSocket-based communication for smooth multiplayer experience
- **Room System**: Generate or join rooms using 6-character room codes
- **Tower Defense**: Defend the central tower from waves of enemies
- **Multiplayer Support**: Up to 3 players per room
- **Cross-platform**: Works on any modern web browser

## Game Controls

- **WASD**: Move your player
- **L**: Shoot bullets (only while moving)
- **Objective**: Defend the tower from enemies while scoring points

## Setup Instructions

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. Navigate to the web directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and go to:
   ```
   http://localhost:3000
   ```

### Development Mode

For development with auto-restart on file changes:
```bash
npm run dev
```

## How to Play

1. **Create a Room**: Click "Create New Room" to generate a unique room code
2. **Share Room Code**: Share the 6-character room code with friends
3. **Join Room**: Other players can enter the room code and click "Join Room"
4. **Start Game**: Once players have joined, click "Start Game"
5. **Play**: Use WASD to move and L to shoot at enemies

## Game Mechanics

- **Players**: Move around the arena and shoot bullets at enemies
- **Enemies**: Spawn in waves and move toward the central tower
- **Bullets**: Can only be fired while moving, travel in the direction of movement
- **Scoring**: Earn points by destroying enemies
- **Game Over**: Game ends when an enemy reaches the tower

## Technical Details

### Architecture

- **Frontend**: HTML5 Canvas + JavaScript
- **Backend**: Node.js with Express and WebSocket
- **Communication**: WebSocket for real-time game state synchronization
- **Assets**: Original game sprites converted for web use

### File Structure

```
web/
├── client/
│   ├── index.html          # Main game interface
│   ├── game.js             # Client-side game logic
│   ├── styles.css          # Modern UI styling
│   └── assets/             # Game sprites and images
├── server/
│   ├── server.js           # Main server with WebSocket handling
│   ├── room-manager.js     # Room creation and management
│   └── game-handler.js     # Server-side game logic
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

### Game Logic

The web version maintains the same game mechanics as the original Python version:
- Identical movement physics and collision detection
- Same enemy spawning patterns and wave system
- Matching scoring and game progression
- Preserved player controls and shooting mechanics

## Deployment

### Local Development
The game runs on `http://localhost:3000` by default.

### Production Deployment
For production deployment, you can:
1. Set the `PORT` environment variable to your desired port
2. Use a reverse proxy (nginx, Apache) for SSL termination
3. Deploy to cloud platforms like Heroku, Railway, or Vercel

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Common Issues

1. **"Failed to connect to server"**
   - Make sure the server is running (`npm start`)
   - Check if port 3000 is available
   - Try refreshing the page

2. **"Room is full"**
   - Maximum 3 players per room
   - Create a new room or wait for players to leave

3. **Assets not loading**
   - Check that all PNG files are in the `client/assets/` directory
   - Clear browser cache and refresh

### Development Tips

- Use browser developer tools to monitor WebSocket connections
- Check server console for connection logs and errors
- Test multiplayer by opening multiple browser tabs

## License

This web version maintains the same license as the original game.

## Credits

- Original game: KiK0S
- Web conversion: AI Assistant
- Game assets: Original DfVP assets
