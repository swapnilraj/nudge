# F-Droid notes

F-Droid builds apps from source. To publish Nudge on F-Droid you typically:

1. Create a tagged release (e.g. `v1.0.0`).
2. Ensure the build is reproducible and does not depend on proprietary services.
3. Submit metadata + build recipe to the F-Droid data repo (or run your own repo).

## Build command (expected by F-Droid)

F-Droid will run a Gradle task in `android/`:

```bash
cd android
./gradlew :app:assembleRelease
```

## Caveats

- Some Expo/React Native modules may pull optional Google/Firebase components.\n- If F-Droid rejects the build for non-free dependencies, you may need a “fdroid” flavor that excludes them.\n\n*** End Patch"} }? to=functions.apply_patch (commentary) on-invalid-json="false"} }config={"code":null}...} }

