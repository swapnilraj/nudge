# GitHub Actions release secrets

For `.github/workflows/android-release.yml` you should add these repository secrets:

## Required (for signed release builds)

- `NUDGE_RELEASE_KEYSTORE_BASE64`: base64-encoded `.jks` file
- `NUDGE_RELEASE_STORE_PASSWORD`
- `NUDGE_RELEASE_KEY_ALIAS`
- `NUDGE_RELEASE_KEY_PASSWORD`

To generate the base64 value:

```bash
base64 -i /path/to/nudge-release.jks | pbcopy
```

Then paste into the GitHub Secret value.


