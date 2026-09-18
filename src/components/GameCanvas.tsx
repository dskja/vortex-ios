import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { COLORS, PLAYER_RADIUS, RING_THICKNESS } from '../game/constants';
import type { GameSnapshot, Ring } from '../game/types';

function ringPath(
  cx: number,
  cy: number,
  radius: number,
  gapStart: number,
  gapSize: number,
  thickness: number,
  gap2Start?: number,
  gap2Size?: number
) {
  const outer = radius + thickness / 2;
  const inner = Math.max(4, radius - thickness / 2);

  const arc = (start: number, end: number) => {
    let sweep = end - start;
    while (sweep < 0) sweep += Math.PI * 2;
    while (sweep > Math.PI * 2) sweep -= Math.PI * 2;
    if (sweep <= 0.02) return '';
    const large = sweep > Math.PI ? 1 : 0;
    const ox1 = cx + Math.cos(start) * outer;
    const oy1 = cy + Math.sin(start) * outer;
    const ox2 = cx + Math.cos(end) * outer;
    const oy2 = cy + Math.sin(end) * outer;
    const ix1 = cx + Math.cos(end) * inner;
    const iy1 = cy + Math.sin(end) * inner;
    const ix2 = cx + Math.cos(start) * inner;
    const iy2 = cy + Math.sin(start) * inner;
    return [
      `M ${ox1} ${oy1}`,
      `A ${outer} ${outer} 0 ${large} 1 ${ox2} ${oy2}`,
      `L ${ix1} ${iy1}`,
      `A ${inner} ${inner} 0 ${large} 0 ${ix2} ${iy2}`,
      'Z',
    ].join(' ');
  };

  if (gap2Start != null && gap2Size != null) {
    const a1 = gapStart + gapSize;
    const a2 = gap2Start;
    const b1 = gap2Start + gap2Size;
    const b2 = gapStart + Math.PI * 2;
    return [arc(a1, a2), arc(b1, b2)].filter(Boolean).join(' ');
  }

  return arc(gapStart + gapSize, gapStart + Math.PI * 2);
}

function ringFill(ring: Ring) {
  if (ring.kind === 'boss') return COLORS.ringBoss;
  if (ring.kind === 'pulse') return COLORS.ringPulse;
  if (ring.kind === 'spinner') return '#4CC9F0';
  return COLORS.ring;
}

function RingShape({ ring, cx, cy }: { ring: Ring; cx: number; cy: number }) {
  const gap =
    ring.kind === 'pulse'
      ? ring.gapSize * (0.65 + 0.35 * Math.sin(ring.pulse * 6))
      : ring.gapSize;
  const d = useMemo(
    () =>
      ringPath(
        cx,
        cy,
        ring.radius,
        ring.gapStart,
        gap,
        RING_THICKNESS * (ring.danger ? 1.25 : 1),
        ring.gap2Start,
        ring.gap2Size
      ),
    [cx, cy, ring.radius, ring.gapStart, gap, ring.gap2Start, ring.gap2Size, ring.danger]
  );
  if (!d) return null;
  const opacity = Math.min(1, (ring.radius - 36) / 170);
  return <Path d={d} fill={ringFill(ring)} opacity={0.4 + opacity * 0.55} />;
}

