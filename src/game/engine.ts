import {
  BASE_GAP,
  BASE_PLAYER_SPEED,
  BASE_RING_SPEED,
  MIN_GAP,
  MIN_SPAWN_INTERVAL,
  MODE_TUNING,
  ORBIT_RADIUS,
  PLAYER_RADIUS,
  SPAWN_INTERVAL,
} from './constants';
import type {
  FloatingText,
  GameModeId,
  GamePhase,
  GameSnapshot,
  Particle,
  Pickup,
  Ring,
  RingKind,
  TrailPoint,
} from './types';

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

function inArc(angle: number, start: number, size: number) {
  const s = normalizeAngle(start);
  const e = normalizeAngle(start + size);
  const a = normalizeAngle(angle);
  if (s < e) return a >= s && a <= e;
  return a >= s || a <= e;
}

export class VortexEngine {
  phase: GamePhase = 'menu';
  mode: GameModeId = 'classic';
  playerAngle = 0;
  playerDirection: 1 | -1 = 1;
  mirrorAngle = Math.PI;
  orbitRadius = ORBIT_RADIUS;
  rings: Ring[] = [];
  pickups: Pickup[] = [];
  particles: Particle[] = [];
  trail: TrailPoint[] = [];
  floats: FloatingText[] = [];
  score = 0;
  combo = 0;
  bestCombo = 0;
  multiplier = 1;
  timeAlive = 0;
  shake = 0;
  flash = 0;
  fever = 0;
  nearMiss = 0;
  wave = 0;
  wavesTotal = 0;
  shardsEarned = 0;
  lastPerfect = false;
  slowMo = 0;
  width = 390;
  height = 844;
  skinColor = '#FF8A3D';
  trailColor = '#FFD166';

  perfectsThisRun = 0;
  nearMissesThisRun = 0;
  feverTriggered = false;
  gauntletCleared = false;

