import { Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, MODES } from '../game/constants';
import type { GameModeId, MetaState } from '../game/types';

type Props = {
  meta: MetaState;
  onSelect: (mode: GameModeId) => void;
  onBack: () => void;
};

export function ModeScreen({ meta, onSelect, onBack }: Props) {
  const [fontsLoaded] = useFonts({ Outfit_700Bold, Outfit_600SemiBold });
  const title = fontsLoaded ? { fontFamily: 'Outfit_700Bold' as const } : undefined;
  const body = fontsLoaded ? { fontFamily: 'Outfit_600SemiBold' as const } : undefined;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, title]}>MODUS</Text>
      <View style={styles.list}>
        {MODES.map((m) => {
          const locked = !meta.unlockedModes.includes(m.id);
          return (
            <Pressable
              key={m.id}
              disabled={locked}
              onPress={() => onSelect(m.id)}
              style={({ pressed }) => [
                styles.card,
                locked && styles.locked,
                pressed && !locked && styles.pressed,
              ]}
            >
              <View style={styles.cardTop}>
                <Text style={[styles.name, title]}>{m.name}</Text>
                <Text style={[styles.mult, body]}>×{m.scoreMult}</Text>
              </View>
              <Text style={[styles.blurb, body]}>
                {locked ? `Freischalten ab Best ${m.unlockScore}` : m.blurb}
              </Text>
              <Text style={[styles.best, body]}>
                Best {meta.highScores[m.id] ?? 0}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable onPress={onBack} style={styles.back}>
        <Text style={[styles.backText, body]}>Zurück</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    paddingHorizontal: 22,
    paddingTop: 64,
    paddingBottom: 40,
    backgroundColor: 'rgba(5,11,20,0.72)',
  },
  heading: {
    color: COLORS.text,
    fontSize: 28,
    letterSpacing: 2,
    marginBottom: 16,
  },
  list: { gap: 12, flex: 1 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(127,219,218,0.18)',
  },
  locked: { opacity: 0.45 },
  pressed: { transform: [{ scale: 0.98 }] },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { color: COLORS.text, fontSize: 20, letterSpacing: 1 },
  mult: { color: COLORS.accent, fontSize: 14 },
  blurb: { color: COLORS.muted, fontSize: 13, marginTop: 6, lineHeight: 18 },
  best: { color: COLORS.accentSoft, fontSize: 12, marginTop: 8, letterSpacing: 1 },
  back: { alignItems: 'center', paddingVertical: 12 },
  backText: { color: COLORS.muted, fontSize: 15 },
});
