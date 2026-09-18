import { Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../game/constants';
import type { GameSnapshot } from '../game/types';

export function HUD({ snap }: { snap: GameSnapshot }) {
  const [fontsLoaded] = useFonts({ Outfit_700Bold, Outfit_600SemiBold });
  if (snap.phase !== 'playing') return null;
  const title = fontsLoaded ? { fontFamily: 'Outfit_700Bold' as const } : undefined;
  const body = fontsLoaded ? { fontFamily: 'Outfit_600SemiBold' as const } : undefined;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={[styles.score, title]}>{snap.score}</Text>
      {snap.combo > 1 && (
        <Text style={[styles.combo, body]}>
          {snap.combo}x · ×{snap.multiplier.toFixed(2)}
        </Text>
      )}
      {snap.fever > 0 && <Text style={[styles.fever, body]}>FEVER</Text>}
      {snap.mode === 'gauntlet' && (
        <Text style={[styles.wave, body]}>
          WAVE {Math.min(snap.wave, snap.wavesTotal)}/{snap.wavesTotal}
        </Text>
      )}
      {snap.shardsEarned > 0 && (
        <Text style={[styles.shards, body]}>◆ {snap.shardsEarned}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 3,
  },
  score: { color: COLORS.text, fontSize: 44, letterSpacing: -1 },
  combo: {
    color: COLORS.accentSoft,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  fever: {
    color: COLORS.fever,
    fontSize: 15,
    letterSpacing: 3,
    marginTop: 4,
  },
  wave: { color: COLORS.ring, fontSize: 12, letterSpacing: 1, marginTop: 2 },
  shards: { color: COLORS.ring, fontSize: 12, marginTop: 2 },
});
