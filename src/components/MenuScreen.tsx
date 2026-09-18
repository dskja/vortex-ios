import { Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../game/constants';

type Props = {
  highScore: number;
  onPlay: () => void;
};

export function MenuScreen({ highScore, onPlay }: Props) {
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
      <View style={styles.brandBlock}>
        <Text style={[styles.brand, titleStyle]}>VORTEX</Text>
        <Text style={[styles.tagline, bodyStyle]}>
          Tippen. Drehen. Die Lücke treffen.
        </Text>
      </View>

      <View style={styles.bottom}>
        {highScore > 0 && (
          <Text style={[styles.high, bodyStyle]}>Best {highScore}</Text>
        )}
        <Pressable
          onPress={onPlay}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <Text style={[styles.ctaText, titleStyle]}>Spielen</Text>
        </Pressable>
        <Text style={[styles.hint, bodyStyle]}>
          Tippe, um die Orbit-Richtung umzukehren
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 72,
    paddingBottom: 56,
  },
  brandBlock: {
    alignItems: 'flex-start',
    gap: 10,
  },
  brand: {
    color: COLORS.text,
    fontSize: 56,
    letterSpacing: -1.5,
    lineHeight: 58,
  },
  tagline: {
    color: COLORS.muted,
    fontSize: 16,
    lineHeight: 22,
    maxWidth: 260,
  },
  bottom: {
    alignItems: 'center',
    gap: 14,
  },
  high: {
    color: COLORS.accentSoft,
    fontSize: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  cta: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 4,
    minWidth: 220,
    alignItems: 'center',
  },
  ctaPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.92,
  },
  ctaText: {
    color: '#1A1208',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  hint: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.85,
  },
});
