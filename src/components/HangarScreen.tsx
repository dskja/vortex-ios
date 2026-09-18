import { Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS, SKINS } from '../game/constants';
import type { MetaState } from '../game/types';

type Props = {
  meta: MetaState;
  onBuyOrEquip: (skinId: string) => void;
  onBack: () => void;
};

export function HangarScreen({ meta, onBuyOrEquip, onBack }: Props) {
  const [fontsLoaded] = useFonts({ Outfit_700Bold, Outfit_600SemiBold });
  const title = fontsLoaded ? { fontFamily: 'Outfit_700Bold' as const } : undefined;
  const body = fontsLoaded ? { fontFamily: 'Outfit_600SemiBold' as const } : undefined;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, title]}>HANGAR</Text>
      <Text style={[styles.sub, body]}>◆ {meta.shards} Shards</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {SKINS.map((s) => {
          const owned = meta.unlockedSkins.includes(s.id);
          const equipped = meta.equippedSkin === s.id;
          return (
            <Pressable
              key={s.id}
              onPress={() => onBuyOrEquip(s.id)}
              style={[styles.card, equipped && styles.equipped]}
            >
              <View style={[styles.swatch, { backgroundColor: s.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, title]}>{s.name}</Text>
                <Text style={[styles.meta, body]}>
                  {equipped
                    ? 'Ausgerüstet'
                    : owned
                      ? 'Besitzt'
                      : `${s.cost} ◆`}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
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
    backgroundColor: 'rgba(5,11,20,0.82)',
  },
  heading: { color: COLORS.text, fontSize: 28, letterSpacing: 2 },
  sub: { color: COLORS.accentSoft, marginTop: 6, marginBottom: 14, fontSize: 14 },
  list: { gap: 10, paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.card,
    borderRadius: 6,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  equipped: { borderColor: COLORS.accent },
  swatch: { width: 36, height: 36, borderRadius: 18 },
  name: { color: COLORS.text, fontSize: 17 },
  meta: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  back: { alignItems: 'center', paddingVertical: 12 },
  backText: { color: COLORS.muted, fontSize: 15 },
});
