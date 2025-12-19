# Releasing Nudge

## 1) Set up signing

See `android/RELEASE_SIGNING.md`.

## 2) Tag a release

Example:

```bash
git tag v1.0.0
git push origin v1.0.0
```

This triggers GitHub Actions to build:

- `app-release.apk`
- `app-release.aab`

and attach them to a GitHub Release for that tag.

## 3) Upload to Google Play

Upload the `.aab` from the GitHub Release (or from your local build) to Play Console.


