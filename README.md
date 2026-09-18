# VORTEX

Native iOS Arcade-Skill-Game. Kein Expo Go — echte App-Binary / **unsigned IPA** via GitHub Actions.

Du orbitierst um den Kern. **Tippen** kehrt die Richtung um. Schlüpfe durch Lücken. Perfects stacken Combos, 5 Perfects → **FEVER**. Shards freischalten Skins & Modi.

## Modi

| Modus | Was |
|-------|-----|
| **CLASSIC** | Endlos, reine Präzision |
| **HYPER** | Schneller, enger, 2× Score |
| **MIRROR** | Zwei Orbs, beide müssen klar kommen |
| **GAUNTLET** | 20 Wellen inkl. Boss-Ringe |

Extra: Dual-/Spinner-/Pulse-/Boss-Ringe, Near-Misses, Shard-Pickups, Hangar-Skins, Achievements, Ranks.

## Unsigned IPA (GitHub Actions)

Workflow: `.github/workflows/build-unsigned-ipa.yml`

1. Push auf `main` / `dskja-vortex-game-e9ea` **oder** Actions → **Build Unsigned IPA** → Run workflow
2. Job läuft auf `macos-26` + **Xcode 26.4.1** (Expo SDK 57 / ExpoModulesJSI): `expo prebuild` → CocoaPods → `xcodebuild build` **ohne Signing** → zippt `VORTEX-unsigned.ipa`
3. Artifact **VORTEX-unsigned-ipa** herunterladen

Die IPA ist **unsigned**. Signieren/Installieren z. B. mit Sideloadly, AltStore, TrollStore (je nach Gerät/iOS).

## Lokal (Mac, native)

```bash
npm ci
npx expo prebuild --platform ios
npx expo run:ios
```

Oder Xcode: `ios/*.xcworkspace` öffnen.

## Stack

Expo bare prebuild · React Native · TypeScript · Sprite-ähnlicher SVG-Renderer · AsyncStorage Meta-Progression · Haptics
