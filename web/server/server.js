const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const GameHandler = require('./game-handler');
const RoomManager = require('./room-manager');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clientRoot = path.join(__dirname, '../client');
const distDir = path.join(clientRoot, 'dist');
const staticDir = fs.existsSync(distDir) ? distDir : clientRoot;

app.use(express.static(staticDir));

app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
        return next();
    }

    const indexFile = path.join(staticDir, 'index.html');
    if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
    } else {
        res.status(404).send('Client build not found. Run "npm run build".');
    }
});

// Room manager instance
const roomManager = new RoomManager();

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New client connected');
    
    // Store connection state in the WebSocket object
    ws.clientId = uuidv4();
    ws.roomCode = null;
    ws.playerId = null;
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'join_room':
                    handleJoinRoom(ws, data);
                    break;
                    
                case 'leave_room':
                    handleLeaveRoom(ws);
                    break;
                    
                case 'start_game':
                    handleStartGame(ws);
                    break;
                    
                case 'input':
                    handleInput(ws, data);
                    break;
                    
                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error parsing message:', error);
            sendError(ws, 'Invalid message format');
        }
    });
    
    ws.on('close', () => {
        console.log('Client disconnected');
        if (ws.roomCode && ws.playerId !== null) {
            roomManager.removePlayer(ws.roomCode, ws.playerId);
        }
    });
    
    function handleJoinRoom(ws, data) {
        const { roomCode: requestedRoom } = data;
        
        // Check if this WebSocket is already in a room
        if (ws.roomCode) {
            sendError(ws, 'Already in a room. Please leave first.');
            return;
        }
        
        if (!roomManager.roomExists(requestedRoom)) {
            // Create new room if it doesn't exist
            roomManager.createRoom(requestedRoom);
        }
        
        const joinResult = roomManager.addPlayer(requestedRoom, ws);
        
        if (joinResult.success) {
            ws.roomCode = requestedRoom;
            ws.playerId = joinResult.playerId;
            
            // Send confirmation to client
            ws.send(JSON.stringify({
                type: 'room_joined',
                playerId: ws.playerId,
                roomCode: ws.roomCode,
                playerCount: roomManager.getPlayerCount(ws.roomCode),
                status: 'Waiting for players...',
                canStart: roomManager.canStartGame(ws.roomCode)
            }));
            
            // Notify other players in the room
            roomManager.broadcastToRoom(ws.roomCode, {
                type: 'room_update',
                playerCount: roomManager.getPlayerCount(ws.roomCode),
                status: 'Player joined',
                canStart: roomManager.canStartGame(ws.roomCode)
            }, ws);
            
        } else {
            sendError(ws, joinResult.error);
        }
    }
    
    function handleLeaveRoom(ws) {
        if (!ws.roomCode) {
            sendError(ws, 'Not in a room');
            return;
        }
        
        const roomCode = ws.roomCode;
        const playerId = ws.playerId;
        
        // Remove player from room
        roomManager.removePlayer(roomCode, playerId);
        
        // Clear WebSocket state
        ws.roomCode = null;
        ws.playerId = null;
        
        // Send confirmation to client
        ws.send(JSON.stringify({
            type: 'room_left'
        }));
        
        console.log(`Player ${playerId} left room ${roomCode}`);
    }
    
    function handleStartGame(ws) {
        if (!ws.roomCode) {
            sendError(ws, 'Not in a room');
            return;
        }
        
        const canStart = roomManager.canStartGame(ws.roomCode);
        if (!canStart) {
            sendError(ws, 'Cannot start game - need at least 1 player');
            return;
        }
        
        // Start the game
        roomManager.startGame(ws.roomCode);
        
        // Notify all players in the room
        roomManager.broadcastToRoom(ws.roomCode, {
            type: 'game_start'
        });
        
        console.log(`Game started in room ${ws.roomCode}`);
    }
    
    function handleInput(ws, data) {
        if (!ws.roomCode || ws.playerId === null) {
            return;
        }
        
        const gameHandler = roomManager.getGameHandler(ws.roomCode);
        if (gameHandler) {
            gameHandler.handleInput(ws.playerId, data.keys);
        }
    }
    
    function sendError(ws, message) {
        ws.send(JSON.stringify({
            type: 'error',
            message: message
        }));
    }
});

// Game loop for all active games
setInterval(() => {
    roomManager.updateGames();
}, 1000 / 30); // 30 FPS

// Clean up inactive rooms
setInterval(() => {
    roomManager.cleanupInactiveRooms();
}, 60000); // Every minute

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
