# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This repo has two independent components:

| Component | Path | Tech | Dev command |
|---|---|---|---|
| **Android App** | `android/` | Native Kotlin, Gradle 8.14, JDK 17, compileSdk 34 | `./gradlew :app:assembleDebug` |
| **Marketing Site** | `site/` | Next.js 15, React 19, TypeScript | `npm run dev` (port 3000) |

There is no backend, no database, and no inter-service dependency.

### Android app

- Requires **JDK 17** (not 21). Set `JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64`.
- Requires **Android SDK** at `/opt/android-sdk` with `platforms;android-34` and `build-tools;34.0.0`. Set `ANDROID_HOME=/opt/android-sdk`.
- A `debug.keystore` must exist at `android/app/debug.keystore` for debug builds. If missing, generate with: `keytool -genkeypair -v -keystore android/app/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"` (this file is gitignored).
- Build: `cd android && JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 ANDROID_HOME=/opt/android-sdk ./gradlew :app:assembleDebug`
- APK output: `android/app/build/outputs/apk/debug/app-debug.apk`
- No emulator or device available in Cloud VM, so the app cannot be run or tested at runtime — only compiled.

### Marketing site (`site/`)

- `cd site && npm install && npm run dev` starts the dev server on port 3000.
- `npm run build` performs a production build (includes linting via Next.js).
- Lint standalone: `cd site && npx eslint .` (requires `eslint.config.mjs` and ESLint devDeps to be present).
- `next lint` is deprecated in Next.js 15+ and will prompt interactively; use `npx eslint .` instead.
- When running Next.js for the first time, it auto-modifies `tsconfig.json` (adds `esModuleInterop`, `plugins`, `.next/types` include). These changes are expected.
