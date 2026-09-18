/** Stable SFX API — haptics + visual juice carry feedback; no native audio deps. */
export async function playTone(
  _kind: 'tap' | 'score' | 'perfect' | 'fever' | 'die' | 'ui'
) {
  // Intentionally empty: expo-av is broken on SDK 57 (legacy EXEventEmitter).
  // Call sites stay stable if we add expo-audio later.
}