  private spawnTimer = 0;
  private nextId = 1;
  private particleId = 1;
  private floatId = 1;
  private pickupId = 1;
  private invuln = 0;
  private consecutivePerfects = 0;
  private gauntletDone = false;

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    const minDim = Math.min(width, height);
    this.orbitRadius = clamp(minDim * 0.148, 92, 132);
  }

  setSkin(color: string, trail: string) {
    this.skinColor = color;
    this.trailColor = trail;
  }

  start(mode: GameModeId) {
    this.mode = mode;
    this.phase = 'playing';
    this.playerAngle = -Math.PI / 2;
    this.mirrorAngle = this.playerAngle + Math.PI;
    this.playerDirection = 1;
    this.rings = [];
    this.pickups = [];
    this.particles = [];
    this.trail = [];
    this.floats = [];
    this.score = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.multiplier = 1;
    this.timeAlive = 0;
    this.shake = 0;
    this.flash = 0;
    this.fever = 0;
    this.nearMiss = 0;
    this.wave = 0;
    this.wavesTotal = MODE_TUNING[mode].waves ?? 0;
    this.shardsEarned = 0;
    this.lastPerfect = false;
    this.slowMo = 0;
    this.spawnTimer = 0.25;
    this.invuln = 0.4;
    this.consecutivePerfects = 0;
    this.perfectsThisRun = 0;
    this.nearMissesThisRun = 0;
    this.feverTriggered = false;
    this.gauntletCleared = false;
    this.gauntletDone = false;
    this.spawnRing(true);
  }

  reverse() {
    if (this.phase !== 'playing') return;
    this.playerDirection = (this.playerDirection * -1) as 1 | -1;
    const px = this.centerX + Math.cos(this.playerAngle) * this.orbitRadius;
    const py = this.centerY + Math.sin(this.playerAngle) * this.orbitRadius;
    this.burst(px, py, this.skinColor, 7, 110);
  }

  get centerX() {
    return this.width / 2;
  }

  get centerY() {
    return this.height * 0.46;
  }

  private tuning() {
    return MODE_TUNING[this.mode];
  }

  private difficulty() {
    const base = 1 + this.timeAlive * 0.04 + this.score * 0.01;
    if (this.mode === 'gauntlet') return 1 + this.wave * 0.08;
    return base;
  }

  private pickKind(d: number): RingKind {
    const roll = Math.random();
    if (this.mode === 'gauntlet' && (this.wave + 1) % 5 === 0) return 'boss';
    if (d > 1.8 && roll < 0.12) return 'boss';
    if (d > 1.4 && roll < 0.22) return 'pulse';
    if (d > 1.2 && roll < 0.35) return 'spinner';
    if (d > 1.1 && roll < 0.5) return 'dual';
    return 'solid';
  }

  private spawnRing(first = false) {
    if (this.mode === 'gauntlet' && this.gauntletDone) return;
    if (this.mode === 'gauntlet' && this.wave >= this.wavesTotal) return;

    const tune = this.tuning();
    const d = this.difficulty();
    const outer = Math.min(this.width, this.height) * 0.54;
    const kind = first ? 'solid' : this.pickKind(d);
    let gapSize = clamp(
      BASE_GAP * tune.gap - (d - 1) * 0.04,
      MIN_GAP,
      BASE_GAP * tune.gap
    );
    if (kind === 'boss') gapSize *= 0.78;
    if (kind === 'pulse') gapSize *= 1.05;

    const gapStart = Math.random() * Math.PI * 2;
    const speed =
      BASE_RING_SPEED *
      tune.speed *
      (0.82 + d * 0.16) *
      (first ? 0.7 : 1) *
      (kind === 'boss' ? 0.85 : 1) *
      (this.fever > 0 ? 0.72 : 1);

    const ring: Ring = {
      id: this.nextId++,
      radius: outer,
      gapStart,
      gapSize,
      speed,
      scored: false,
      kind,
      spin: kind === 'spinner' || kind === 'boss' ? (Math.random() > 0.5 ? 1 : -1) * (0.55 + Math.random() * 0.7) : 0,
      pulse: kind === 'pulse' ? 1 : 0,
      danger: kind === 'boss',
    };

    if (kind === 'dual' || kind === 'boss') {
      ring.gap2Size = gapSize * (kind === 'boss' ? 0.7 : 0.85);
      ring.gap2Start = normalizeAngle(gapStart + Math.PI);
    }

    this.rings.push(ring);
    if (this.mode === 'gauntlet') this.wave += 1;

    if (!first && Math.random() < 0.35) {
      this.pickups.push({
        id: this.pickupId++,
        angle: normalizeAngle(gapStart + gapSize * 0.5),
        radius: outer * 0.72,
        taken: false,
        value: kind === 'boss' ? 3 : 1,
      });
    }
  }

  private burst(x: number, y: number, color: string, count: number, speed = 140) {
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.45;
      const s = speed * (0.35 + Math.random() * 0.9);
      this.particles.push({
        id: this.particleId++,
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 0.3 + Math.random() * 0.4,
        maxLife: 0.75,
        size: 2 + Math.random() * 4,
        color,
      });
    }
  }

  private float(text: string, x: number, y: number, color: string) {
    this.floats.push({
      id: this.floatId++,
      text,
      x,
      y,
      life: 0.85,
      color,
    });
  }

  private isSafe(angle: number, ring: Ring) {
    const gap = ring.kind === 'pulse'
      ? ring.gapSize * (0.65 + 0.35 * Math.sin(ring.pulse * 6))
      : ring.gapSize;
    if (inArc(angle, ring.gapStart, gap)) return true;
    if (ring.gap2Start != null && ring.gap2Size != null) {
      return inArc(angle, ring.gap2Start, ring.gap2Size);
    }
    return false;
  }

  private gapCenter(ring: Ring) {
    const gap = ring.kind === 'pulse'
      ? ring.gapSize * (0.65 + 0.35 * Math.sin(ring.pulse * 6))
      : ring.gapSize;
    return normalizeAngle(ring.gapStart + gap / 2);
  }

  update(dt: number) {
    const timeScale = this.slowMo > 0 ? 0.35 : this.fever > 0 ? 0.88 : 1;
    const capped = Math.min(dt, 0.033) * timeScale;
    this.shake = Math.max(0, this.shake - capped * 4);
    this.flash = Math.max(0, this.flash - capped * 2.8);
    this.nearMiss = Math.max(0, this.nearMiss - capped * 3);
    this.fever = Math.max(0, this.fever - capped);
    this.slowMo = Math.max(0, this.slowMo - capped);

    if (this.phase !== 'playing') {
      this.updateFx(capped);
      return;
    }

    this.timeAlive += capped;
    this.invuln = Math.max(0, this.invuln - capped);

    const tune = this.tuning();
    const d = this.difficulty();
    const playerSpeed =
      BASE_PLAYER_SPEED *
      tune.player *
      (0.95 + Math.min(d, 3) * 0.07) *
      (this.fever > 0 ? 1.12 : 1);

    this.playerAngle = normalizeAngle(
      this.playerAngle + this.playerDirection * playerSpeed * capped
    );
    this.mirrorAngle = normalizeAngle(this.playerAngle + Math.PI);

    const px = this.centerX + Math.cos(this.playerAngle) * this.orbitRadius;
    const py = this.centerY + Math.sin(this.playerAngle) * this.orbitRadius;
    this.trail.push({ x: px, y: py, life: 0.3 });
    if (this.mode === 'mirror') {
      const mx = this.centerX + Math.cos(this.mirrorAngle) * this.orbitRadius;
      const my = this.centerY + Math.sin(this.mirrorAngle) * this.orbitRadius;
      this.trail.push({ x: mx, y: my, life: 0.28, mirror: true });
    }
    this.trail = this.trail
      .map((t) => ({ ...t, life: t.life - capped }))
      .filter((t) => t.life > 0)
      .slice(-28);

    this.spawnTimer -= capped;
    const interval = clamp(
      (SPAWN_INTERVAL * tune.spawn - (d - 1) * 0.07) * (this.fever > 0 ? 1.15 : 1),
      MIN_SPAWN_INTERVAL * tune.spawn,
      SPAWN_INTERVAL
    );
    if (this.spawnTimer <= 0) {
      this.spawnRing();
      this.spawnTimer = interval;
    }

    for (const ring of this.rings) {
      ring.radius -= ring.speed * capped;
      if (ring.spin !== 0) {
        ring.gapStart = normalizeAngle(ring.gapStart + ring.spin * capped);
        if (ring.gap2Start != null) {
          ring.gap2Start = normalizeAngle(ring.gap2Start + ring.spin * capped);
        }
      }
      if (ring.pulse > 0) ring.pulse += capped;

      // Near-miss telegraph
      if (
        !ring.scored &&
        ring.radius < this.orbitRadius + 28 &&
        ring.radius > this.orbitRadius + 8
      ) {
        const edgeDist = this.edgeDistance(this.playerAngle, ring);
        if (edgeDist < 0.18 && edgeDist > 0.02) {
          this.nearMiss = 1;
        }
      }

      if (!ring.scored && ring.radius <= this.orbitRadius) {
        ring.scored = true;
        const mainSafe = this.isSafe(this.playerAngle, ring);
        const mirrorSafe =
          this.mode !== 'mirror' || this.isSafe(this.mirrorAngle, ring);

        if (mainSafe && mirrorSafe) {
          const edge = this.edgeDistance(this.playerAngle, ring);
          if (edge < 0.12) {
            this.nearMissesThisRun += 1;
            this.nearMiss = 1;
            this.shardsEarned += 1;
            this.float('NEAR', px, py - 24, '#FFD166');
          }
          const perfect =
            angleDistance(this.playerAngle, this.gapCenter(ring)) <
            ring.gapSize * 0.16;
          this.onScore(perfect, px, py, ring);
        } else if (this.invuln <= 0) {
          this.gameOver(px, py);
          break;
        }
      }
    }

    for (const p of this.pickups) {
      p.radius -= BASE_RING_SPEED * 0.55 * capped;
      if (!p.taken && Math.abs(p.radius - this.orbitRadius) < 10) {
        if (angleDistance(this.playerAngle, p.angle) < 0.35) {
          p.taken = true;
          this.shardsEarned += p.value;
          this.score += p.value;
          this.float(`+${p.value}◆`, px, py - 18, '#7FDBDA');
          this.burst(px, py, '#7FDBDA', 8, 100);
        }
      }
    }

    this.rings = this.rings.filter((r) => r.radius > PLAYER_RADIUS * 2);
    this.pickups = this.pickups.filter((p) => !p.taken && p.radius > 20);
    this.updateFx(capped);

    if (
      this.mode === 'gauntlet' &&
      !this.gauntletDone &&
      this.wave >= this.wavesTotal &&
      this.rings.length === 0
    ) {
      this.gauntletDone = true;
      this.gauntletCleared = true;
      this.shardsEarned += 25;
      this.float('CLEARED', this.centerX, this.centerY - 40, '#06D6A0');
      this.phase = 'gameover';
      this.burst(this.centerX, this.centerY, '#FFD166', 30, 200);
    }
  }

  private edgeDistance(angle: number, ring: Ring) {
    const gap = ring.kind === 'pulse'
      ? ring.gapSize * (0.65 + 0.35 * Math.sin(ring.pulse * 6))
      : ring.gapSize;
    const start = ring.gapStart;
    const end = ring.gapStart + gap;
    return Math.min(
      angleDistance(angle, start),
      angleDistance(angle, end)
    );
  }

  private onScore(perfect: boolean, x: number, y: number, ring: Ring) {
    const modeMult = this.mode === 'hyper' ? 2 : this.mode === 'mirror' ? 1.75 : this.mode === 'gauntlet' ? 1.5 : 1;
    this.lastPerfect = perfect;
    if (perfect) {
      this.combo += 1;
      this.consecutivePerfects += 1;
      this.perfectsThisRun += 1;
      this.bestCombo = Math.max(this.bestCombo, this.combo);
      this.multiplier = 1 + Math.min(this.combo, 15) * 0.28;
      const pts = Math.round((ring.danger ? 4 : 2) * this.multiplier * modeMult);
      this.score += pts;
      this.shardsEarned += ring.danger ? 2 : 1;
      this.flash = 1;
      this.shake = 0.4;
      this.float(ring.danger ? 'BOSS' : 'PERFECT', x, y - 30, '#06D6A0');
      this.burst(x, y, '#06D6A0', 16, 190);
      this.burst(this.centerX, this.centerY, this.trailColor, 10, 70);

      if (this.consecutivePerfects >= 5 && this.fever <= 0) {
        this.fever = 4.5;
        this.feverTriggered = true;
        this.float('FEVER', this.centerX, this.centerY - 70, '#FFD166');
        this.burst(this.centerX, this.centerY, '#FFD166', 28, 240);
      }
    } else {
      this.combo = 0;
      this.consecutivePerfects = 0;
      this.multiplier = 1;
      const pts = Math.round((ring.danger ? 2 : 1) * modeMult);
      this.score += pts;
      this.burst(x, y, '#7FDBDA', 9, 130);
    }
  }

  private gameOver(x: number, y: number) {
    this.phase = 'gameover';
    this.slowMo = 0.85;
    this.shake = 1.2;
    this.burst(x, y, '#EF476F', 26, 240);
    this.burst(this.centerX, this.centerY, this.skinColor, 14, 100);
  }

  private updateFx(dt: number) {
    this.particles = this.particles
      .map((p) => ({
        ...p,
        x: p.x + p.vx * dt,
        y: p.y + p.vy * dt,
        vx: p.vx * 0.98,
        vy: p.vy * 0.98 + 28 * dt,
        life: p.life - dt,
      }))
      .filter((p) => p.life > 0)
      .slice(-80);

    this.floats = this.floats
      .map((f) => ({ ...f, y: f.y - 28 * dt, life: f.life - dt }))
      .filter((f) => f.life > 0);
  }

  snapshot(): GameSnapshot {
    return {
      phase: this.phase,
      mode: this.mode,
      playerAngle: this.playerAngle,
      playerDirection: this.playerDirection,
      mirrorAngle: this.mirrorAngle,
      orbitRadius: this.orbitRadius,
      rings: this.rings.map((r) => ({ ...r })),
      pickups: this.pickups.map((p) => ({ ...p })),
      particles: this.particles.map((p) => ({ ...p })),
      trail: this.trail.map((t) => ({ ...t })),
      floats: this.floats.map((f) => ({ ...f })),
      score: this.score,
      combo: this.combo,
      bestCombo: this.bestCombo,
      multiplier: this.multiplier,
      timeAlive: this.timeAlive,
      shake: this.shake,
      flash: this.flash,
      fever: this.fever,
      nearMiss: this.nearMiss,
      wave: this.wave,
      wavesTotal: this.wavesTotal,
      shardsEarned: this.shardsEarned,
      lastPerfect: this.lastPerfect,
      slowMo: this.slowMo,
      width: this.width,
      height: this.height,
      skinColor: this.skinColor,
      trailColor: this.trailColor,
    };
  }
}
