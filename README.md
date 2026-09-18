# VORTEX

Ein iOS Arcade-Skill-Game: Du orbitierst um den Kern. **Tippe**, um die Richtung umzukehren. Schlüpfe durch die Lücken der eingehenden Ringe. Perfekte Treffer bauen Combos auf.

## Warum es süchtig macht

- Ein-Finger-Steuerung, Runs in 30–90 Sekunden
- Skill-Ceiling: Timing + Antizipation, nicht Glück
- Combo-Multiplier und „noch einmal“-Game-Over-Momente
- Haptik auf dem iPhone, Highscore lokal gespeichert

## Spielen

```bash
npm install
npx expo start
```

- iPhone: [Expo Go](https://expo.dev/go) öffnen und QR-Code scannen
- Web-Preview: `npx expo start --web`
- Native iOS-Build (Mac): `npx expo prebuild` dann in Xcode öffnen / EAS Build

## Stack

Expo (React Native) · TypeScript · SVG-Renderer · AsyncStorage · Haptics

## Steuerung

| Aktion | Effekt |
|--------|--------|
| Tippen während des Spiels | Orbit-Richtung umkehren |
| Lücke treffen | +1 Punkt |
| Lücken-Mitte (Perfect) | Combo + Multiplier |
| Ring ohne Lücke | Game Over |
