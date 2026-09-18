import { Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../game/constants';

type Props = {
  score: number;
  bestCombo: number;
  highScore: number;
  isNewBest: boolean;
  onRetry: () => void;
  onMenu: () => void;
};

export function GameOverScreen({
  score,
  bestCombo,
  highScore,
  isNewBest,
  onRetry,
  onMenu,
}: Props) {
  const [fontsLoaded] = useFonts({
    Outfit_700Bold,
    Outfit_600SemiBold,
  });
  const titleStyle = fontsLoaded
    ? { fontFamily: 'Outfit_700Bold' as const }
    : undefined;
  const bodyStyle = fontsLoaded
    ? { fontFamily: 'Outfit_600SemiBold' as const }
    : undefined;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.card}>
        <Text style={[styles.label, bodyStyle]}>Game Over</Text>
        <Text style={[styles.score, titleStyle]}>{score}</Text>
        {isNewBest && (
          <Text style={[styles.newBest, bodyStyle]}>Neuer Highscore</Text>
        )}
        <View style={styles.row}>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, bodyStyle]}>Best Combo</Text>
            <Text style={[styles.statValue, titleStyle]}>{bestCombo}x</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, bodyStyle]}>Highscore</Text>
            <Text style={[styles.statValue, titleStyle]}>{highScore}</Text>
          </View>
        </View>

        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={[styles.ctaText, titleStyle]}>Nochmal</Text>
        </Pressable>
        <Pressable onPress={onMenu} style={styles.secondary}>
          <Text style={[styles.secondaryText, bodyStyle]}>Menü</Text>
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
    paddingHorizontal: 28,
    backgroundColor: 'rgba(7,19,31,0.55)',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: 10,
  },
  label: {
    color: COLORS.muted,
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  score: {
    color: COLORS.text,
    fontSize: 72,
    lineHeight: 76,
    letterSpacing: -2,
  },
  newBest: {
    color: COLORS.perfect,
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 28,
    marginVertical: 8,
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statValue: {
    color: COLORS.accentSoft,
    fontSize: 24,
  },
  cta: {
    marginTop: 12,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 44,
    paddingVertical: 15,
    borderRadius: 4,
    minWidth: 200,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  ctaText: {
    color: '#1A1208',
    fontSize: 18,
  },
  secondary: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  secondaryText: {
    color: COLORS.muted,
    fontSize: 15,
  },
});
