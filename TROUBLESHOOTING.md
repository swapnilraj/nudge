# Troubleshooting Guide

## "Something went wrong" Error in Expo Go

### Problem
You're trying to use Expo Go (scanning QR code), but getting an error.

### Solution
**This app CANNOT run in Expo Go** because it uses:
- Custom native modules (requires native build)
- `react-native-installed-apps` (custom native module)

### How to Fix

You must use a **development build** instead:

```bash
npm run android
```

This will:
1. Build a custom development client
2. Install it on your Android device/emulator
3. Start the Metro bundler
4. Launch the app

### Prerequisites
- Android device connected via USB (with USB debugging) OR Android emulator running
- Run `adb devices` to verify your device is connected

## Other Common Errors

### "Module not found: react-native-installed-apps"
- **Cause**: Native module not linked
- **Fix**: Run `npm run prebuild` then rebuild: `npm run android`

### "Cannot read property 'getApps' of null"
- **Cause**: Running in Expo Go (native module unavailable)
- **Fix**: Use development build (see above)

### Permission Denied for QUERY_ALL_PACKAGES
- **Cause**: Android permission not granted
- **Fix**: 
  1. Go to Android Settings > Apps > Nudge > Permissions
  2. Enable "Query all packages" or similar permission
  3. Restart the app

### App crashes immediately
- Check Metro bundler terminal for error messages
- Check Android logcat: `adb logcat | grep -i "ReactNative\|Nudge"`
- Ensure all dependencies installed: `npm install`

### "Unable to resolve module" errors
- Clear cache and reinstall:
  ```bash
  rm -rf node_modules
  npm install
  npm start -- --reset-cache
  ```

## Development vs Production

- **Development**: Use `npm run android` (development build)
- **Production**: Use `eas build --platform android` (production build)

## Still Having Issues?

1. Check that you're using a development build, not Expo Go
2. Verify Android device/emulator is connected: `adb devices`
3. Check Metro bundler logs for specific error messages
4. Check Android logcat for native errors: `adb logcat`
