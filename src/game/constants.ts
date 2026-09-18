export const COLORS = {
  bgTop: '#07131F',
  bgBottom: '#0E2A3D',
  accent: '#F4A261',
  accentSoft: '#E9C46A',
  player: '#F4A261',
  ring: '#A8DADC',
  ringDanger: '#E76F51',
  text: '#F1FAEE',
  muted: '#8FA6B2',
  perfect: '#2A9D8F',
  center: '#1B4332',
} as const;

export const ORBIT_RADIUS = 108;
export const PLAYER_RADIUS = 11;
export const RING_THICKNESS = 14;
export const BASE_RING_SPEED = 95;
export const BASE_PLAYER_SPEED = 2.55;
export const BASE_GAP = Math.PI * 0.42;
export const MIN_GAP = Math.PI * 0.22;
export const SPAWN_INTERVAL = 1.05;
export const MIN_SPAWN_INTERVAL = 0.48;
