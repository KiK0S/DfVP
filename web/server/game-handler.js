// Game constants (matching the original Python constants)
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
    WAVE_TIME: 5
};

class Player {
    constructor(x, y, idx) {
        this.x = x;
        this.y = y;
        this.idx = idx;
        this.size = 50;
        this.center = [this.size / 2, this.size / 2];
        this.dx = 0;
        this.dy = 0;
        this.cur_dx = 0;
        this.cur_dy = 0;
        this.move_down = false;
        this.move_up = false;
        this.move_left = false;
        this.move_right = false;
        this.alpha = 0;
    }
    
    update() {
        // Handle movement input
        if (this.move_left) {
            if (this.dx > -GAME_CONSTANTS.MAX_P_SPEED) {
                this.dx -= GAME_CONSTANTS.RISE_P_SPEED;
            }
        } else {
            if (this.dx < 0) {
                this.dx += GAME_CONSTANTS.FALL_P_SPEED;
            }
        }
        
        if (this.move_right) {
            if (this.dx < GAME_CONSTANTS.MAX_P_SPEED) {
                this.dx += GAME_CONSTANTS.RISE_P_SPEED;
            }
        } else {
            if (this.dx > 0) {
                this.dx -= GAME_CONSTANTS.FALL_P_SPEED;
            }
        }
        
        if (this.move_up) {
            if (this.dy > -GAME_CONSTANTS.MAX_P_SPEED) {
                this.dy -= GAME_CONSTANTS.RISE_P_SPEED;
            }
        } else {
            if (this.dy < 0) {
                this.dy += GAME_CONSTANTS.FALL_P_SPEED;
            }
        }
        
        if (this.move_down) {
            if (this.dy < GAME_CONSTANTS.MAX_P_SPEED) {
                this.dy += GAME_CONSTANTS.RISE_P_SPEED;
            }
        } else {
            if (this.dy > 0) {
                this.dy -= GAME_CONSTANTS.FALL_P_SPEED;
            }
        }
        
        // Calculate current movement
        this.cur_dx = 0;
        this.cur_dy = 0;
        
        if (Math.abs(this.dy) <= 1) {
            this.cur_dy = 0;
        } else {
            this.cur_dy = this.dy;
        }
        
        if (Math.abs(this.dx) <= GAME_CONSTANTS.P_BAREER) {
            this.cur_dx = 0;
        } else {
            this.cur_dx = this.dx;
        }
        
        // Calculate rotation
        if (this.cur_dx === 0 && this.cur_dy === 0) {
            // No movement, keep current rotation
        } else {
            this.alpha = Math.atan2(-this.cur_dy, this.cur_dx);
        }
        
        // Ensure alpha is always valid (not NaN)
        if (isNaN(this.alpha)) {
            this.alpha = 0;
        }
        
        // Update position
        this.x += this.cur_dx;
        this.y += this.cur_dy;
        
        // Keep player within bounds
        this.x = Math.max(this.x, 0);
        this.x = Math.min(this.x, GAME_CONSTANTS.W - this.size);
        this.y = Math.max(this.y, 0);
        this.y = Math.min(this.y, GAME_CONSTANTS.H - this.size);
    }
    
    setInput(keys) {
        this.move_up = keys.w || false;
        this.move_down = keys.s || false;
        this.move_left = keys.a || false;
        this.move_right = keys.d || false;
    }
    
    canShoot() {
        return this.cur_dx !== 0 || this.cur_dy !== 0;
    }
}

class Bullet {
    constructor(x, y, idx, alpha) {
        this.x = x;
        this.y = y;
        this.idx = idx;
        this.size = 5;
        this.alpha = alpha;
        this.speed = GAME_CONSTANTS.BULLET_SPEED;
        this.center = [this.size, this.size];
        this.dx = this.speed * Math.cos(alpha);
        this.dy = this.speed * Math.sin(alpha);
    }
    
    update() {
        this.x += this.dx;
        this.y += this.dy;
    }
    
    isOutOfBounds() {
        return this.x < 0 || this.y < 0 || 
               this.x >= GAME_CONSTANTS.W || this.y >= GAME_CONSTANTS.H;
    }
}

class Enemy {
    constructor(x, y, tower, idx) {
        this.x = x;
        this.y = y;
        this.idx = idx;
        this.size = 20;
        this.center = [this.size, this.size];
        this.baseSpeed = GAME_CONSTANTS.ENEMY_SPEED;
        this.tower = tower;
        
        // Calculate direction towards tower
        const dx = tower.x + tower.center[0] - this.x - this.center[0];
        const dy = tower.y + tower.center[1] - this.y - this.center[1];
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.dx = this.baseSpeed * dx / distance;
        this.dy = this.baseSpeed * dy / distance;
    }
    
    update() {
        // Slow down when near the tower
        const distanceToTower = this.distanceToTower(this.tower);
        const nearBaseThreshold = 150; // Distance where enemies start slowing down
        
        let speedMultiplier = 1.0;
        if (distanceToTower < nearBaseThreshold) {
            // Gradually slow down as they get closer to the tower
            speedMultiplier = 0.3 + (distanceToTower / nearBaseThreshold) * 0.7;
        }
        
        this.x += this.dx * speedMultiplier;
        this.y += this.dy * speedMultiplier;
    }
    
