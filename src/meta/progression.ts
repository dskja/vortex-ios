import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACHIEVEMENTS, MODES, SKINS } from '../game/constants';
import type { GameModeId, MetaState } from '../game/types';

const KEY = 'vortex.meta.v2';

export function defaultMeta(): MetaState {
  return {
    highScores: { classic: 0, hyper: 0, mirror: 0, gauntlet: 0 },
    bestCombos: { classic: 0, hyper: 0, mirror: 0, gauntlet: 0 },
    shards: 0,
    unlockedSkins: ['ember'],
    equippedSkin: 'ember',
    unlockedModes: ['classic'],
    achievements: [],
    gamesPlayed: 0,
    totalScore: 0,
    perfects: 0,
    nearMisses: 0,
  };
}

export async function loadMeta(): Promise<MetaState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return defaultMeta();
    return { ...defaultMeta(), ...JSON.parse(raw) };
  } catch {
    return defaultMeta();
  }
}

export async function saveMeta(meta: MetaState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(meta));
}

export function skinById(id: string) {
  return SKINS.find((s) => s.id === id) ?? SKINS[0];
}

export function applyRunRewards(
  meta: MetaState,
  mode: GameModeId,
  score: number,
  bestCombo: number,
  shardsEarned: number,
  perfects: number,
  nearMisses: number,
  feverTriggered: boolean,
  gauntletCleared: boolean
): { meta: MetaState; unlocked: string[]; newAchievements: string[] } {
  const next: MetaState = {
    ...meta,
    highScores: { ...meta.highScores },
    bestCombos: { ...meta.bestCombos },
    unlockedSkins: [...meta.unlockedSkins],
    unlockedModes: [...meta.unlockedModes],
    achievements: [...meta.achievements],
  };

  const unlocked: string[] = [];
  const newAchievements: string[] = [];

  next.gamesPlayed += 1;
  next.totalScore += score;
  next.perfects += perfects;
  next.nearMisses += nearMisses;
  next.shards += shardsEarned;
  next.highScores[mode] = Math.max(next.highScores[mode], score);
  next.bestCombos[mode] = Math.max(next.bestCombos[mode], bestCombo);

  const bestAny = Math.max(...Object.values(next.highScores));
  for (const modeDef of MODES) {
    if (
      !next.unlockedModes.includes(modeDef.id) &&
      bestAny >= modeDef.unlockScore
    ) {
      next.unlockedModes.push(modeDef.id);
      unlocked.push(`Modus ${modeDef.name}`);
    }
  }

  const check = (id: string, ok: boolean) => {
    if (ok && !next.achievements.includes(id)) {
      next.achievements.push(id);
      const a = ACHIEVEMENTS.find((x) => x.id === id);
      if (a) {
        next.shards += a.reward;
        newAchievements.push(a.title);
      }
    }
  };

  check('first_blood', next.gamesPlayed >= 1);
  check('combo_5', bestCombo >= 5);
  check('combo_12', bestCombo >= 12);
  check('score_50', score >= 50);
  check('score_100', score >= 100);
  check('fever', feverTriggered);
  check('near_10', next.nearMisses >= 10);
  check('hyper_clear', mode === 'hyper' && score >= 30);
  check('mirror_clear', mode === 'mirror' && score >= 20);
  check('gauntlet_win', gauntletCleared);

  return { meta: next, unlocked, newAchievements };
}

export function buySkin(meta: MetaState, skinId: string): MetaState | null {
  const skin = SKINS.find((s) => s.id === skinId);
  if (!skin) return null;
  if (meta.unlockedSkins.includes(skinId)) {
    return { ...meta, equippedSkin: skinId };
  }
  if (meta.shards < skin.cost) return null;
  return {
    ...meta,
    shards: meta.shards - skin.cost,
    unlockedSkins: [...meta.unlockedSkins, skinId],
    equippedSkin: skinId,
  };
}

export function rankForScore(score: number): string {
  if (score >= 150) return 'SINGULARITY';
  if (score >= 100) return 'DIAMOND';
  if (score >= 60) return 'PLATINUM';
  if (score >= 35) return 'GOLD';
  if (score >= 15) return 'SILVER';
  return 'BRONZE';
}
