import { Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ACHIEVEMENTS, COLORS } from '../game/constants';
import type { MetaState } from '../game/types';

type Props = {
  meta: MetaState;
  onBack: () => void;
};

export function StatsScreen({ meta, onBack }: Props) {
  const [fontsLoaded] = useFonts({ Outfit_700Bold, Outfit_600SemiBold });
  const title = fontsLoaded ? { fontFamily: 'Outfit_700Bold' as const } : undefined;
  const body = fontsLoaded ? { fontFamily: 'Outfit_600SemiBold' as const } : undefined;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, title]}>STATS</Text>
      <View style={styles.grid}>
        <Stat label="Runs" value={`${meta.gamesPlayed}`} title={title} body={body} />
        <Stat label="Total" value={`${meta.totalScore}`} title={title} body={body} />
        <Stat label="Perfects" value={`${meta.perfects}`} title={title} body={body} />
        <Stat label="Near" value={`${meta.nearMisses}`} title={title} body={body} />
      </View>
      <Text style={[styles.sub, title]}>ACHIEVEMENTS</Text>
      <ScrollView contentContainerStyle={{ gap: 8 }}>
        {ACHIEVEMENTS.map((a) => {
          const done = meta.achievements.includes(a.id);
          return (
            <View key={a.id} style={[styles.ach, !done && styles.locked]}>
              <Text style={[styles.achTitle, body]}>
                {done ? '✓ ' : '○ '}
                {a.title}
              </Text>
              <Text style={[styles.achDesc, body]}>
                {a.desc} · +{a.reward}◆
              </Text>
            </View>
          );
        })}
      </ScrollView>
      <Pressable onPress={onBack} style={styles.back}>
        <Text style={[styles.backText, body]}>Zurück</Text>
      </Pressable>
    </View>
  );
}

function Stat({
  label,
  value,
  title,
  body,
}: {
  label: string;
  value: string;
  title?: { fontFamily: 'Outfit_700Bold' };
  body?: { fontFamily: 'Outfit_600SemiBold' };
}) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statLabel, body]}>{label}</Text>
      <Text style={[styles.statValue, title]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    paddingHorizontal: 22,
    paddingTop: 64,
    paddingBottom: 40,
    backgroundColor: 'rgba(5,11,20,0.82)',
  },
  heading: { color: COLORS.text, fontSize: 28, letterSpacing: 2, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  stat: {
    width: '47%',
    backgroundColor: COLORS.card,
    borderRadius: 6,
    padding: 12,
  },
  statLabel: { color: COLORS.muted, fontSize: 12, letterSpacing: 1 },
  statValue: { color: COLORS.accentSoft, fontSize: 24, marginTop: 4 },
  sub: { color: COLORS.text, fontSize: 16, letterSpacing: 1, marginBottom: 10 },
  ach: {
    backgroundColor: COLORS.card,
    borderRadius: 6,
    padding: 12,
  },
  locked: { opacity: 0.45 },
  achTitle: { color: COLORS.text, fontSize: 14 },
  achDesc: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  back: { alignItems: 'center', paddingVertical: 12 },
  backText: { color: COLORS.muted, fontSize: 15 },
});
