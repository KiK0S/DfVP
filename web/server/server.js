const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const RoomManager = require('./room-manager');

const GAME_TICK_MS = 1000 / 30;
const CLEANUP_INTERVAL_MS = 60_000;

/**
 * Create an Express/WebSocket server instance for DfVP multiplayer rooms.
 *
 * @param {object} [options]
 * @param {number} [options.port]
 * @param {string} [options.host]
 * @param {boolean} [options.serveStatic=true]
 * @param {string|null} [options.staticDir]
 * @param {(info: { port: number, host: string }) => void} [options.onReady]
 */
function createRoomServer(options = {}) {
  const {
    port = Number(process.env.PORT) || 3000,
    host = process.env.HOST || '127.0.0.1',
    serveStatic = true,
    staticDir: staticDirOption = null,
    onReady,
  } = options;

  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });

  const clientRoot = path.join(__dirname, '../client');
  const distDir = path.join(clientRoot, 'dist');

  let staticDir = null;
  if (serveStatic) {
    if (staticDirOption) {
      staticDir = staticDirOption;
    } else if (fs.existsSync(distDir)) {
      staticDir = distDir;
    } else if (fs.existsSync(clientRoot)) {
      staticDir = clientRoot;
    }
  }

  if (serveStatic && staticDir && fs.existsSync(staticDir)) {
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
  } else {
    app.get('/', (_req, res) => {
      res.type('text/plain').send('DfVP room server is running.');
    });
  }

  const roomManager = new RoomManager();

  wss.on('connection', (ws) => {
    console.log(`[dfvp-room] client connected from ${ws._socket?.remoteAddress || 'unknown'}`);

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
            console.log('[dfvp-room] Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('[dfvp-room] Error parsing message:', error);
        sendError(ws, 'Invalid message format');
      }
    });

    ws.on('close', () => {
      console.log('[dfvp-room] client disconnected');
      if (ws.roomCode && ws.playerId !== null) {
        roomManager.removePlayer(ws.roomCode, ws.playerId);
      }
    });

    function handleJoinRoom(socket, data) {
      const { roomCode: requestedRoom } = data;

      if (socket.roomCode) {
        sendError(socket, 'Already in a room. Please leave first.');
        return;
      }

      if (!roomManager.roomExists(requestedRoom)) {
        roomManager.createRoom(requestedRoom);
      }

      const joinResult = roomManager.addPlayer(requestedRoom, socket);

      if (joinResult.success) {
        socket.roomCode = requestedRoom;
        socket.playerId = joinResult.playerId;

        socket.send(
          JSON.stringify({
            type: 'room_joined',
            playerId: socket.playerId,
            roomCode: socket.roomCode,
            playerCount: roomManager.getPlayerCount(socket.roomCode),
            status: 'Waiting for players...',
            canStart: roomManager.canStartGame(socket.roomCode),
          }),
        );

        roomManager.broadcastToRoom(
          socket.roomCode,
          {
            type: 'room_update',
            playerCount: roomManager.getPlayerCount(socket.roomCode),
            status: 'Player joined',
            canStart: roomManager.canStartGame(socket.roomCode),
          },
          socket,
        );
      } else {
        sendError(socket, joinResult.error);
      }
    }

    function handleLeaveRoom(socket) {
      if (!socket.roomCode) {
        sendError(socket, 'Not in a room');
        return;
      }

      const roomCode = socket.roomCode;
      const playerId = socket.playerId;

      roomManager.removePlayer(roomCode, playerId);

      socket.roomCode = null;
      socket.playerId = null;

      socket.send(
        JSON.stringify({
          type: 'room_left',
        }),
      );

      console.log(`[dfvp-room] player ${playerId} left room ${roomCode}`);
    }

    function handleStartGame(socket) {
      if (!socket.roomCode) {
        sendError(socket, 'Not in a room');
        return;
      }

      const canStart = roomManager.canStartGame(socket.roomCode);
      if (!canStart) {
        sendError(socket, 'Cannot start game - need at least 1 player');
        return;
      }

      roomManager.startGame(socket.roomCode);

      roomManager.broadcastToRoom(socket.roomCode, {
        type: 'game_start',
      });

      console.log(`[dfvp-room] game started in room ${socket.roomCode}`);
    }

    function handleInput(socket, data) {
      if (!socket.roomCode || socket.playerId === null) {
        return;
      }

      const gameHandler = roomManager.getGameHandler(socket.roomCode);
      if (gameHandler) {
        gameHandler.handleInput(socket.playerId, data.keys);
      }
    }

    function sendError(socket, message) {
      socket.send(
        JSON.stringify({
          type: 'error',
          message,
        }),
      );
    }
  });

  const gameLoop = setInterval(() => {
    roomManager.updateGames();
  }, GAME_TICK_MS);

  const cleanupLoop = setInterval(() => {
    roomManager.cleanupInactiveRooms();
  }, CLEANUP_INTERVAL_MS);

  server.on('close', () => {
    clearInterval(gameLoop);
    clearInterval(cleanupLoop);
  });

  return {
    app,
    server,
    wss,
    roomManager,
    options: { port, host, serveStatic, staticDir },
    start() {
      return new Promise((resolve) => {
        server.listen(port, host, () => {
          const info = { port, host };
          if (typeof onReady === 'function') {
            onReady(info);
          } else {
            const displayHost = host === '0.0.0.0' ? 'localhost' : host;
            console.log(`[dfvp-room] listening on http://${displayHost}:${port}`);
            console.log(`[dfvp-room] WebSocket endpoint ws://${displayHost}:${port}`);
          }
          resolve(info);
        });
      });
    },
  };
}

function startRoomServer(options = {}) {
  const roomServer = createRoomServer(options);
  roomServer.start();
  return roomServer;
}

module.exports = {
  createRoomServer,
  startRoomServer,
};

if (require.main === module) {
  startRoomServer();
}
