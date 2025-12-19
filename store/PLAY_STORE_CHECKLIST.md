# Play Store checklist (Nudge)

## Assets you need

- App name + short description + full description
- App icon (512×512)
- Feature graphic (1024×500)
- Phone screenshots (at least 2)

## Console forms

- App access (if any credentials needed; typically “all functionality available without special access”)
- Content rating questionnaire
- Target audience / ads declaration
- Data safety form (reference `PRIVACY_POLICY.md`)
- Permissions declaration (explain why you need each permission)

## Recommended rollout

1. Internal testing (your own devices) with the production-signed AAB
2. Closed testing (a few testers)
3. Production

## Build commands

```bash
cd android
./gradlew :app:bundleRelease
```

Upload the resulting `.aab` from:

- `android/app/build/outputs/bundle/release/app-release.aab`


