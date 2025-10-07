const GameHandler = require('./game-handler');

class RoomManager {
    constructor() {
        this.rooms = new Map(); // roomCode -> room data
        this.playerConnections = new Map(); // playerId -> WebSocket
        this.roomPlayers = new Map(); // roomCode -> Set of playerIds
    }
    
    createRoom(roomCode) {
        if (this.rooms.has(roomCode)) {
            return false;
        }
        
        this.rooms.set(roomCode, {
            code: roomCode,
            players: new Set(),
            gameHandler: null,
            gameActive: false,
            createdAt: Date.now(),
            lastActivity: Date.now()
        });
        
        this.roomPlayers.set(roomCode, new Set());
        
        console.log(`Room created: ${roomCode}`);
        return true;
    }
    
    roomExists(roomCode) {
        return this.rooms.has(roomCode);
    }
    
    addPlayer(roomCode, ws) {
        if (!this.rooms.has(roomCode)) {
            return { success: false, error: 'Room does not exist' };
        }
        
        const room = this.rooms.get(roomCode);
        const playerIds = this.roomPlayers.get(roomCode);
        
        if (playerIds.size >= 3) {
            return { success: false, error: 'Room is full (max 3 players)' };
        }
        
        // Check if this WebSocket is already connected to any room
        for (const [existingPlayerId, existingWs] of this.playerConnections.entries()) {
            if (existingWs === ws) {
                return { success: false, error: 'Already connected to a room' };
            }
        }
        
        // Find available player ID (0, 1, or 2)
        let playerId = 0;
        while (playerIds.has(playerId)) {
            playerId++;
        }
        
        // Add player to room
        playerIds.add(playerId);
        room.players.add(playerId);
        this.playerConnections.set(playerId, ws);
        
        room.lastActivity = Date.now();
        
        console.log(`Player ${playerId} joined room ${roomCode}`);
        
        return { success: true, playerId: playerId };
    }
    
    removePlayer(roomCode, playerId) {
        if (!this.rooms.has(roomCode)) {
            return;
        }
        
        const room = this.rooms.get(roomCode);
        const playerIds = this.roomPlayers.get(roomCode);
        
        playerIds.delete(playerId);
        room.players.delete(playerId);
        this.playerConnections.delete(playerId);
        
        room.lastActivity = Date.now();
        
        console.log(`Player ${playerId} left room ${roomCode}`);
        
        // If room is empty, mark it for cleanup
        if (playerIds.size === 0) {
            room.gameActive = false;
            if (room.gameHandler) {
                room.gameHandler = null;
            }
        }
        
        // Notify remaining players
        this.broadcastToRoom(roomCode, {
            type: 'room_update',
            playerCount: playerIds.size,
            status: 'Player left',
            canStart: this.canStartGame(roomCode)
        });
    }
    
    getPlayerCount(roomCode) {
        if (!this.rooms.has(roomCode)) {
            return 0;
        }
        return this.roomPlayers.get(roomCode).size;
    }
    
    canStartGame(roomCode) {
        const playerCount = this.getPlayerCount(roomCode);
        return playerCount >= 1 && playerCount <= 3;
    }
    
    startGame(roomCode) {
        if (!this.rooms.has(roomCode)) {
            return false;
        }
        
        const room = this.rooms.get(roomCode);
        const playerIds = this.roomPlayers.get(roomCode);
        
        if (playerIds.size === 0) {
            return false;
        }
        
        // Create game handler
        room.gameHandler = new GameHandler(Array.from(playerIds));
        room.gameActive = true;
        room.lastActivity = Date.now();
        
        console.log(`Game started in room ${roomCode} with ${playerIds.size} players`);
        return true;
    }
    
    getGameHandler(roomCode) {
        if (!this.rooms.has(roomCode)) {
            return null;
        }
        return this.rooms.get(roomCode).gameHandler;
    }
    
    broadcastToRoom(roomCode, message, excludeWs = null) {
        if (!this.rooms.has(roomCode)) {
            return;
        }
        
        const playerIds = this.roomPlayers.get(roomCode);
        const messageStr = JSON.stringify(message);
        
        playerIds.forEach(playerId => {
            const ws = this.playerConnections.get(playerId);
            if (ws && ws !== excludeWs && ws.readyState === 1) { // 1 = OPEN
                ws.send(messageStr);
            }
        });
    }
    
    updateGames() {
        this.rooms.forEach((room, roomCode) => {
            if (room.gameActive && room.gameHandler) {
                room.gameHandler.update();
                
                // Broadcast game state to all players in the room
                const gameState = room.gameHandler.getGameState();
                this.broadcastToRoom(roomCode, {
                    type: 'game_state',
                    ...gameState
                });
                
                // Check if game ended
                if (room.gameHandler.isGameEnded()) {
                    this.broadcastToRoom(roomCode, {
                        type: 'game_end'
                    });
                    room.gameActive = false;
                    room.gameHandler = null;
                    console.log(`Game ended in room ${roomCode}`);
                }
                
                room.lastActivity = Date.now();
            }
        });
    }
    
    cleanupInactiveRooms() {
        const now = Date.now();
        const inactiveThreshold = 5 * 60 * 1000; // 5 minutes
        
        for (const [roomCode, room] of this.rooms.entries()) {
            if (now - room.lastActivity > inactiveThreshold) {
                console.log(`Cleaning up inactive room: ${roomCode}`);
                
                // Close all player connections in this room
                const playerIds = this.roomPlayers.get(roomCode);
                if (playerIds) {
                    playerIds.forEach(playerId => {
                        const ws = this.playerConnections.get(playerId);
                        if (ws) {
                            ws.close();
                        }
                        this.playerConnections.delete(playerId);
                    });
                }
                
                // Remove room data
                this.rooms.delete(roomCode);
                this.roomPlayers.delete(roomCode);
            }
        }
    }
    
    // Debug method to list all rooms
    listRooms() {
        const roomList = [];
        this.rooms.forEach((room, roomCode) => {
            roomList.push({
                code: roomCode,
                playerCount: this.getPlayerCount(roomCode),
                gameActive: room.gameActive,
                lastActivity: room.lastActivity
            });
        });
        return roomList;
    }
}

module.exports = RoomManager;