export function GameCanvas({ snap }: { snap: GameSnapshot }) {
  const cx = snap.width / 2;
  const cy = snap.height * 0.46;
  const shakeX = snap.shake > 0 ? (Math.random() - 0.5) * 16 * snap.shake : 0;
  const shakeY = snap.shake > 0 ? (Math.random() - 0.5) * 16 * snap.shake : 0;
  const px = cx + Math.cos(snap.playerAngle) * snap.orbitRadius;
  const py = cy + Math.sin(snap.playerAngle) * snap.orbitRadius;
  const mx = cx + Math.cos(snap.mirrorAngle) * snap.orbitRadius;
  const my = cy + Math.sin(snap.mirrorAngle) * snap.orbitRadius;
  const feverPulse = snap.fever > 0 ? 0.15 + Math.sin(Date.now() / 80) * 0.08 : 0;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg
        width={snap.width}
        height={snap.height}
        style={{ transform: [{ translateX: shakeX }, { translateY: shakeY }] }}
      >
        <Defs>
          <RadialGradient id="core" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#1D3557" stopOpacity="0.95" />
            <Stop offset="50%" stopColor="#0B1C2C" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#050B14" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="feverGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={COLORS.fever} stopOpacity={feverPulse} />
            <Stop offset="100%" stopColor={COLORS.fever} stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="flash" x1="0" y1="0" x2="0" y2="1">
            <Stop
              offset="0%"
              stopColor={COLORS.perfect}
              stopOpacity={snap.flash * 0.4}
            />
            <Stop offset="100%" stopColor={COLORS.perfect} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        <Circle
          cx={cx}
          cy={cy}
          r={Math.min(snap.width, snap.height) * 0.44}
          fill="url(#core)"
        />
        {snap.fever > 0 && (
          <Circle cx={cx} cy={cy} r={snap.orbitRadius + 90} fill="url(#feverGlow)" />
        )}
        {snap.flash > 0 && (
          <Circle cx={cx} cy={cy} r={snap.orbitRadius + 50} fill="url(#flash)" />
        )}

        <Circle
          cx={cx}
          cy={cy}
          r={snap.orbitRadius}
          stroke={
            snap.nearMiss > 0
              ? 'rgba(255,209,102,0.55)'
              : 'rgba(127,219,218,0.18)'
          }
          strokeWidth={snap.nearMiss > 0 ? 2.5 : 1.5}
          strokeDasharray="5 11"
          fill="none"
        />

        <Circle cx={cx} cy={cy} r={22} fill={COLORS.center} opacity={0.9} />
        <Circle
          cx={cx}
          cy={cy}
          r={8}
          fill={snap.fever > 0 ? COLORS.fever : COLORS.accentSoft}
        />

        {snap.rings.map((ring) => (
          <RingShape key={ring.id} ring={ring} cx={cx} cy={cy} />
        ))}

        {snap.pickups
          .filter((p) => !p.taken)
          .map((p) => {
            const x = cx + Math.cos(p.angle) * p.radius;
            const y = cy + Math.sin(p.angle) * p.radius;
            return (
              <Circle
                key={p.id}
                cx={x}
                cy={y}
                r={5}
                fill="#7FDBDA"
                opacity={0.9}
              />
            );
          })}

        <G>
          {snap.trail.map((t, i) => (
            <Circle
              key={`t-${i}`}
              cx={t.x}
              cy={t.y}
              r={PLAYER_RADIUS * 0.5 * (t.life / 0.3)}
              fill={t.mirror ? '#90E0EF' : snap.trailColor}
              opacity={t.life * 1.5}
            />
          ))}
        </G>

        <Circle cx={px} cy={py} r={PLAYER_RADIUS + 6} fill={snap.skinColor} opacity={0.25} />
        <Circle cx={px} cy={py} r={PLAYER_RADIUS} fill={snap.skinColor} />
        <Circle cx={px - 3} cy={py - 3} r={3.2} fill="#FFF8EF" opacity={0.8} />

        {snap.mode === 'mirror' && (
          <G>
            <Circle cx={mx} cy={my} r={PLAYER_RADIUS + 5} fill="#4CC9F0" opacity={0.22} />
            <Circle cx={mx} cy={my} r={PLAYER_RADIUS * 0.9} fill="#4CC9F0" />
          </G>
        )}

        {snap.particles.map((p) => (
          <Circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={p.size * (p.life / p.maxLife)}
            fill={p.color}
            opacity={Math.max(0, p.life / p.maxLife)}
          />
        ))}

        {snap.floats.map((f) => (
          <SvgText
            key={f.id}
            x={f.x}
            y={f.y}
            fill={f.color}
            opacity={Math.max(0, f.life)}
            fontSize="16"
            fontWeight="700"
            textAnchor="middle"
          >
            {f.text}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}
