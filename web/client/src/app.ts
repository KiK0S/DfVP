import { Application, Assets } from 'pixi.js';
import { GAME_CONSTANTS } from './constants';
import { GameScene } from './gameScene';
import type { GameState, InputState, ScreenName, ServerMessage } from './types';
import { SoloGameRunner } from './engine/solo-runner';

const ASSET_FILES = [
  'pole.png',
  'tower.png',
  'player.png',
  'player0.png',
  'player1.png',
  'player2.png',
  'enemy.png',
  'enemy0.png',
  'enemy1.png',
  'enemy2.png',
  'bullet.png',
  'bullet0.png',
  'bullet1.png',
  'bullet2.png',
];

const KEY_BINDINGS: Record<string, keyof InputState> = {
  w: 'w',
  a: 'a',
  s: 's',
  d: 'd',
  l: 'l',
};

export class DfvpGame {
  private readonly root: HTMLElement;
  private pixiApp!: Application;
  private scene: GameScene | null = null;
  private soloRunner: SoloGameRunner | null = null;
  private websocket: WebSocket | null = null;
  private playerId: number | null = null;
  private roomCode: string | null = null;
  private readonly assetAliases = new Set<string>();
  private assetsLoaded = false;
  private lastInput: InputState = { w: false, a: false, s: false, d: false, l: false };
  private sentInput: InputState = { ...this.lastInput };
  private soloActive = false;
  private currentScreen: ScreenName = 'lobby';
  private loadingOverlay: HTMLElement | null = null;

