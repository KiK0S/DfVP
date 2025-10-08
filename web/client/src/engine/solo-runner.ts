import { Ticker } from 'pixi.js';
import { FRAME_TIME_MS } from '../constants';
import type { GameState, InputState } from '../types';
import { GameLogic } from './logic';

export class SoloGameRunner {
  private readonly ticker: Ticker;
  private readonly logic: GameLogic;
  private accumulator = 0;
  private input: InputState = { w: false, a: false, s: false, d: false, l: false };
  private active = false;

  constructor(
    private readonly onState: (state: GameState) => void,
    private readonly onGameEnd: () => void,
  ) {
    this.logic = new GameLogic([0]);
    this.ticker = new Ticker();
    this.ticker.add(this.tick, this);
  }

  public start(): void {
    this.logic.resetForNewRun();
    this.accumulator = 0;
    this.active = true;
    this.ticker.start();
  }

  public stop(): void {
    this.active = false;
    this.ticker.stop();
  }

  public destroy(): void {
    this.stop();
    this.ticker.destroy();
  }

  public setInput(input: InputState): void {
    this.input = { ...input };
  }

  private tick(deltaFrames: number): void {
    if (!this.active) {
      return;
    }

    const deltaMs = deltaFrames * (1000 / 60);
    this.accumulator += deltaMs;

    while (this.accumulator >= FRAME_TIME_MS) {
      this.logic.handleInput(0, this.input);
      this.logic.update();
      this.accumulator -= FRAME_TIME_MS;
    }

    const state = this.logic.getGameState();
    this.onState(state);

    if (this.logic.isGameEnded()) {
      this.onGameEnd();
      this.stop();
    }
  }
}
