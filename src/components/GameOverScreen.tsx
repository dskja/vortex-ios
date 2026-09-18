import { Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../game/constants';

type Props = {
  score: number;
  bestCombo: number;
  highScore: number;
  shards: number;
  isNewBest: boolean;
  cleared?: boolean;
  unlocks: string[];
  onRetry: () => void;
  onMenu: () => void;
};

export function GameOverScreen({
  score,
  bestCombo,
  highScore,
  shards,
  isNewBest,
  cleared,
  unlocks,
  onRetry,
  onMenu,
}: Props) {
  const [fontsLoaded] = useFonts({ Outfit_700Bold, Outfit_600SemiBold });
  const title = fontsLoaded ? { fontFamily: 'Outfit_700Bold' as const } : undefined;
  const body = fontsLoaded ? { fontFamily: 'Outfit_600SemiBold' as const } : undefined;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.card}>
        <Text style={[styles.label, body]}>
          {cleared ? 'GAUNTLET CLEARED' : 'GAME OVER'}
        </Text>
        <Text style={[styles.score, title]}>{score}</Text>
        {isNewBest && (
          <Text style={[styles.newBest, body]}>NEUER HIGHSCORE</Text>
        )}
        <View style={styles.row}>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, body]}>Combo</Text>
            <Text style={[styles.statValue, title]}>{bestCombo}x</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, body]}>Best</Text>
            <Text style={[styles.statValue, title]}>{highScore}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, body]}>Shards</Text>
            <Text style={[styles.statValue, title]}>+{shards}</Text>
          </View>
        </View>
        {unlocks.length > 0 && (
          <Text style={[styles.unlock, body]}>{unlocks.join(' · ')}</Text>
        )}
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={[styles.ctaText, title]}>NOCHMAL</Text>
        </Pressable>
        <Pressable onPress={onMenu} style={styles.secondary}>
          <Text style={[styles.secondaryText, body]}>Menü</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 26,
    backgroundColor: 'rgba(5,11,20,0.62)',
  },
  card: { width: '100%', maxWidth: 380, alignItems: 'center', gap: 8 },
  label: {
    color: COLORS.muted,
    fontSize: 13,
    letterSpacing: 2,
  },
  score: {
    color: COLORS.text,
    fontSize: 72,
    lineHeight: 76,
    letterSpacing: -2,
  },
  newBest: {
    color: COLORS.perfect,
    fontSize: 13,
    letterSpacing: 1,
  },
  row: { flexDirection: 'row', gap: 22, marginVertical: 8 },
  stat: { alignItems: 'center', gap: 3 },
  statLabel: {
    color: COLORS.muted,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statValue: { color: COLORS.accentSoft, fontSize: 22 },
  unlock: {
    color: COLORS.fever,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  cta: {
    marginTop: 8,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 44,
    paddingVertical: 15,
    borderRadius: 4,
    minWidth: 200,
    alignItems: 'center',
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.97 }] },
  ctaText: { color: '#1A1008', fontSize: 17, letterSpacing: 1 },
  secondary: { paddingVertical: 10 },
  secondaryText: { color: COLORS.muted, fontSize: 15 },
});
