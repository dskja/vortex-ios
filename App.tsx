import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { HUD } from './src/components/HUD';
import { MenuScreen } from './src/components/MenuScreen';
import { COLORS } from './src/game/constants';
import { VortexEngine } from './src/game/engine';
import type { GameSnapshot, ScoreRecord } from './src/game/types';

const STORAGE_KEY = 'vortex.scores.v1';

const emptySnap = (w: number, h: number): GameSnapshot => ({
  phase: 'menu',
  playerAngle: -Math.PI / 2,
  playerDirection: 1,
  orbitRadius: 108,
  rings: [],
  particles: [],
  trail: [],
  score: 0,
  combo: 0,
  bestCombo: 0,
  multiplier: 1,
  timeAlive: 0,
  shake: 0,
  flash: 0,
  lastPerfect: false,
  width: w,
  height: h,
});

export default function App() {
  const { width, height } = useWindowDimensions();
  const engineRef = useRef(new VortexEngine());
  const [snap, setSnap] = useState<GameSnapshot>(() => emptySnap(width, height));
  const [highScore, setHighScore] = useState(0);
  const [gameOverBestCombo, setGameOverBestCombo] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const prevScore = useRef(0);
  const prevCombo = useRef(0);
  const prevPhase = useRef<GameSnapshot['phase']>('menu');
  const highScoreRef = useRef(0);

  useEffect(() => {
    engineRef.current.resize(width, height);
    setSnap(engineRef.current.snapshot());
  }, [width, height]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const data = JSON.parse(raw) as ScoreRecord;
        const hs = data.highScore ?? 0;
        highScoreRef.current = hs;
        setHighScore(hs);
      })
      .catch(() => undefined);
  }, []);

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
        if (next.score > prevScore.current) {
          const perfect = next.lastPerfect && next.combo >= prevCombo.current;
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(
              perfect
                ? Haptics.ImpactFeedbackStyle.Medium
                : Haptics.ImpactFeedbackStyle.Light
            ).catch(() => undefined);
          }
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
        setGameOverBestCombo(next.bestCombo);
        const newBest = next.score > highScoreRef.current;
        setIsNewBest(newBest);
        const nextHigh = Math.max(highScoreRef.current, next.score);
        highScoreRef.current = nextHigh;
        setHighScore(nextHigh);
        AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            highScore: nextHigh,
            bestCombo: Math.max(next.bestCombo, 0),
            gamesPlayed: 1,
          } satisfies ScoreRecord)
        ).catch(() => undefined);
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

  const startGame = useCallback(() => {
    prevScore.current = 0;
    prevCombo.current = 0;
    engineRef.current.resize(width, height);
    engineRef.current.start();
    setSnap(engineRef.current.snapshot());
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(
        () => undefined
      );
    }
  }, [width, height]);

  const goMenu = useCallback(() => {
    engineRef.current.phase = 'menu';
    engineRef.current.rings = [];
    engineRef.current.particles = [];
    setSnap(engineRef.current.snapshot());
  }, []);

  const onTap = useCallback(() => {
    const engine = engineRef.current;
    if (engine.phase === 'playing') {
      engine.reverse();
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync().catch(() => undefined);
      }
    }
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[COLORS.bgTop, COLORS.bgBottom, '#16384A']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <GameCanvas snap={snap} />

      {snap.phase === 'playing' && (
        <Pressable style={StyleSheet.absoluteFill} onPress={onTap} />
      )}

      <HUD snap={snap} />

      {snap.phase === 'menu' && (
        <MenuScreen highScore={highScore} onPlay={startGame} />
      )}

      {snap.phase === 'gameover' && (
        <GameOverScreen
          score={snap.score}
          bestCombo={gameOverBestCombo}
          highScore={highScore}
          isNewBest={isNewBest}
          onRetry={startGame}
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
