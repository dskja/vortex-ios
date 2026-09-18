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
} from 'react-native-svg';
import { COLORS, PLAYER_RADIUS, RING_THICKNESS } from '../game/constants';
import type { GameSnapshot, Ring } from '../game/types';

function ringPath(
  cx: number,
  cy: number,
  radius: number,
  gapStart: number,
  gapSize: number,
  thickness: number
) {
  const outer = radius + thickness / 2;
  const inner = Math.max(4, radius - thickness / 2);
  const start = gapStart + gapSize;
  const end = gapStart + Math.PI * 2;
  const sweep = end - start;
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
}

function RingShape({
  ring,
  cx,
  cy,
}: {
  ring: Ring;
  cx: number;
  cy: number;
}) {
  const d = useMemo(
    () =>
      ringPath(cx, cy, ring.radius, ring.gapStart, ring.gapSize, RING_THICKNESS),
    [cx, cy, ring.radius, ring.gapStart, ring.gapSize]
  );
  if (!d) return null;
  const opacity = Math.min(1, (ring.radius - 40) / 180);
  return (
    <Path
      d={d}
      fill={COLORS.ring}
      opacity={0.35 + opacity * 0.55}
    />
  );
}

type Props = {
  snap: GameSnapshot;
};

export function GameCanvas({ snap }: Props) {
  const cx = snap.width / 2;
  const cy = snap.height * 0.48;
  const shakeX = snap.shake > 0 ? (Math.random() - 0.5) * 14 * snap.shake : 0;
  const shakeY = snap.shake > 0 ? (Math.random() - 0.5) * 14 * snap.shake : 0;
  const px = cx + Math.cos(snap.playerAngle) * snap.orbitRadius;
  const py = cy + Math.sin(snap.playerAngle) * snap.orbitRadius;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg
        width={snap.width}
        height={snap.height}
        style={{ transform: [{ translateX: shakeX }, { translateY: shakeY }] }}
      >
        <Defs>
          <RadialGradient id="core" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#1D3557" stopOpacity="0.9" />
            <Stop offset="55%" stopColor="#0B1C2C" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#07131F" stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="flash" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={COLORS.perfect} stopOpacity={snap.flash * 0.35} />
            <Stop offset="100%" stopColor={COLORS.perfect} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        <Circle cx={cx} cy={cy} r={Math.min(snap.width, snap.height) * 0.42} fill="url(#core)" />
        {snap.flash > 0 && (
          <Circle cx={cx} cy={cy} r={snap.orbitRadius + 40} fill="url(#flash)" />
        )}

        <Circle
          cx={cx}
          cy={cy}
          r={snap.orbitRadius}
          stroke="rgba(168,218,220,0.18)"
          strokeWidth={1.5}
          strokeDasharray="4 10"
          fill="none"
        />

        <Circle cx={cx} cy={cy} r={18} fill={COLORS.center} opacity={0.85} />
        <Circle cx={cx} cy={cy} r={7} fill={COLORS.accentSoft} opacity={0.9} />

        {snap.rings.map((ring) => (
          <RingShape key={ring.id} ring={ring} cx={cx} cy={cy} />
        ))}

        <G>
          {snap.trail.map((t, i) => (
            <Circle
              key={`t-${i}`}
              cx={t.x}
              cy={t.y}
              r={PLAYER_RADIUS * 0.55 * (t.life / 0.28)}
              fill={COLORS.player}
              opacity={t.life * 1.6}
            />
          ))}
        </G>

        <Circle
          cx={px}
          cy={py}
          r={PLAYER_RADIUS + 5}
          fill={COLORS.player}
          opacity={0.22}
        />
        <Circle cx={px} cy={py} r={PLAYER_RADIUS} fill={COLORS.player} />
        <Circle
          cx={px - 3}
          cy={py - 3}
          r={3.5}
          fill="#FFF6E8"
          opacity={0.75}
        />

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
      </Svg>
    </View>
  );
}
