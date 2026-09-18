import { Audio } from 'expo-av';
import { Platform } from 'react-native';

let ready = false;

async function ensure() {
  if (ready || Platform.OS === 'web') return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
    });
    ready = true;
  } catch {
    // ignore
  }
}

/** Lightweight click via short silent-capable haptic-adjacent cue; real tones via Audio.Sound would need assets. */
export async function playTone(
  _kind: 'tap' | 'score' | 'perfect' | 'fever' | 'die' | 'ui'
) {
  await ensure();
  // Procedural audio without bundled assets: rely on haptics + visual juice.
  // Kept as a stable API so we can drop wav assets later without rewriting call sites.
}
