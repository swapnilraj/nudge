    # Nudge

Nudge is an Android app that helps you break habitual app usage patterns by **launching a weighted-random app** from your curated list.

## What’s special about this build

- **No-UI launcher**: tapping the Nudge app icon launches a random app immediately (native “trampoline” activity), without showing a loading screen.
- **Settings via persistent notification**: a native ongoing notification opens Settings reliably.
- **Search + sort**: app lists are searchable and sorted alphabetically.
- **Optional pinned shortcuts**: create home-screen shortcuts with a custom name and an icon cloned from another installed app (Android does not allow changing the actual app-drawer icon/name at runtime).

## Requirements

- Node.js + npm
- Android SDK + JDK 17 (for local builds)
- An Android device with USB debugging enabled (or an emulator)

## Install deps

```bash
npm install
```

## Run (development)

This project includes native modules, so **Expo Go is not supported**.

```bash
npm run android
```

## Build a release APK (local)

```bash
cd android
./gradlew :app:assembleRelease
```

APK output:

- `android/app/build/outputs/apk/release/app-release.apk`

Install to a connected device:

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

## Publishing (high level)

1. Create a **release keystore** (do not ship debug signing).
2. Update `android/app/build.gradle` to use the release keystore for `release` builds.
3. Bump `versionCode`/`versionName` each release.
4. Build an AAB for Play Store:

```bash
cd android
./gradlew :app:bundleRelease
```

Signing/versioning details: see `android/RELEASE_SIGNING.md`.

## Website (gentlenudge.dev)

There’s a simple Vercel-ready website in `site/` with:

- `/` landing page
- `/privacy` privacy policy (renders from `PRIVACY_POLICY.md`)

See `site/README.md` for deployment steps.

## Repo layout

- `App.tsx`: RN entry point (Settings/onboarding UI)
- `src/`: RN screens + services
- `android/`: native Android project (launcher trampoline, persistent notification, pinned shortcut module)
- `assets/`: app icons/images