  // UI references
  private screens!: Record<ScreenName, HTMLElement>;
  private statusBanner!: HTMLElement;
  private serverField!: HTMLInputElement;
  private roomCodeField!: HTMLInputElement;
  private soloButton!: HTMLButtonElement;
  private createButton!: HTMLButtonElement;
  private joinButton!: HTMLButtonElement;
  private startGameButton!: HTMLButtonElement;
  private leaveRoomButton!: HTMLButtonElement;
  private leaveGameButton!: HTMLButtonElement;
  private gameModeLabel!: HTMLElement;
  private gameSummaryLabel!: HTMLElement;
  private roomCodeLabel!: HTMLElement;
  private roomPlayersLabel!: HTMLElement;
  private roomStatusLabel!: HTMLElement;
  private scoreValue!: HTMLElement;
  private waveValue!: HTMLElement;
  private livesValue!: HTMLElement;
  private playerListRoot!: HTMLElement;
  private canvasFrame!: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
    this.root.innerHTML = this.buildTemplate();
    this.cacheElements();
    this.attachEventListeners();
    this.initializePixi();
  }

  private buildTemplate(): string {
    return `
      <div class="app-shell">
        <aside class="panel">
          <div class="panel__header">
            <h1>Defense for Very Pixi</h1>
            <p>A polished PixiJS remake of the original DfVP tower defense prototype.</p>
          </div>
          <div class="panel__content">
            <div class="status-banner" id="statusBanner">Loading assets…</div>
            <section class="screen active" data-screen="lobby">
              <div class="button-row">
                <button class="primary" id="soloButton">Start Solo Run</button>
              </div>
              <div class="form-group">
                <label for="serverAddress">Server address (optional)</label>
                <input id="serverAddress" type="text" placeholder="ws://localhost:3000" autocomplete="off" />
              </div>
              <div class="form-group">
                <label for="roomCodeInput">Room code</label>
                <input id="roomCodeInput" type="text" maxlength="6" placeholder="ABC123" autocomplete="off" />
              </div>
              <div class="button-row">
                <button class="secondary" id="createRoom">Create room</button>
                <button class="primary" id="joinRoom">Join room</button>
              </div>
            </section>

            <section class="screen" data-screen="loading">
              <p>Connecting to room…</p>
            </section>

            <section class="screen" data-screen="room">
              <div class="form-group">
                <label>Room code</label>
                <div class="status-banner" id="roomCodeLabel">—</div>
              </div>
              <div class="form-group">
                <label>Players</label>
                <div class="status-banner" id="roomPlayersLabel">Waiting…</div>
              </div>
              <div class="form-group">
                <label>Status</label>
                <div class="status-banner" id="roomStatusLabel">Lobby open</div>
              </div>
              <div class="button-row">
                <button class="primary" id="startGame" disabled>Start match</button>
                <button class="secondary" id="leaveRoom">Leave room</button>
              </div>
            </section>

            <section class="screen" data-screen="game">
              <p id="gameModeLabel">Solo</p>
              <div class="status-banner" id="gameSummaryLabel">Defend the tower at all costs.</div>
              <div class="button-row">
                <button class="danger" id="leaveGame">Leave game</button>
              </div>
            </section>

            <div class="key-hints">
              <span><span class="keycap">WASD</span> Move</span>
              <span><span class="keycap">L</span> Shoot while moving</span>
              <span><span class="keycap">Start</span> Host a match</span>
              <span><span class="keycap">Solo</span> Instant practice run</span>
            </div>
          </div>
        </aside>

        <section class="panel canvas-area">
          <div class="canvas-frame" id="canvasFrame">
            <div class="status-banner" id="canvasLoading">Preparing renderer…</div>
          </div>
          <div class="hud">
            <div class="stat-card">
              <h3>Score</h3>
              <strong id="scoreValue">0</strong>
            </div>
            <div class="stat-card">
              <h3>Wave</h3>
              <strong id="waveValue">1</strong>
            </div>
            <div class="stat-card">
              <h3>Lives</h3>
              <strong id="livesValue">3</strong>
            </div>
            <div class="stat-card">
              <h3>Players</h3>
              <div class="player-list" id="playerList"></div>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  private cacheElements(): void {
    this.screens = {
      lobby: this.root.querySelector('[data-screen="lobby"]') as HTMLElement,
      loading: this.root.querySelector('[data-screen="loading"]') as HTMLElement,
      room: this.root.querySelector('[data-screen="room"]') as HTMLElement,
      game: this.root.querySelector('[data-screen="game"]') as HTMLElement,
    };

    this.statusBanner = this.root.querySelector('#statusBanner') as HTMLElement;
    this.serverField = this.root.querySelector('#serverAddress') as HTMLInputElement;
    this.roomCodeField = this.root.querySelector('#roomCodeInput') as HTMLInputElement;
    this.soloButton = this.root.querySelector('#soloButton') as HTMLButtonElement;
    this.createButton = this.root.querySelector('#createRoom') as HTMLButtonElement;
    this.joinButton = this.root.querySelector('#joinRoom') as HTMLButtonElement;
    this.startGameButton = this.root.querySelector('#startGame') as HTMLButtonElement;
    this.leaveRoomButton = this.root.querySelector('#leaveRoom') as HTMLButtonElement;
    this.leaveGameButton = this.root.querySelector('#leaveGame') as HTMLButtonElement;
    this.gameModeLabel = this.root.querySelector('#gameModeLabel') as HTMLElement;
    this.gameSummaryLabel = this.root.querySelector('#gameSummaryLabel') as HTMLElement;
    this.roomCodeLabel = this.root.querySelector('#roomCodeLabel') as HTMLElement;
    this.roomPlayersLabel = this.root.querySelector('#roomPlayersLabel') as HTMLElement;
    this.roomStatusLabel = this.root.querySelector('#roomStatusLabel') as HTMLElement;
    this.scoreValue = this.root.querySelector('#scoreValue') as HTMLElement;
    this.waveValue = this.root.querySelector('#waveValue') as HTMLElement;
    this.livesValue = this.root.querySelector('#livesValue') as HTMLElement;
    this.playerListRoot = this.root.querySelector('#playerList') as HTMLElement;
    this.canvasFrame = this.root.querySelector('#canvasFrame') as HTMLElement;
    this.loadingOverlay = this.root.querySelector('#canvasLoading') as HTMLElement;
  }

  private attachEventListeners(): void {
    this.soloButton.addEventListener('click', () => this.startSoloRun());
    this.createButton.addEventListener('click', () => this.handleCreateRoom());
    this.joinButton.addEventListener('click', () => this.handleJoinRoom());
    this.startGameButton.addEventListener('click', () => this.requestStartGame());
    this.leaveRoomButton.addEventListener('click', () => this.leaveRoom());
    this.leaveGameButton.addEventListener('click', () => this.leaveGame());

    this.roomCodeField.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.handleJoinRoom();
      }
    });

    window.addEventListener('keydown', (event) => this.handleKey(event, true));
    window.addEventListener('keyup', (event) => this.handleKey(event, false));
    window.addEventListener('beforeunload', () => {
      this.cleanupConnection();
      this.stopSoloRun();
    });
  }

  private async initializePixi(): Promise<void> {
    this.pixiApp = new Application();
    await this.pixiApp.init({
      width: GAME_CONSTANTS.W,
      height: GAME_CONSTANTS.H,
      antialias: true,
      backgroundAlpha: 0,
    });

    if (this.loadingOverlay) {
      this.loadingOverlay.remove();
      this.loadingOverlay = null;
    }
    this.canvasFrame.innerHTML = '';
    this.canvasFrame.appendChild(this.pixiApp.canvas);

    await this.loadAssets();
    this.scene = new GameScene(this.pixiApp, this.assetAliases);
    this.setStatus('Ready to play! Choose solo or join a room.', 'success');
    this.assetsLoaded = true;
    this.resetHud();
  }

  private async loadAssets(): Promise<void> {
    const manifest = {
      bundles: [
        {
          name: 'main',
          assets: ASSET_FILES.map((name) => ({
            alias: name.replace(/\.png$/i, ''),
            src: `/assets/${name}`,
          })),
        },
      ],
    };

    await Assets.init({ manifest });
    await Assets.loadBundle('main');
    ASSET_FILES.forEach((file) => {
      const alias = file.replace(/\.png$/i, '');
      this.assetAliases.add(alias);
    });
  }

  private startSoloRun(): void {
    if (!this.assetsLoaded) {
      return;
    }

    this.setStatus('Solo run started — hone your defenses!', 'success');
    this.showScreen('game');
    this.setGameMode('Solo run');
    this.setGameSummary('Survive as long as you can. Every wave gets tougher.');
    this.cleanupConnection();
    this.scene?.clear();
    this.scene?.setLocalPlayerId(0);
    this.resetHud();

    if (!this.soloRunner) {
      this.soloRunner = new SoloGameRunner(
        (state) => this.handleGameState(state),
        () => this.onSoloGameEnded(),
      );
    }

    this.soloActive = true;
    this.soloRunner.start();
    this.updateInputState();
  }

  private stopSoloRun(): void {
    this.soloActive = false;
    this.soloRunner?.stop();
  }

  private onSoloGameEnded(): void {
    this.setGameSummary('The tower has fallen! Hit "Start Solo Run" to try again.');
    this.setStatus('Tower destroyed. Solo run complete.', 'error');
    this.soloActive = false;
  }

  private handleCreateRoom(): void {
    if (!this.assetsLoaded) {
      return;
    }
    if (this.websocket) {
      this.setStatus('You are already connected to a room.', 'error');
      return;
    }

    this.stopSoloRun();
    this.roomCode = this.generateRoomCode();
    this.connectToServer(this.roomCode);
  }

  private handleJoinRoom(): void {
    if (!this.assetsLoaded) {
      return;
    }
    if (this.websocket) {
      this.setStatus('You are already connected to a room.', 'error');
      return;
    }

    this.stopSoloRun();
    const code = this.roomCodeField.value.trim().toUpperCase();
    if (code.length !== 6) {
      this.setStatus('Enter a valid 6-character room code.', 'error');
      return;
    }

    this.roomCode = code;
    this.connectToServer(code);
  }

  private connectToServer(roomCode: string): void {
    const serverUrl = this.resolveServerUrl();
    if (!serverUrl) {
      this.setStatus('Enter a valid WebSocket server address.', 'error');
      return;
    }

    this.setStatus('Connecting to server…');
    this.showScreen('loading');
    this.cleanupConnection();

    try {
      this.websocket = new WebSocket(serverUrl);
    } catch (error) {
      console.error(error);
      this.setStatus('Unable to open WebSocket connection.', 'error');
      this.showScreen('lobby');
      this.websocket = null;
      return;
    }

    this.websocket.onopen = () => {
      this.setStatus(`Connected. Joining room ${roomCode}…`);
      this.websocket?.send(JSON.stringify({
        type: 'join_room',
        roomCode,
      }));
    };

    this.websocket.onmessage = (event) => {
      const data: ServerMessage = JSON.parse(event.data);
      this.handleServerMessage(data);
    };

    this.websocket.onerror = () => {
      this.setStatus('Connection error. Please verify the server address.', 'error');
      this.showScreen('lobby');
    };

    this.websocket.onclose = () => {
      if (this.currentScreen !== 'lobby') {
        this.setStatus('Disconnected from server.', 'error');
        this.showScreen('lobby');
      }
      this.websocket = null;
      this.playerId = null;
      this.roomCode = null;
    };
  }

  private handleServerMessage(message: ServerMessage): void {
    switch (message.type) {
      case 'room_joined':
        this.playerId = message.playerId;
        this.roomCode = message.roomCode;
        this.setStatus(`Joined room ${message.roomCode}.`, 'success');
        this.updateRoomInfo(message.playerCount, message.status, message.canStart);
        this.showScreen('room');
        this.scene?.clear();
        this.scene?.setLocalPlayerId(this.playerId);
        this.resetHud();
        this.setGameSummary('Waiting for the host to start the game.');
        break;

      case 'room_update':
        this.updateRoomInfo(message.playerCount, message.status, message.canStart);
        break;

      case 'room_left':
        this.setStatus('You left the room.', 'success');
        this.cleanupConnection();
        this.showScreen('lobby');
        break;

      case 'game_start':
        this.setStatus('Match started! Good luck.', 'success');
        this.showScreen('game');
        this.setGameMode(`Online room ${this.roomCode ?? ''}`.trim());
        this.setGameSummary('Defend the central tower with your squad.');
        this.scene?.clear();
        if (this.playerId !== null) {
          this.scene?.setLocalPlayerId(this.playerId);
        }
        this.resetHud();
        break;

      case 'game_state':
        this.handleGameState(message);
        break;

      case 'game_end':
        this.setGameSummary('Game over! You can leave the room or start another round.');
        this.setStatus('The round has ended.', 'error');
        this.showScreen('room');
        break;

      case 'error':
        this.setStatus(message.message, 'error');
        break;

      default:
        console.warn('Unknown message', message);
    }
  }

  private handleGameState(state: GameState): void {
    this.scene?.updateState(state);
    this.updateHud(state);
  }

  private requestStartGame(): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({ type: 'start_game' }));
    }
  }

  private leaveRoom(): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({ type: 'leave_room' }));
    }
    this.cleanupConnection();
    this.showScreen('lobby');
    this.resetHud();
  }

  private leaveGame(): void {
    if (this.soloActive) {
      this.stopSoloRun();
      this.showScreen('lobby');
      this.setStatus('Exited solo run.', 'success');
      this.resetHud();
      return;
    }

    if (this.websocket) {
      this.leaveRoom();
    } else {
      this.showScreen('lobby');
    }
  }

  private cleanupConnection(): void {
    if (this.websocket) {
      this.websocket.onopen = null;
      this.websocket.onclose = null;
      this.websocket.onerror = null;
      this.websocket.onmessage = null;
      this.websocket.close();
      this.websocket = null;
    }
    this.playerId = null;
    this.roomCode = null;
  }

  private handleKey(event: KeyboardEvent, pressed: boolean): void {
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
      return;
    }

    const key = event.key.toLowerCase();
    const binding = KEY_BINDINGS[key];
    if (!binding) {
      return;
    }

    if (this.lastInput[binding] === pressed) {
      return;
    }

    this.lastInput = { ...this.lastInput, [binding]: pressed };
    this.updateInputState();
    event.preventDefault();
  }

  private updateInputState(): void {
    if (this.soloActive) {
      this.soloRunner?.setInput(this.lastInput);
    }

    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      if (!this.inputsEqual(this.lastInput, this.sentInput)) {
        this.websocket.send(JSON.stringify({ type: 'input', keys: this.lastInput }));
        this.sentInput = { ...this.lastInput };
      }
    }
  }

  private inputsEqual(a: InputState, b: InputState): boolean {
    return a.w === b.w && a.a === b.a && a.s === b.s && a.d === b.d && a.l === b.l;
  }

  private resolveServerUrl(): string | null {
    const raw = this.serverField.value.trim();
    if (raw.length === 0) {
      return this.defaultServerUrl();
    }

    if (raw.startsWith('ws://') || raw.startsWith('wss://')) {
      return raw;
    }

    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw.replace(/^http/i, 'ws');
    }

    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    return `${protocol}${raw}`;
  }

  private defaultServerUrl(): string | null {
    const { protocol, hostname, port } = window.location;
    if (!hostname) {
      return null;
    }

    const secure = protocol === 'https:';
    const fallbackPort = secure ? '443' : '3000';
    const finalPort = port || fallbackPort;
    return `${secure ? 'wss' : 'ws'}://${hostname}${finalPort ? `:${finalPort}` : ''}`;
  }

  private showScreen(screen: ScreenName): void {
    this.currentScreen = screen;
    Object.entries(this.screens).forEach(([name, element]) => {
      if (name === screen) {
        element.classList.add('active');
      } else {
        element.classList.remove('active');
      }
    });
  }

  private setStatus(message: string, tone: 'default' | 'success' | 'error' = 'default'): void {
    this.statusBanner.textContent = message;
    this.statusBanner.classList.remove('success', 'error');
    if (tone !== 'default') {
      this.statusBanner.classList.add(tone);
    }
  }

  private updateRoomInfo(playerCount: number, status: string, canStart: boolean): void {
    const code = this.roomCode ?? '—';
    this.roomCodeLabel.textContent = code;
    this.roomPlayersLabel.textContent = `${playerCount} / ${GAME_CONSTANTS.MAXPLAYER} players`;
    this.roomStatusLabel.textContent = status;
    this.startGameButton.disabled = !canStart;
  }

  private setGameMode(label: string): void {
    this.gameModeLabel.textContent = label;
  }

  private setGameSummary(message: string): void {
    this.gameSummaryLabel.textContent = message;
  }

  private updateHud(state: GameState | null): void {
    if (!state) {
      this.resetHud();
      return;
    }

    this.scoreValue.textContent = state.score.toString();
    this.waveValue.textContent = state.wave.toString();
    this.livesValue.textContent = state.lives.toString();

    this.playerListRoot.innerHTML = '';
    state.players.forEach((player) => {
      const item = document.createElement('div');
      item.className = 'player-list__item';
      if (player.idx === this.playerId || (this.soloActive && player.idx === 0)) {
        item.classList.add('is-local');
      }

      const badge = document.createElement('span');
      badge.className = 'player-list__badge';
      badge.textContent = `P${player.idx + 1}`;

      const coordinates = document.createElement('span');
      coordinates.textContent = `${Math.round(player.x)}, ${Math.round(player.y)}`;

      item.appendChild(badge);
      item.appendChild(coordinates);
      this.playerListRoot.appendChild(item);
    });

    if (state.players.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'player-list__item';
      empty.textContent = 'No players connected yet.';
      this.playerListRoot.appendChild(empty);
    }
  }

  private resetHud(): void {
    this.scoreValue.textContent = '0';
    this.waveValue.textContent = '1';
    this.livesValue.textContent = '3';
    this.playerListRoot.innerHTML = '<div class="player-list__item">Waiting for players…</div>';
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i += 1) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
