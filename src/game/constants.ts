import type { AchievementDef, GameModeId, ModeDef, SkinDef } from './types';

export const COLORS = {
  bgTop: '#050B14',
  bgMid: '#0A1F2E',
  bgBottom: '#123447',
  accent: '#FF8A3D',
  accentSoft: '#FFD166',
  player: '#FF8A3D',
  ring: '#7FDBDA',
  ringBoss: '#FF5E5B',
  ringPulse: '#C77DFF',
  text: '#F4F7FA',
  muted: '#7E95A5',
  perfect: '#06D6A0',
  fever: '#FFD166',
  danger: '#EF476F',
  center: '#1B4332',
  card: 'rgba(12, 28, 40, 0.82)',
} as const;

export const ORBIT_RADIUS = 112;
export const PLAYER_RADIUS = 12;
export const RING_THICKNESS = 15;
export const BASE_RING_SPEED = 76;
export const BASE_PLAYER_SPEED = 2.15;
export const BASE_GAP = Math.PI * 0.5;
export const MIN_GAP = Math.PI * 0.23;
export const SPAWN_INTERVAL = 1.15;
export const MIN_SPAWN_INTERVAL = 0.5;

export const MODES: ModeDef[] = [
  {
    id: 'classic',
    name: 'CLASSIC',
    blurb: 'Ein Orbit. Reine Präzision. Endlos.',
    unlockScore: 0,
    scoreMult: 1,
  },
  {
    id: 'hyper',
    name: 'HYPER',
    blurb: 'Schneller. Enger. 2× Score.',
    unlockScore: 25,
    scoreMult: 2,
  },
  {
    id: 'mirror',
    name: 'MIRROR',
    blurb: 'Zwei Orbs. Eine Lücke. Kein Fehler.',
    unlockScore: 40,
    scoreMult: 1.75,
  },
  {
    id: 'gauntlet',
    name: 'GAUNTLET',
    blurb: '20 Wellen. Boss-Ringe. Überlebe.',
    unlockScore: 60,
    scoreMult: 1.5,
  },
];

export const SKINS: SkinDef[] = [
  { id: 'ember', name: 'Ember', color: '#FF8A3D', trail: '#FFD166', cost: 0 },
  { id: 'aqua', name: 'Aqua', color: '#4CC9F0', trail: '#90E0EF', cost: 40 },
  { id: 'toxic', name: 'Toxic', color: '#80ED99', trail: '#D8F3DC', cost: 80 },
  { id: 'nova', name: 'Nova', color: '#F72585', trail: '#B5179E', cost: 120 },
  { id: 'ghost', name: 'Ghost', color: '#E9ECEF', trail: '#ADB5BD', cost: 160 },
  { id: 'solar', name: 'Solar', color: '#FFB703', trail: '#FB8500', cost: 220 },
];

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_blood', title: 'Erster Kontakt', desc: 'Spiele ein Match', reward: 10 },
  { id: 'combo_5', title: 'Flow State', desc: '5er Combo', reward: 15 },
  { id: 'combo_12', title: 'Gottmodus', desc: '12er Combo', reward: 40 },
  { id: 'score_50', title: 'Orbit Ace', desc: '50 Punkte in einem Run', reward: 25 },
  { id: 'score_100', title: 'Singularity', desc: '100 Punkte in einem Run', reward: 60 },
  { id: 'fever', title: 'Fiebertraum', desc: 'Aktiviere Fever', reward: 20 },
  { id: 'near_10', title: 'Rasur', desc: '10 Near-Misses total', reward: 20 },
  { id: 'hyper_clear', title: 'Hyperlane', desc: '30 Punkte in Hyper', reward: 35 },
  { id: 'mirror_clear', title: 'Zwillingskern', desc: '20 Punkte in Mirror', reward: 35 },
  { id: 'gauntlet_win', title: 'Gauntlet Breaker', desc: 'Gauntlet abschließen', reward: 100 },
];

export const MODE_TUNING: Record<
  GameModeId,
  {
    speed: number;
    gap: number;
    spawn: number;
    player: number;
    waves?: number;
  }
> = {
  classic: { speed: 1, gap: 1, spawn: 1, player: 1 },
  hyper: { speed: 1.45, gap: 0.82, spawn: 0.72, player: 1.2 },
  mirror: { speed: 0.95, gap: 1.05, spawn: 1.05, player: 1 },
  gauntlet: { speed: 1.1, gap: 0.92, spawn: 0.9, player: 1.05, waves: 20 },
};
