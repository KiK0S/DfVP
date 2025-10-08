import {
  Application,
  Container,
  Graphics,
  Sprite,
  Text,
  TextStyle,
  Texture,
} from 'pixi.js';
import { GAME_CONSTANTS } from './constants';
import type { GameState, PlayerState, EnemyState, BulletState } from './types';

class PlayerView {
  public readonly sprite: Sprite;
  public readonly label: Text;
  private isLocal = false;

  constructor(idx: number, private readonly textureAliases: Set<string>) {
    const texture = this.resolveTexture(idx);
    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(0.85);

    const style = new TextStyle({
      fill: 0xe2e8f0,
      fontSize: 14,
      fontFamily: 'Inter, sans-serif',
      fontWeight: '700',
      dropShadow: true,
      dropShadowColor: '#0f172a',
      dropShadowDistance: 2,
      dropShadowBlur: 2,
    });
    this.label = new Text(`P${idx + 1}`, style);
    this.label.anchor.set(0.5, 1.4);
  }

  public update(state: PlayerState): void {
    const centerX = state.x + state.size / 2;
    const centerY = state.y + state.size / 2;
    this.sprite.position.set(centerX, centerY);
    this.sprite.rotation = -state.alpha;
    this.label.position.set(centerX, centerY);
  }

  public setLocal(local: boolean): void {
    if (local === this.isLocal) {
      return;
    }

    this.isLocal = local;
    this.sprite.tint = local ? 0xffffff : 0xbfd7ff;
    this.sprite.scale.set(local ? 0.95 : 0.85);
  }

  public destroy(): void {
    this.sprite.destroy();
    this.label.destroy();
  }

  private resolveTexture(idx: number): Texture {
    const alias = `player${idx}`;
    if (this.textureAliases.has(alias)) {
      const texture = Texture.from(alias);
      if (texture.baseTexture.valid) {
        return texture;
      }
    }
    return Texture.from('player');
  }
}

function resolveBulletTexture(state: BulletState, aliases: Set<string>): Texture {
  const alias = `bullet${state.idx}`;
  if (aliases.has(alias)) {
    const texture = Texture.from(alias);
    if (texture.baseTexture.valid) {
      return texture;
    }
  }
  return Texture.from('bullet');
}

function resolveEnemyTexture(state: EnemyState, aliases: Set<string>): Texture {
  const alias = state.idx ? `enemy${state.idx}` : 'enemy';
  if (aliases.has(alias)) {
    const texture = Texture.from(alias);
    if (texture.baseTexture.valid) {
      return texture;
    }
  }
  return Texture.from('enemy');
}

export class GameScene {
  private readonly container: Container;
  private readonly playfield: Container;
  private readonly overlay: Graphics;
  private towerSprite: Sprite | null = null;
  private readonly players = new Map<number, PlayerView>();
  private bulletSprites: Sprite[] = [];
  private enemySprites: Sprite[] = [];
  private localPlayerId: number | null = null;

  constructor(
    private readonly app: Application,
    private readonly textureAliases: Set<string>,
  ) {
    this.container = new Container();
    this.playfield = new Container();
    this.overlay = new Graphics();

    this.setupBackground();
    this.container.addChild(this.playfield);
    this.container.addChild(this.overlay);
    this.app.stage.addChild(this.container);
  }

  public setLocalPlayerId(playerId: number | null): void {
    this.localPlayerId = playerId;
    this.players.forEach((view, id) => {
      view.setLocal(id === playerId);
    });
  }

  public clear(): void {
    this.players.forEach((view) => view.destroy());
    this.players.clear();

    this.bulletSprites.forEach((sprite) => sprite.destroy());
    this.enemySprites.forEach((sprite) => sprite.destroy());
    this.bulletSprites = [];
    this.enemySprites = [];

    if (this.towerSprite) {
      this.towerSprite.destroy();
      this.towerSprite = null;
    }
  }

  public updateState(state: GameState): void {
    this.ensureTower(state);
    this.syncPlayers(state.players);
    this.syncBullets(state.bullets);
    this.syncEnemies(state.enemies);
  }

  public destroy(): void {
    this.clear();
    this.overlay.destroy();
    this.playfield.destroy();
    this.container.destroy({ children: true });
  }

