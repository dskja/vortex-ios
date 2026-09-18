export type GamePhase = 'menu' | 'playing' | 'gameover';

export interface Ring {
  id: number;
  radius: number;
  gapStart: number;
  gapSize: number;
  speed: number;
  scored: boolean;
  hue: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export interface TrailPoint {
  x: number;
  y: number;
  life: number;
}

export interface GameSnapshot {
  phase: GamePhase;
  playerAngle: number;
  playerDirection: 1 | -1;
  orbitRadius: number;
  rings: Ring[];
  particles: Particle[];
  trail: TrailPoint[];
  score: number;
  combo: number;
  bestCombo: number;
  multiplier: number;
  timeAlive: number;
  shake: number;
  flash: number;
  lastPerfect: boolean;
  width: number;
  height: number;
}

export interface ScoreRecord {
  highScore: number;
  bestCombo: number;
  gamesPlayed: number;
}