    distanceToTower(tower) {
        const dx = tower.x + tower.center[0] - this.x - this.center[0];
        const dy = tower.y + tower.center[1] - this.y - this.center[1];
        return Math.sqrt(dx * dx + dy * dy);
    }
}

class Tower {
    constructor() {
        this.size = 50;
        this.center = [this.size / 2, this.size / 2];
        this.x = GAME_CONSTANTS.W / 2 - this.size / 2;
        this.y = GAME_CONSTANTS.H / 2 - this.size / 2;
    }
}

class GameHandler {
    constructor(playerIds) {
        this.playerIds = playerIds;
        this.players = playerIds.map(id => new Player(100 + id * 100, 100 + id * 100, id));
        this.bullets = [];
        this.enemies = [];
        this.tower = new Tower();
        this.score = 0;
        this.wave = 1;
        this.currentRate = 0;
        this.gameEnded = false;
        this.lives = 3; // Add 3 lives system
        this.playerInputs = new Map(); // playerId -> input state
    }
    
    handleInput(playerId, keys) {
        this.playerInputs.set(playerId, keys);
        
        const player = this.players.find(p => p.idx === playerId);
        if (player) {
            player.setInput(keys);
            
            // Handle shooting
            if (keys.l && player.canShoot()) {
                // Use the same direction calculation as the original Python code
                const bulletAlpha = Math.atan2(player.cur_dy, player.cur_dx);
                
                // Create bullet in front of the player (in the direction they're facing)
                const bulletOffset = 30; // Distance in front of player
                const bulletX = player.x + player.center[0] + Math.cos(bulletAlpha) * bulletOffset;
                const bulletY = player.y + player.center[1] + Math.sin(bulletAlpha) * bulletOffset;
                
                const bullet = new Bullet(
                    bulletX,
                    bulletY,
                    player.idx,
                    bulletAlpha
                );
                this.bullets.push(bullet);
            }
        }
    }
    
    update() {
        // Update players
        this.players.forEach(player => {
            player.update();
        });
        
        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            return !bullet.isOutOfBounds();
        });
        
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update();
        });
        
        // Check bullet-enemy collisions
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                const dx = bullet.x + bullet.center[0] - enemy.x - enemy.center[0];
                const dy = bullet.y + bullet.center[1] - enemy.y - enemy.center[1];
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < bullet.size + enemy.size) {
                    // Check if bullet can hit this enemy
                    if (bullet.idx.toString() === enemy.idx.toString() || enemy.idx === '') {
                        this.bullets.splice(i, 1);
                        this.enemies.splice(j, 1);
                        this.score++;
                        break;
                    }
                }
            }
        }
        
        // Check enemy-tower collisions
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const distance = enemy.distanceToTower(this.tower);
            
            if (distance < enemy.size + this.tower.size - 10) {
                this.enemies.splice(i, 1);
                this.lives--; // Lose a life instead of ending game immediately
                
                if (this.lives <= 0) {
                    this.gameEnded = true;
                }
                break;
            }
        }
        
        // Spawn enemies in waves
        this.currentRate++;
        if (this.currentRate >= GAME_CONSTANTS.WAVE_TIME * GAME_CONSTANTS.FPS) {
            this.spawnWave();
            this.currentRate = 0;
        }
    }
    
    spawnWave() {
        const cnt = Math.floor((this.wave + GAME_CONSTANTS.WAVES - 1) / GAME_CONSTANTS.WAVES);
        
        // Spawn colored enemies (targeting specific players)
        for (let j = 0; j < this.players.length; j++) {
            for (let i = 0; i < cnt * GAME_CONSTANTS.COLOR_PER_WAVE; i++) {
                this.spawnEnemy(j.toString());
            }
        }
        
        // Spawn neutral enemies
        for (let i = 0; i < cnt * GAME_CONSTANTS.NUM_PER_WAVE; i++) {
            this.spawnEnemy('');
        }
        
        this.wave++;
    }
    
    spawnEnemy(idx) {
        const dist = GAME_CONSTANTS.W * 2;
        const dist_x = Math.random() * dist * 2 - dist;
        const minus = Math.random() < 0.5 ? 1 : -1;
        const dist_y = minus * Math.sqrt(dist * dist - dist_x * dist_x);
        
        const enemy = new Enemy(dist_x, dist_y, this.tower, idx);
        this.enemies.push(enemy);
    }
    
    getGameState() {
        return {
            players: this.players.map(player => ({
                x: Math.floor(player.x),
                y: Math.floor(player.y),
                alpha: parseFloat((player.alpha * 1000 / 1000).toFixed(3)),
                idx: player.idx,
                size: player.size
            })),
            bullets: this.bullets.map(bullet => ({
                x: Math.floor(bullet.x),
                y: Math.floor(bullet.y),
                alpha: parseFloat((bullet.alpha * 1000 / 1000).toFixed(3)),
                idx: bullet.idx,
                size: bullet.size
            })),
            enemies: this.enemies.map(enemy => ({
                x: Math.floor(enemy.x),
                y: Math.floor(enemy.y),
                idx: enemy.idx,
                size: enemy.size
            })),
            tower: {
                x: this.tower.x,
                y: this.tower.y,
                size: this.tower.size,
                center: this.tower.center
            },
            score: this.score,
            wave: this.wave,
            lives: this.lives,
            playerCount: this.players.length
        };
    }
    
    isGameEnded() {
        return this.gameEnded;
    }
}

module.exports = GameHandler;
