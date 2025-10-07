// Game Constants (matching the original Python constants)
const GAME_CONSTANTS = {
    W: 600,
    H: 600,
    FPS: 30,
    ENEMY_SPEED: 1.5,
    BULLET_SPEED: 15,
    MAX_P_SPEED: 5,
    FALL_P_SPEED: 0.5,
    RISE_P_SPEED: 0.75,
    P_BAREER: 1,
    WAVES: 3,
    NUM_PER_WAVE: 4,
    COLOR_PER_WAVE: 1,
    WAVE_TIME: 5,
    MAXPLAYER: 3
};

// Game State
class GameState {
    constructor() {
        this.websocket = null;
        this.playerId = null;
        this.roomCode = null;
        this.gameStarted = false;
        this.score = 0;
        this.wave = 1;
        this.playerCount = 0;
        
        // Game objects
        this.players = [];
        this.bullets = [];
        this.enemies = [];
        this.tower = null;
        
        // Input state
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            l: false
        };
        
        // Canvas setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Asset loading
        this.assets = {};
        this.assetsLoaded = 0;
        this.totalAssets = 0;
        
        this.init();
    }
    
    async init() {
        await this.loadAssets();
        this.setupEventListeners();
        this.showScreen('lobby');
    }
    
    async loadAssets() {
        const assetList = [
            'pole.png', 'tower.png', 'player.png', 'player0.png', 'player1.png', 'player2.png',
            'enemy.png', 'enemy0.png', 'enemy1.png', 'enemy2.png',
            'bullet.png', 'bullet0.png', 'bullet1.png', 'bullet2.png'
        ];
        
        this.totalAssets = assetList.length;
        
        const loadPromises = assetList.map(name => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.assets[name] = img;
                    this.assetsLoaded++;
                    resolve();
                };
                img.onerror = reject;
                img.src = `assets/${name}`;
            });
        });
        
        await Promise.all(loadPromises);
        console.log('All assets loaded');
    }
    
    setupEventListeners() {
        // Lobby events
        document.getElementById('createRoom').addEventListener('click', () => this.createRoom());
        document.getElementById('joinRoom').addEventListener('click', () => this.joinRoom());
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        document.getElementById('leaveRoom').addEventListener('click', () => this.leaveRoom());
        document.getElementById('leaveGame').addEventListener('click', () => this.leaveGame());
        
        // Room code input
        document.getElementById('roomCode').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinRoom();
        });
        
        // Game input
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }
    
    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenName).classList.add('active');
    }
    
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    async createRoom() {
        // Check if already in a room
        if (this.roomCode) {
            alert('You are already in a room. Please leave first.');
            return;
        }
        
        this.roomCode = this.generateRoomCode();
        await this.connectToServer();
    }
    
    async joinRoom() {
        // Check if already in a room
        if (this.roomCode) {
            alert('You are already in a room. Please leave first.');
            return;
        }
        
        const roomCode = document.getElementById('roomCode').value.toUpperCase();
        if (roomCode.length !== 6) {
            alert('Please enter a valid 6-character room code');
            return;
        }
        this.roomCode = roomCode;
        await this.connectToServer();
    }
    
    async connectToServer() {
        this.showScreen('loading');
        
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        const port = window.location.port || '3000';
        
        try {
            this.websocket = new WebSocket(`${protocol}//${host}:${port}`);
            
            this.websocket.onopen = () => {
                console.log('Connected to server');
                this.sendMessage({
                    type: 'join_room',
                    roomCode: this.roomCode
                });
            };
            
            this.websocket.onmessage = (event) => {
                this.handleServerMessage(JSON.parse(event.data));
            };
            
            this.websocket.onclose = () => {
                console.log('Disconnected from server');
                this.showScreen('lobby');
                alert('Connection lost. Please try again.');
            };
            
            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.showScreen('lobby');
                alert('Failed to connect to server. Please try again.');
            };
            
        } catch (error) {
            console.error('Connection error:', error);
            this.showScreen('lobby');
            alert('Failed to connect to server. Please try again.');
        }
    }
    
    sendMessage(message) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(message));
        }
    }
    
    handleServerMessage(message) {
        switch (message.type) {
            case 'room_joined':
                this.playerId = message.playerId;
                this.updateRoomInfo(message);
                this.showScreen('lobby');
                break;
                
            case 'room_update':
                this.updateRoomInfo(message);
                break;
                
            case 'room_left':
                this.resetRoomState();
                this.showScreen('lobby');
                break;
                
            case 'game_start':
                this.gameStarted = true;
                this.showScreen('game');
                this.gameLoop();
                break;
                
            case 'game_state':
                this.updateGameState(message);
                break;
                
            case 'game_end':
                this.gameStarted = false;
                alert('Game ended!');
                this.showScreen('lobby');
                break;
                
            case 'error':
                alert(message.message);
                this.showScreen('lobby');
                break;
        }
    }
    
    updateRoomInfo(message) {
        document.getElementById('currentRoomCode').textContent = this.roomCode;
        document.getElementById('playerCount').textContent = message.playerCount;
        document.getElementById('roomStatus').textContent = message.status;
        
        const roomInfo = document.getElementById('roomInfo');
        const startButton = document.getElementById('startGame');
        const joinButton = document.getElementById('joinRoom');
        const createButton = document.getElementById('createRoom');
        const roomCodeInput = document.getElementById('roomCode');
        
        roomInfo.classList.remove('hidden');
        
        // Disable join/create buttons when in a room
        joinButton.disabled = true;
        createButton.disabled = true;
        roomCodeInput.disabled = true;
        
        if (message.canStart) {
            startButton.classList.remove('hidden');
        } else {
            startButton.classList.add('hidden');
        }
    }
    
    startGame() {
        this.sendMessage({
            type: 'start_game'
        });
    }
    
    leaveRoom() {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.sendMessage({
                type: 'leave_room'
            });
        }
        this.resetRoomState();
        this.showScreen('lobby');
    }
    
    leaveGame() {
        if (this.websocket) {
            this.websocket.close();
        }
        this.resetGameState();
        this.showScreen('lobby');
    }
    
    resetRoomState() {
        this.playerId = null;
        this.roomCode = null;
        this.gameStarted = false;
        
        // Re-enable join/create buttons when leaving room
        const joinButton = document.getElementById('joinRoom');
        const createButton = document.getElementById('createRoom');
        const roomCodeInput = document.getElementById('roomCode');
        const roomInfo = document.getElementById('roomInfo');
        
        joinButton.disabled = false;
        createButton.disabled = false;
        roomCodeInput.disabled = false;
        roomInfo.classList.add('hidden');
        
        // Clear room code input
        roomCodeInput.value = '';
    }
    
    resetGameState() {
        this.gameStarted = false;
        this.score = 0;
        this.wave = 1;
        this.players = [];
        this.bullets = [];
        this.enemies = [];
        this.tower = null;
    }
    
    handleKeyDown(event) {
        if (!this.gameStarted) return;
        
        const key = event.key.toLowerCase();
        if (this.keys.hasOwnProperty(key)) {
            this.keys[key] = true;
            this.sendInput();
        }
    }
    
    handleKeyUp(event) {
        if (!this.gameStarted) return;
        
        const key = event.key.toLowerCase();
        if (this.keys.hasOwnProperty(key)) {
            this.keys[key] = false;
            this.sendInput();
        }
    }
    
    sendInput() {
        this.sendMessage({
            type: 'input',
            keys: this.keys
        });
    }
    
    updateGameState(message) {
        this.score = message.score || 0;
        this.wave = message.wave || 1;
        this.lives = message.lives || 3;
        this.playerCount = message.playerCount || 0;
        
        // Update game objects
        this.players = message.players || [];
        this.bullets = message.bullets || [];
        this.enemies = message.enemies || [];
        this.tower = message.tower;
        
        // Update UI
        document.getElementById('score').textContent = this.score;
        document.getElementById('wave').textContent = this.wave;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('gamePlayerCount').textContent = this.playerCount;
    }
    
    gameLoop() {
        if (!this.gameStarted) return;
        
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, GAME_CONSTANTS.W, GAME_CONSTANTS.H);
        
        // Draw background
        if (this.assets['pole.png']) {
            this.ctx.drawImage(this.assets['pole.png'], 0, 0);
        }
        
        // Draw tower
        if (this.tower && this.assets['tower.png']) {
            this.ctx.drawImage(this.assets['tower.png'], this.tower.x, this.tower.y);
        }
        
        // Draw players
        this.players.forEach(player => {
            const assetName = `player${player.idx}.png`;
            if (this.assets[assetName]) {
                this.ctx.save();
                this.ctx.translate(player.x + player.size/2, player.y + player.size/2);
                this.ctx.rotate(-player.alpha); // Invert the rotation to fix left/right direction
                this.ctx.drawImage(this.assets[assetName], -player.size/2, -player.size/2);
                this.ctx.restore();
            }
        });
        
        // Draw bullets
        this.bullets.forEach(bullet => {
            const assetName = `bullet${bullet.idx}.png`;
            if (this.assets[assetName]) {
                this.ctx.save();
                this.ctx.translate(bullet.x + bullet.size, bullet.y + bullet.size);
                this.ctx.rotate(bullet.alpha);
                this.ctx.drawImage(this.assets[assetName], -bullet.size, -bullet.size);
                this.ctx.restore();
            }
        });
        
        // Draw enemies
        this.enemies.forEach(enemy => {
            const assetName = `enemy${enemy.idx}.png`;
            if (this.assets[assetName]) {
                this.ctx.drawImage(this.assets[assetName], enemy.x, enemy.y);
            }
        });
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GameState();
});
