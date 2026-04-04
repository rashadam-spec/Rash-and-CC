export type GamePhase = 'idle' | 'playing' | 'gameover';
export type ObstacleType = 'basket' | 'chick' | 'fence';

export interface ObstacleEntity {
  id: number;
  x: number;
  y: number;
  type: ObstacleType;
  el?: HTMLElement;
}

export interface CollectibleEntity {
  id: number;
  x: number;
  y: number;
  type: 'egg';
  color: string;
  collected: boolean;
  el?: HTMLElement;
}

export interface GameWorld {
  bunnyY: number;       // px above ground baseline
  bunnyVY: number;      // vertical velocity px/ms
  jumpsRemaining: number;
  isOnGround: boolean;
  obstacles: ObstacleEntity[];
  collectibles: CollectibleEntity[];
  score: number;
  highScore: number;
  distance: number;
  speed: number;        // px/ms
  nextSpawnDistance: number;
  phase: GamePhase;
  lastSpeedRampScore: number;
  entityIdCounter: number;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
