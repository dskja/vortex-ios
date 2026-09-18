import { Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold } from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../game/constants';
import { rankForScore } from '../meta/progression';
import type { MetaState } from '../game/types';

type Props = {
  meta: MetaState;
  onPlay: () => void;
  onHangar: () => void;
  onStats: () => void;
};

export function MenuScreen({ meta, onPlay, onHangar, onStats }: Props) {
  const [fontsLoaded] = useFonts({
    Outfit_800ExtraBold,
    Outfit_700Bold,
    Outfit_600SemiBold,
  });
  const brand = fontsLoaded ? { fontFamily: 'Outfit_800ExtraBold' as const } : undefined;
  const title = fontsLoaded ? { fontFamily: 'Outfit_700Bold' as const } : undefined;
  const body = fontsLoaded ? { fontFamily: 'Outfit_600SemiBold' as const } : undefined;
  const best = Math.max(...Object.values(meta.highScores));

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.top}>
        <Text style={[styles.brand, brand]}>VORTEX</Text>
        <Text style={[styles.tag, body]}>Präzision. Tempo. Suchtfaktor.</Text>
        <View style={styles.metaRow}>
          <Text style={[styles.chip, body]}>◆ {meta.shards}</Text>
          <Text style={[styles.chip, body]}>{rankForScore(best)}</Text>
        </View>
      </View>

      <View style={styles.bottom}>
        {best > 0 && (
          <Text style={[styles.best, body]}>BEST {best}</Text>
        )}
        <Pressable
          onPress={onPlay}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={[styles.ctaText, title]}>SPIELEN</Text>
        </Pressable>
        <View style={styles.row}>
          <Pressable onPress={onHangar} style={styles.secondary}>
            <Text style={[styles.secondaryText, body]}>Hangar</Text>
          </Pressable>
          <Pressable onPress={onStats} style={styles.secondary}>
            <Text style={[styles.secondaryText, body]}>Stats</Text>
          </Pressable>
        </View>
        <Text style={[styles.hint, body]}>Tippen = Orbit umkehren</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    paddingHorizontal: 26,
    paddingTop: 68,
    paddingBottom: 48,
  },
  top: { gap: 10 },
  brand: {
    color: COLORS.text,
    fontSize: 60,
    letterSpacing: -2,
    lineHeight: 60,
  },
  tag: { color: COLORS.muted, fontSize: 16, maxWidth: 280, lineHeight: 22 },
  metaRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  chip: {
    color: COLORS.accentSoft,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  bottom: { alignItems: 'center', gap: 12 },
  best: {
    color: COLORS.accentSoft,
    fontSize: 14,
    letterSpacing: 2,
  },
  cta: {
    backgroundColor: COLORS.accent,
    minWidth: 230,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 4,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.97 }] },
  ctaText: { color: '#1A1008', fontSize: 20, letterSpacing: 1 },
  row: { flexDirection: 'row', gap: 18 },
  secondary: { paddingVertical: 10, paddingHorizontal: 14 },
  secondaryText: { color: COLORS.muted, fontSize: 15 },
  hint: { color: COLORS.muted, fontSize: 12, opacity: 0.85, marginTop: 4 },
});
