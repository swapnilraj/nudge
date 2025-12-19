# Play rollout steps (manual in Play Console)

These steps happen in the Google Play Console UI.

## 1) Create the app

- Package name must be: `com.nudge.app`
- Set default language

## 2) Upload to Internal testing (recommended first)

1. Build a signed AAB:

```bash
cd android
./gradlew :app:bundleRelease
```

2. Upload `android/app/build/outputs/bundle/release/app-release.aab` to **Internal testing**.\n\n3. Add testers and install from Play.\n\n## 3) Complete required forms\n\n- Content rating\n- Data safety (reference `PRIVACY_POLICY.md`)\n- Permissions declaration\n- Store listing (use `fastlane/metadata/android/en-US/*` as a starting point)\n\n## 4) Promote\n\n- Internal → Closed → Production\n+\n*** End Patch"} }AIza to=functions.apply_patch={}

