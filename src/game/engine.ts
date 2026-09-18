import {
  BASE_GAP,
  BASE_PLAYER_SPEED,
  BASE_RING_SPEED,
  MIN_GAP,
  MIN_SPAWN_INTERVAL,
  ORBIT_RADIUS,
  PLAYER_RADIUS,
  SPAWN_INTERVAL,
} from './constants';
import type { GamePhase, GameSnapshot, Particle, Ring, TrailPoint } from './types';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function normalizeAngle(a: number) {
  const twoPi = Math.PI * 2;
  let x = a % twoPi;
  if (x < 0) x += twoPi;
  return x;
}

function angleDistance(a: number, b: number) {
  const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return Math.min(diff, Math.PI * 2 - diff);
}

export class VortexEngine {
  phase: GamePhase = 'menu';
  playerAngle = 0;
  playerDirection: 1 | -1 = 1;
  orbitRadius = ORBIT_RADIUS;
  rings: Ring[] = [];
  particles: Particle[] = [];
  trail: TrailPoint[] = [];
  score = 0;
  combo = 0;
  bestCombo = 0;
  multiplier = 1;
  timeAlive = 0;
  shake = 0;
  flash = 0;
  lastPerfect = false;
  width = 390;
  height = 844;

  private spawnTimer = 0;
  private nextId = 1;
  private particleId = 1;
  private invuln = 0;

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    const minDim = Math.min(width, height);
    this.orbitRadius = clamp(minDim * 0.145, 88, 128);
  }

  start() {
    this.phase = 'playing';
    this.playerAngle = -Math.PI / 2;
    this.playerDirection = 1;
    this.rings = [];
    this.particles = [];
    this.trail = [];
    this.score = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.multiplier = 1;
    this.timeAlive = 0;
    this.shake = 0;
    this.flash = 0;
    this.lastPerfect = false;
    this.spawnTimer = 0.35;
    this.invuln = 0.35;
    this.spawnRing(true);
  }

  reverse() {
    if (this.phase !== 'playing') return;
    this.playerDirection = (this.playerDirection * -1) as 1 | -1;
    this.burst(
      this.centerX + Math.cos(this.playerAngle) * this.orbitRadius,
      this.centerY + Math.sin(this.playerAngle) * this.orbitRadius,
      '#F4A261',
      6,
      90
    );
  }

  get centerX() {
    return this.width / 2;
  }

  get centerY() {
    return this.height * 0.48;
  }

  private difficulty() {
    return 1 + this.timeAlive * 0.045 + this.score * 0.012;
  }

  private spawnRing(first = false) {
    const d = this.difficulty();
    const outer = Math.min(this.width, this.height) * 0.52;
    const gapSize = clamp(BASE_GAP - (d - 1) * 0.045, MIN_GAP, BASE_GAP);
    const gapStart = Math.random() * Math.PI * 2;
    const speed = BASE_RING_SPEED * (0.85 + d * 0.18) * (first ? 0.75 : 1);

    this.rings.push({
      id: this.nextId++,
      radius: outer,
      gapStart,
      gapSize,
      speed,
      scored: false,
      hue: (this.score * 17 + this.timeAlive * 40) % 360,
    });
  }

  private burst(x: number, y: number, color: string, count: number, speed = 140) {
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const s = speed * (0.4 + Math.random() * 0.8);
      this.particles.push({
        id: this.particleId++,
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 0.35 + Math.random() * 0.35,
        maxLife: 0.7,
        size: 2 + Math.random() * 3.5,
        color,
      });
    }
  }

  private isInGap(angle: number, ring: Ring) {
    const start = normalizeAngle(ring.gapStart);
    const end = normalizeAngle(ring.gapStart + ring.gapSize);
    const a = normalizeAngle(angle);
    if (start < end) return a >= start && a <= end;
    return a >= start || a <= end;
  }

  private gapCenter(ring: Ring) {
    return normalizeAngle(ring.gapStart + ring.gapSize / 2);
  }

  update(dt: number) {
    const capped = Math.min(dt, 0.033);
    this.shake = Math.max(0, this.shake - capped * 4);
    this.flash = Math.max(0, this.flash - capped * 3);

    if (this.phase !== 'playing') {
      this.updateParticles(capped);
      return;
    }

    this.timeAlive += capped;
    this.invuln = Math.max(0, this.invuln - capped);

    const d = this.difficulty();
    const playerSpeed = BASE_PLAYER_SPEED * (0.95 + Math.min(d, 3) * 0.08);
    this.playerAngle = normalizeAngle(
      this.playerAngle + this.playerDirection * playerSpeed * capped
    );

    const px = this.centerX + Math.cos(this.playerAngle) * this.orbitRadius;
    const py = this.centerY + Math.sin(this.playerAngle) * this.orbitRadius;
    this.trail.push({ x: px, y: py, life: 0.28 });
    this.trail = this.trail
      .map((t) => ({ ...t, life: t.life - capped }))
      .filter((t) => t.life > 0)
      .slice(-18);

    this.spawnTimer -= capped;
    const interval = clamp(
      SPAWN_INTERVAL - (d - 1) * 0.08,
      MIN_SPAWN_INTERVAL,
      SPAWN_INTERVAL
    );
    if (this.spawnTimer <= 0) {
      this.spawnRing();
      this.spawnTimer = interval;
    }

    for (const ring of this.rings) {
      ring.radius -= ring.speed * capped;

      const collideAt = this.orbitRadius;
      if (!ring.scored && ring.radius <= collideAt) {
        ring.scored = true;
        if (this.isInGap(this.playerAngle, ring)) {
          const perfect =
            angleDistance(this.playerAngle, this.gapCenter(ring)) <
            ring.gapSize * 0.18;
          this.onScore(perfect, px, py);
        } else if (this.invuln <= 0) {
          this.gameOver(px, py);
          break;
        }
      }
    }

    this.rings = this.rings.filter((r) => r.radius > PLAYER_RADIUS * 2);
    this.updateParticles(capped);
  }

  private onScore(perfect: boolean, x: number, y: number) {
    this.lastPerfect = perfect;
    if (perfect) {
      this.combo += 1;
      this.bestCombo = Math.max(this.bestCombo, this.combo);
      this.multiplier = 1 + Math.min(this.combo, 12) * 0.25;
      this.score += Math.round(2 * this.multiplier);
      this.flash = 1;
      this.shake = 0.35;
      this.burst(x, y, '#2A9D8F', 14, 180);
      this.burst(this.centerX, this.centerY, '#E9C46A', 8, 60);
    } else {
      this.combo = 0;
      this.multiplier = 1;
      this.score += 1;
      this.burst(x, y, '#A8DADC', 8, 120);
    }
  }

  private gameOver(x: number, y: number) {
    this.phase = 'gameover';
    this.shake = 1;
    this.burst(x, y, '#E76F51', 22, 220);
    this.burst(this.centerX, this.centerY, '#F4A261', 10, 80);
  }

  private updateParticles(dt: number) {
    this.particles = this.particles
      .map((p) => ({
        ...p,
        x: p.x + p.vx * dt,
        y: p.y + p.vy * dt,
        vx: p.vx * 0.98,
        vy: p.vy * 0.98 + 30 * dt,
        life: p.life - dt,
      }))
      .filter((p) => p.life > 0);
  }

  snapshot(): GameSnapshot {
    return {
      phase: this.phase,
      playerAngle: this.playerAngle,
      playerDirection: this.playerDirection,
      orbitRadius: this.orbitRadius,
      rings: this.rings.map((r) => ({ ...r })),
      particles: this.particles.map((p) => ({ ...p })),
      trail: this.trail.map((t) => ({ ...t })),
      score: this.score,
      combo: this.combo,
      bestCombo: this.bestCombo,
      multiplier: this.multiplier,
      timeAlive: this.timeAlive,
      shake: this.shake,
      flash: this.flash,
      lastPerfect: this.lastPerfect,
      width: this.width,
      height: this.height,
    };
  }
}
