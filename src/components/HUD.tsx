import { Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../game/constants';
import type { GameSnapshot } from '../game/types';

type Props = {
  snap: GameSnapshot;
};

export function HUD({ snap }: Props) {
  const [fontsLoaded] = useFonts({
    Outfit_700Bold,
    Outfit_600SemiBold,
  });
  if (snap.phase !== 'playing') return null;

  const titleStyle = fontsLoaded
    ? { fontFamily: 'Outfit_700Bold' as const }
    : undefined;
  const bodyStyle = fontsLoaded
    ? { fontFamily: 'Outfit_600SemiBold' as const }
    : undefined;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={[styles.score, titleStyle]}>{snap.score}</Text>
      {snap.combo > 1 && (
        <Text style={[styles.combo, bodyStyle]}>
          {snap.combo}x combo · ×{snap.multiplier.toFixed(2)}
        </Text>
      )}
      {snap.lastPerfect && snap.flash > 0.4 && (
        <Text style={[styles.perfect, bodyStyle]}>PERFECT</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 4,
  },
  score: {
    color: COLORS.text,
    fontSize: 42,
    letterSpacing: -1,
  },
  combo: {
    color: COLORS.accentSoft,
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  perfect: {
    marginTop: 8,
    color: COLORS.perfect,
    fontSize: 16,
    letterSpacing: 3,
  },
});
