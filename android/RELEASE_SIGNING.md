# Release signing (Android)

This repo is configured to build **debug** releases by default (for local testing). For publishing, you must sign with a **real release keystore**.

## 1) Create a keystore

```bash
keytool -genkeypair -v \
  -keystore nudge-release.jks \
  -storetype JKS \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias nudge
```

Keep `nudge-release.jks` somewhere safe (do not commit it).

## 2) Provide credentials (pick one)

### Option A: environment variables (recommended for CI)

- `NUDGE_RELEASE_STORE_FILE` (path to `.jks`)
- `NUDGE_RELEASE_STORE_PASSWORD`
- `NUDGE_RELEASE_KEY_ALIAS`
- `NUDGE_RELEASE_KEY_PASSWORD`

### Option B: local `~/.gradle/gradle.properties` (recommended for local dev)

Add:

```properties
NUDGE_RELEASE_STORE_FILE=/absolute/path/to/nudge-release.jks
NUDGE_RELEASE_STORE_PASSWORD=...
NUDGE_RELEASE_KEY_ALIAS=nudge
NUDGE_RELEASE_KEY_PASSWORD=...
```

## 3) Build signed outputs

```bash
cd android
./gradlew :app:assembleRelease
./gradlew :app:bundleRelease
```

## 4) Google Play App Signing

In Play Console, enable **Play App Signing** and use your release key as the **upload key**.