  private setupBackground(): void {
    const backgroundTexture = this.textureAliases.has('pole') ? Texture.from('pole') : null;

    if (backgroundTexture && backgroundTexture.baseTexture.valid) {
      const sprite = new Sprite(backgroundTexture);
      sprite.anchor.set(0.5);
      sprite.position.set(GAME_CONSTANTS.W / 2, GAME_CONSTANTS.H / 2);
      sprite.alpha = 0.95;
      this.container.addChild(sprite);
      sprite.zIndex = 0;
      this.playfield.zIndex = 1;
    } else {
      const fallback = new Graphics();
      fallback.roundRect(0, 0, GAME_CONSTANTS.W, GAME_CONSTANTS.H, 24);
      fallback.fill(0x0f172a);
      fallback.stroke({ color: 0x1e293b, width: 4, alpha: 0.9 });
      this.container.addChild(fallback);
    }

    this.overlay.clear();
    this.overlay.roundRect(0, 0, GAME_CONSTANTS.W, GAME_CONSTANTS.H, 24);
    this.overlay.stroke({ color: 0x334155, width: 4, alpha: 0.7 });
    this.overlay.alpha = 0.9;
  }

  private ensureTower(state: GameState): void {
    if (!this.towerSprite) {
      const texture = this.textureAliases.has('tower') ? Texture.from('tower') : null;
      if (texture && texture.baseTexture.valid) {
        this.towerSprite = new Sprite(texture);
        this.towerSprite.anchor.set(0.5);
        this.towerSprite.position.set(state.tower.x + state.tower.size / 2, state.tower.y + state.tower.size / 2);
        this.towerSprite.scale.set(0.85);
        this.playfield.addChild(this.towerSprite);
      } else {
        const fallback = new Graphics();
        fallback.circle(0, 0, state.tower.size / 2);
        fallback.fill(0x38bdf8);
        fallback.alpha = 0.75;
        const texture = this.app.renderer.generateTexture(fallback);
        this.towerSprite = new Sprite(texture);
        this.towerSprite.anchor.set(0.5);
        this.towerSprite.position.set(state.tower.x + state.tower.size / 2, state.tower.y + state.tower.size / 2);
        this.playfield.addChild(this.towerSprite);
        fallback.destroy();
      }
    }
  }

  private syncPlayers(players: PlayerState[]): void {
    const seen = new Set<number>();

    players.forEach((playerState) => {
      let view = this.players.get(playerState.idx);
      if (!view) {
        view = new PlayerView(playerState.idx, this.textureAliases);
        this.players.set(playerState.idx, view);
        this.playfield.addChild(view.sprite);
        this.playfield.addChild(view.label);
      }
      view.update(playerState);
      view.setLocal(playerState.idx === this.localPlayerId);
      seen.add(playerState.idx);
    });

    this.players.forEach((view, id) => {
      if (!seen.has(id)) {
        view.destroy();
        this.players.delete(id);
      }
    });
  }

  private syncBullets(bullets: BulletState[]): void {
    this.syncSpriteList(
      bullets,
      this.bulletSprites,
      (state) => {
        const sprite = new Sprite(resolveBulletTexture(state, this.textureAliases));
        sprite.anchor.set(0.5);
        sprite.scale.set(0.8);
        this.playfield.addChild(sprite);
        return sprite;
      },
      (sprite, state) => {
        sprite.position.set(state.x + state.size / 2, state.y + state.size / 2);
        sprite.rotation = state.alpha;
      },
    );
  }

  private syncEnemies(enemies: EnemyState[]): void {
    this.syncSpriteList(
      enemies,
      this.enemySprites,
      (state) => {
        const sprite = new Sprite(resolveEnemyTexture(state, this.textureAliases));
        sprite.anchor.set(0.5);
        sprite.scale.set(1.05);
        this.playfield.addChild(sprite);
        return sprite;
      },
      (sprite, state) => {
        sprite.position.set(state.x + state.size / 2, state.y + state.size / 2);
      },
    );
  }

  private syncSpriteList<T>(
    stateList: T[],
    spritePool: Sprite[],
    factory: (state: T) => Sprite,
    updater: (sprite: Sprite, state: T) => void,
  ): void {
    for (let i = spritePool.length; i < stateList.length; i += 1) {
      const sprite = factory(stateList[i]);
      spritePool.push(sprite);
    }

    for (let i = 0; i < stateList.length; i += 1) {
      const sprite = spritePool[i];
      updater(sprite, stateList[i]);
      sprite.visible = true;
    }

    for (let i = spritePool.length - 1; i >= stateList.length; i -= 1) {
      const sprite = spritePool.pop();
      if (sprite) {
        sprite.destroy();
      }
    }
  }
}
