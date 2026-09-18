export type GamePhase = 'boot' | 'menu' | 'modes' | 'hangar' | 'stats' | 'playing' | 'gameover';

export type GameModeId = 'classic' | 'hyper' | 'mirror' | 'gauntlet';

export type RingKind = 'solid' | 'dual' | 'spinner' | 'pulse' | 'boss';

export interface Ring {
  id: number;
  radius: number;
  gapStart: number;
  gapSize: number;
  gap2Start?: number;
  gap2Size?: number;
  speed: number;
  scored: boolean;
  kind: RingKind;
  spin: number;
  pulse: number;
  danger: boolean;
}

export interface Pickup {
  id: number;
  angle: number;
  radius: number;
  taken: boolean;
  value: number;
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
  mirror?: boolean;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  life: number;
  color: string;
}

export interface GameSnapshot {
  phase: GamePhase;
  mode: GameModeId;
  playerAngle: number;
  playerDirection: 1 | -1;
  mirrorAngle: number;
  orbitRadius: number;
  rings: Ring[];
  pickups: Pickup[];
  particles: Particle[];
  trail: TrailPoint[];
  floats: FloatingText[];
  score: number;
  combo: number;
  bestCombo: number;
  multiplier: number;
  timeAlive: number;
  shake: number;
  flash: number;
  fever: number;
  nearMiss: number;
  wave: number;
  wavesTotal: number;
  shardsEarned: number;
  lastPerfect: boolean;
  slowMo: number;
  width: number;
  height: number;
  skinColor: string;
  trailColor: string;
}

export interface ModeDef {
  id: GameModeId;
  name: string;
  blurb: string;
  unlockScore: number;
  scoreMult: number;
}

export interface SkinDef {
  id: string;
  name: string;
  color: string;
  trail: string;
  cost: number;
}

export interface AchievementDef {
  id: string;
  title: string;
  desc: string;
  reward: number;
}

export interface MetaState {
  highScores: Record<GameModeId, number>;
  bestCombos: Record<GameModeId, number>;
  shards: number;
  unlockedSkins: string[];
  equippedSkin: string;
  unlockedModes: GameModeId[];
  achievements: string[];
  gamesPlayed: number;
  totalScore: number;
  perfects: number;
  nearMisses: number;
}
