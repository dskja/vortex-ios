import { activateKeepAwakeAsync } from 'expo-keep-awake';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { GameCanvas } from './src/components/GameCanvas';
import { GameOverScreen } from './src/components/GameOverScreen';
import { HangarScreen } from './src/components/HangarScreen';
import { HUD } from './src/components/HUD';
import { MenuScreen } from './src/components/MenuScreen';
import { ModeScreen } from './src/components/ModeScreen';
import { StatsScreen } from './src/components/StatsScreen';
import { COLORS } from './src/game/constants';
import { VortexEngine } from './src/game/engine';
import type { GameModeId, GameSnapshot, MetaState } from './src/game/types';
import {
  applyRunRewards,
  buySkin,
  defaultMeta,
  loadMeta,
  saveMeta,
  skinById,
} from './src/meta/progression';

const emptySnap = (w: number, h: number): GameSnapshot => ({
  phase: 'menu',
  mode: 'classic',
  playerAngle: -Math.PI / 2,
  playerDirection: 1,
  mirrorAngle: Math.PI / 2,
  orbitRadius: 112,
  rings: [],
  pickups: [],
  particles: [],
  trail: [],
  floats: [],
  score: 0,
  combo: 0,
  bestCombo: 0,
  multiplier: 1,
  timeAlive: 0,
  shake: 0,
  flash: 0,
  fever: 0,
  nearMiss: 0,
  wave: 0,
  wavesTotal: 0,
  shardsEarned: 0,
  lastPerfect: false,
  slowMo: 0,
  width: w,
  height: h,
  skinColor: '#FF8A3D',
  trailColor: '#FFD166',
});

export default function App() {
  const { width, height } = useWindowDimensions();
  const engineRef = useRef(new VortexEngine());
  const [snap, setSnap] = useState<GameSnapshot>(() => emptySnap(width, height));
  const [uiPhase, setUiPhase] = useState<
    'menu' | 'modes' | 'hangar' | 'stats' | 'playing' | 'gameover'
  >('menu');
  const [meta, setMeta] = useState<MetaState>(defaultMeta());
  const [selectedMode, setSelectedMode] = useState<GameModeId>('classic');
  const [isNewBest, setIsNewBest] = useState(false);
  const [unlocks, setUnlocks] = useState<string[]>([]);
  const [cleared, setCleared] = useState(false);

  const prevScore = useRef(0);
  const prevCombo = useRef(0);
  const prevPhase = useRef(snap.phase);
  const metaRef = useRef(meta);

  useEffect(() => {
    metaRef.current = meta;
  }, [meta]);

  useEffect(() => {
    activateKeepAwakeAsync().catch(() => undefined);
    loadMeta().then((m) => {
      setMeta(m);
      const skin = skinById(m.equippedSkin);
      engineRef.current.setSkin(skin.color, skin.trail);
    });
  }, []);

  useEffect(() => {
    engineRef.current.resize(width, height);
    setSnap(engineRef.current.snapshot());
  }, [width, height]);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    let alive = true;

    const loop = (now: number) => {
      if (!alive) return;
      const dt = (now - last) / 1000;
      last = now;
      const engine = engineRef.current;
      engine.update(dt);
      const next = engine.snapshot();
      setSnap(next);

      if (next.phase === 'playing') {
        if (next.score > prevScore.current && Platform.OS !== 'web') {
          Haptics.impactAsync(
            next.lastPerfect
              ? Haptics.ImpactFeedbackStyle.Medium
              : Haptics.ImpactFeedbackStyle.Light
          ).catch(() => undefined);
        }
        prevScore.current = next.score;
        prevCombo.current = next.combo;
      }

      if (prevPhase.current === 'playing' && next.phase === 'gameover') {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
          ).catch(() => undefined);
        }
        const before = metaRef.current.highScores[next.mode] ?? 0;
        const result = applyRunRewards(
          metaRef.current,
          next.mode,
          next.score,
          next.bestCombo,
          next.shardsEarned,
          engine.perfectsThisRun,
          engine.nearMissesThisRun,
          engine.feverTriggered,
          engine.gauntletCleared
        );
        setMeta(result.meta);
        metaRef.current = result.meta;
        saveMeta(result.meta).catch(() => undefined);
        setIsNewBest(next.score > before);
        setUnlocks([...result.unlocked, ...result.newAchievements]);
        setCleared(engine.gauntletCleared);
        setUiPhase('gameover');
      }

      prevPhase.current = next.phase;
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
    };
  }, []);

  const applySkin = useCallback((metaState: MetaState) => {
    const skin = skinById(metaState.equippedSkin);
    engineRef.current.setSkin(skin.color, skin.trail);
  }, []);

  const startMode = useCallback(
    (mode: GameModeId) => {
      setSelectedMode(mode);
      prevScore.current = 0;
      prevCombo.current = 0;
      applySkin(metaRef.current);
      engineRef.current.resize(width, height);
      engineRef.current.start(mode);
      setUiPhase('playing');
      setSnap(engineRef.current.snapshot());
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(
          () => undefined
        );
      }
    },
    [width, height, applySkin]
  );

  const goMenu = useCallback(() => {
    engineRef.current.phase = 'menu';
    engineRef.current.rings = [];
    engineRef.current.particles = [];
    engineRef.current.floats = [];
    setUiPhase('menu');
    setSnap(engineRef.current.snapshot());
  }, []);

  const onTap = useCallback(() => {
    if (engineRef.current.phase === 'playing') {
      engineRef.current.reverse();
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync().catch(() => undefined);
      }
    }
  }, []);

  const onBuyOrEquip = useCallback((skinId: string) => {
    const next = buySkin(metaRef.current, skinId);
    if (!next) return;
    setMeta(next);
    metaRef.current = next;
    applySkin(next);
    saveMeta(next).catch(() => undefined);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
        () => undefined
      );
    }
  }, [applySkin]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[COLORS.bgTop, COLORS.bgMid, COLORS.bgBottom]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <GameCanvas snap={snap} />

      {uiPhase === 'playing' && (
        <Pressable style={StyleSheet.absoluteFill} onPress={onTap} />
      )}

      <HUD snap={snap} />

      {uiPhase === 'menu' && (
        <MenuScreen
          meta={meta}
          onPlay={() => setUiPhase('modes')}
          onHangar={() => setUiPhase('hangar')}
          onStats={() => setUiPhase('stats')}
        />
      )}

      {uiPhase === 'modes' && (
        <ModeScreen
          meta={meta}
          onSelect={startMode}
          onBack={() => setUiPhase('menu')}
        />
      )}

      {uiPhase === 'hangar' && (
        <HangarScreen
          meta={meta}
          onBuyOrEquip={onBuyOrEquip}
          onBack={() => setUiPhase('menu')}
        />
      )}

      {uiPhase === 'stats' && (
        <StatsScreen meta={meta} onBack={() => setUiPhase('menu')} />
      )}

      {uiPhase === 'gameover' && (
        <GameOverScreen
          score={snap.score}
          bestCombo={snap.bestCombo}
          highScore={meta.highScores[snap.mode] ?? 0}
          shards={snap.shardsEarned}
          isNewBest={isNewBest}
          cleared={cleared}
          unlocks={unlocks}
          onRetry={() => startMode(selectedMode)}
          onMenu={goMenu}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgTop,
  },
});
