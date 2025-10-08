import { GAME_CONSTANTS } from '../constants';
import type { BulletState, EnemyState, GameState, InputState, PlayerState } from '../types';

class Player {
  public x: number;
  public y: number;
  public readonly idx: number;
  public readonly size = 50;
  public readonly center: [number, number] = [this.size / 2, this.size / 2];
  private dx = 0;
  private dy = 0;
  private curDx = 0;
  private curDy = 0;
  private moveDown = false;
  private moveUp = false;
  private moveLeft = false;
  private moveRight = false;
  public alpha = 0;

  constructor(x: number, y: number, idx: number) {
    this.x = x;
    this.y = y;
    this.idx = idx;
  }

  public update(): void {
    if (this.moveLeft) {
      if (this.dx > -GAME_CONSTANTS.MAX_P_SPEED) {
        this.dx -= GAME_CONSTANTS.RISE_P_SPEED;
      }
    } else if (this.dx < 0) {
      this.dx += GAME_CONSTANTS.FALL_P_SPEED;
    }

    if (this.moveRight) {
      if (this.dx < GAME_CONSTANTS.MAX_P_SPEED) {
        this.dx += GAME_CONSTANTS.RISE_P_SPEED;
      }
    } else if (this.dx > 0) {
      this.dx -= GAME_CONSTANTS.FALL_P_SPEED;
    }

    if (this.moveUp) {
      if (this.dy > -GAME_CONSTANTS.MAX_P_SPEED) {
        this.dy -= GAME_CONSTANTS.RISE_P_SPEED;
      }
    } else if (this.dy < 0) {
      this.dy += GAME_CONSTANTS.FALL_P_SPEED;
    }

    if (this.moveDown) {
      if (this.dy < GAME_CONSTANTS.MAX_P_SPEED) {
        this.dy += GAME_CONSTANTS.RISE_P_SPEED;
      }
    } else if (this.dy > 0) {
      this.dy -= GAME_CONSTANTS.FALL_P_SPEED;
    }

    this.curDy = Math.abs(this.dy) <= 1 ? 0 : this.dy;
    this.curDx = Math.abs(this.dx) <= GAME_CONSTANTS.P_BAREER ? 0 : this.dx;

    if (this.curDx !== 0 || this.curDy !== 0) {
      this.alpha = Math.atan2(-this.curDy, this.curDx);
    }

    if (Number.isNaN(this.alpha)) {
      this.alpha = 0;
    }

    this.x += this.curDx;
    this.y += this.curDy;

    this.x = Math.max(this.x, 0);
    this.x = Math.min(this.x, GAME_CONSTANTS.W - this.size);
    this.y = Math.max(this.y, 0);
    this.y = Math.min(this.y, GAME_CONSTANTS.H - this.size);
  }

  public setInput(keys: InputState): void {
    this.moveUp = keys.w ?? false;
    this.moveDown = keys.s ?? false;
    this.moveLeft = keys.a ?? false;
    this.moveRight = keys.d ?? false;
  }

  public canShoot(): boolean {
    return this.curDx !== 0 || this.curDy !== 0;
  }

  public getMovementVector(): { dx: number; dy: number } {
    return { dx: this.curDx, dy: this.curDy };
  }

  public reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.curDx = 0;
    this.curDy = 0;
    this.alpha = 0;
    this.moveDown = false;
    this.moveUp = false;
    this.moveLeft = false;
    this.moveRight = false;
  }
}

class Bullet {
  public x: number;
  public y: number;
  public readonly idx: number;
  public readonly size = 5;
  public readonly center: [number, number] = [this.size, this.size];
  public readonly alpha: number;
  private readonly dx: number;
  private readonly dy: number;

  constructor(x: number, y: number, idx: number, alpha: number) {
    this.x = x;
    this.y = y;
    this.idx = idx;
    this.alpha = alpha;
    const speed = GAME_CONSTANTS.BULLET_SPEED;
    this.dx = speed * Math.cos(alpha);
    this.dy = speed * Math.sin(alpha);
  }

  public update(): void {
    this.x += this.dx;
    this.y += this.dy;
  }

  public isOutOfBounds(): boolean {
    return (
      this.x < 0 ||
      this.y < 0 ||
      this.x >= GAME_CONSTANTS.W ||
      this.y >= GAME_CONSTANTS.H
    );
  }
}

class Tower {
  public readonly size = 50;
  public readonly center: [number, number] = [this.size / 2, this.size / 2];
  public readonly x = GAME_CONSTANTS.W / 2 - this.size / 2;
  public readonly y = GAME_CONSTANTS.H / 2 - this.size / 2;
}

class Enemy {
  public x: number;
  public y: number;
  public readonly idx: string;
  public readonly size = 20;
  public readonly center: [number, number] = [this.size, this.size];
  private readonly tower: Tower;
  private readonly dx: number;
  private readonly dy: number;

  constructor(x: number, y: number, tower: Tower, idx: string) {
    this.x = x;
    this.y = y;
    this.idx = idx;
    this.tower = tower;

    const dx = tower.x + tower.center[0] - this.x - this.center[0];
    const dy = tower.y + tower.center[1] - this.y - this.center[1];
    const distance = Math.hypot(dx, dy) || 1;

    this.dx = (GAME_CONSTANTS.ENEMY_SPEED * dx) / distance;
    this.dy = (GAME_CONSTANTS.ENEMY_SPEED * dy) / distance;
  }

  public update(): void {
    const distanceToTower = this.distanceToTower(this.tower);
    const nearBaseThreshold = 150;

    let speedMultiplier = 1.0;
    if (distanceToTower < nearBaseThreshold) {
      speedMultiplier = 0.3 + (distanceToTower / nearBaseThreshold) * 0.7;
    }

    this.x += this.dx * speedMultiplier;
    this.y += this.dy * speedMultiplier;
  }

