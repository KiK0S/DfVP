export interface InputState {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
  l: boolean;
}

export interface PlayerState {
  x: number;
  y: number;
  alpha: number;
  idx: number;
  size: number;
}

export interface BulletState {
  x: number;
  y: number;
  alpha: number;
  idx: number;
  size: number;
}

export interface EnemyState {
  x: number;
  y: number;
  idx: string;
  size: number;
}

export interface TowerState {
  x: number;
  y: number;
  size: number;
  center: [number, number];
}

export interface GameState {
  players: PlayerState[];
  bullets: BulletState[];
  enemies: EnemyState[];
  tower: TowerState;
  score: number;
  wave: number;
  lives: number;
  playerCount: number;
}

export interface RoomJoinedMessage {
  type: 'room_joined';
  playerId: number;
  roomCode: string;
  playerCount: number;
  status: string;
  canStart: boolean;
}

export interface RoomUpdateMessage {
  type: 'room_update';
  playerCount: number;
  status: string;
  canStart: boolean;
}

export interface RoomLeftMessage {
  type: 'room_left';
}

export interface GameStartMessage {
  type: 'game_start';
}

export interface GameEndMessage {
  type: 'game_end';
}

export interface ErrorMessage {
  type: 'error';
  message: string;
}

export interface GameStateMessage extends GameState {
  type: 'game_state';
}

export type ServerMessage =
  | RoomJoinedMessage
  | RoomUpdateMessage
  | RoomLeftMessage
  | GameStartMessage
  | GameEndMessage
  | ErrorMessage
  | GameStateMessage;

export type ScreenName = 'lobby' | 'loading' | 'room' | 'game';