  public distanceToTower(tower: Tower): number {
    const dx = tower.x + tower.center[0] - this.x - this.center[0];
    const dy = tower.y + tower.center[1] - this.y - this.center[1];
    return Math.hypot(dx, dy);
  }
}

export class GameLogic {
  private readonly players: Player[];
  private readonly bullets: Bullet[] = [];
  private readonly enemies: Enemy[] = [];
  private readonly tower = new Tower();
  private score = 0;
  private wave = 1;
  private currentRate = 0;
  private gameEnded = false;
  private lives = 3;

  constructor(playerIds: number[]) {
    this.players = playerIds.map((id, index) => new Player(100 + index * 120, 100 + index * 120, id));
  }

  public handleInput(playerId: number, keys: InputState): void {
    const player = this.players.find((p) => p.idx === playerId);
    if (!player) {
      return;
    }

    player.setInput(keys);

    if (keys.l && player.canShoot()) {
      const { dx, dy } = player.getMovementVector();
      const bulletAlpha = Math.atan2(dy, dx);
      const bulletOffset = 30;
      const bulletX = player.x + player.center[0] + Math.cos(bulletAlpha) * bulletOffset;
      const bulletY = player.y + player.center[1] + Math.sin(bulletAlpha) * bulletOffset;
      const bullet = new Bullet(bulletX, bulletY, player.idx, bulletAlpha);
      this.bullets.push(bullet);
    }
  }

  public update(): void {
    this.players.forEach((player) => player.update());

    for (let i = this.bullets.length - 1; i >= 0; i -= 1) {
      const bullet = this.bullets[i];
      bullet.update();
      if (bullet.isOutOfBounds()) {
        this.bullets.splice(i, 1);
      }
    }

    this.enemies.forEach((enemy) => enemy.update());

    for (let i = this.bullets.length - 1; i >= 0; i -= 1) {
      const bullet = this.bullets[i];
      for (let j = this.enemies.length - 1; j >= 0; j -= 1) {
        const enemy = this.enemies[j];
        const dx = bullet.x + bullet.center[0] - enemy.x - enemy.center[0];
        const dy = bullet.y + bullet.center[1] - enemy.y - enemy.center[1];
        const distance = Math.hypot(dx, dy);

        if (distance < bullet.size + enemy.size) {
          if (enemy.idx === '' || enemy.idx === bullet.idx.toString()) {
            this.bullets.splice(i, 1);
            this.enemies.splice(j, 1);
            this.score += 1;
            break;
          }
        }
      }
    }

    for (let i = this.enemies.length - 1; i >= 0; i -= 1) {
      const enemy = this.enemies[i];
      const distance = enemy.distanceToTower(this.tower);
      if (distance < enemy.size + this.tower.size - 10) {
        this.enemies.splice(i, 1);
        this.lives -= 1;
        if (this.lives <= 0) {
          this.gameEnded = true;
        }
      }
    }

    this.currentRate += 1;
    if (this.currentRate >= GAME_CONSTANTS.WAVE_TIME * GAME_CONSTANTS.FPS) {
      this.spawnWave();
      this.currentRate = 0;
    }
  }

  private spawnWave(): void {
    const cnt = Math.floor((this.wave + GAME_CONSTANTS.WAVES - 1) / GAME_CONSTANTS.WAVES);

    for (let j = 0; j < this.players.length; j += 1) {
      for (let i = 0; i < cnt * GAME_CONSTANTS.COLOR_PER_WAVE; i += 1) {
        this.spawnEnemy(j.toString());
      }
    }

    for (let i = 0; i < cnt * GAME_CONSTANTS.NUM_PER_WAVE; i += 1) {
      this.spawnEnemy('');
    }

    this.wave += 1;
  }

  private spawnEnemy(idx: string): void {
    const dist = GAME_CONSTANTS.W * 2;
    const distX = Math.random() * dist * 2 - dist;
    const minus = Math.random() < 0.5 ? 1 : -1;
    const distY = minus * Math.sqrt(Math.max(dist * dist - distX * distX, 0));

    const enemy = new Enemy(distX, distY, this.tower, idx);
    this.enemies.push(enemy);
  }

  public getGameState(): GameState {
    const players: PlayerState[] = this.players.map((player) => ({
      x: Math.floor(player.x),
      y: Math.floor(player.y),
      alpha: Number(player.alpha.toFixed(3)),
      idx: player.idx,
      size: player.size,
    }));

    const bullets: BulletState[] = this.bullets.map((bullet) => ({
      x: Math.floor(bullet.x),
      y: Math.floor(bullet.y),
      alpha: Number(bullet.alpha.toFixed(3)),
      idx: bullet.idx,
      size: bullet.size,
    }));

    const enemies: EnemyState[] = this.enemies.map((enemy) => ({
      x: Math.floor(enemy.x),
      y: Math.floor(enemy.y),
      idx: enemy.idx,
      size: enemy.size,
    }));

    return {
      players,
      bullets,
      enemies,
      tower: {
        x: this.tower.x,
        y: this.tower.y,
        size: this.tower.size,
        center: this.tower.center,
      },
      score: this.score,
      wave: this.wave,
      lives: this.lives,
      playerCount: this.players.length,
    };
  }

  public isGameEnded(): boolean {
    return this.gameEnded;
  }

  public resetForNewRun(): void {
    this.bullets.splice(0, this.bullets.length);
    this.enemies.splice(0, this.enemies.length);
    this.score = 0;
    this.wave = 1;
    this.currentRate = 0;
    this.gameEnded = false;
    this.lives = 3;
    this.players.forEach((player, index) => {
      player.reset(100 + index * 120, 100 + index * 120);
    });
  }
}
