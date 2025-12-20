# Setup Instructions for Nudge App

## Important: Development Build Required

This app uses custom native modules, which means you **CANNOT use Expo Go**. Use native builds (Android Studio/Gradle or `expo run:android`).

## Option 1: Run on Android Device/Emulator (Recommended)

### Prerequisites
- Android Studio installed
- Android device connected via USB (with USB debugging enabled) OR Android emulator running
- Node.js and npm installed

### Steps

1. **Ensure native code is built:**
   ```bash
   npm install
   npm run prebuild
   ```

2. **Run on Android:**
   ```bash
   npm run android
   ```
   
   This will:
   - Build the development client
   - Install it on your device/emulator
   - Start the Metro bundler
   - Launch the app

3. **If you get permission errors**, make sure:
   - USB debugging is enabled on your device
   - Device is authorized (check `adb devices`)
   - Android emulator is running (if using emulator)

## Option 2: Build Development Client Manually

If the above doesn't work, you can build the development client manually:

1. **Generate native code:**
   ```bash
   npm run prebuild
   ```

2. **Open Android Studio:**
   ```bash
   # Open the android folder in Android Studio
   cd android
   # Then open Android Studio and open the 'android' folder
   ```

3. **Build and run from Android Studio:**
   - Wait for Gradle sync to complete
   - Click the "Run" button or press Shift+F10
   - Select your device/emulator

4. **Start Metro bundler separately:**
   ```bash
   npm start
   ```

## Troubleshooting

### Error: "Something went wrong" in Expo Go
- **Solution**: You cannot use Expo Go. Use a development build instead (see Option 1 or 2 above).

### Error: "Module not found" or "Native module not found"
- **Solution**: Run `npm run prebuild` to regenerate native code, then rebuild the app.

### Error: Permission denied for QUERY_ALL_PACKAGES
- **Solution**: 
  1. Go to Android Settings > Apps > Nudge > Permissions
  2. Enable "Display over other apps" or "Query all packages" permission
  3. Restart the app

### Error: Cannot find installed apps
- **Solution**: 
  1. Ensure `QUERY_ALL_PACKAGES` permission is granted
  2. On Android 11+, this permission might need to be granted manually in settings
  3. Some devices may require additional permissions

### App crashes on launch
- Check Metro bundler logs for errors
- Check Android logcat: `adb logcat | grep -i nudge`
- Ensure all dependencies are installed: `npm install`

## Development Workflow

1. **Make code changes** in `src/` directory
2. **Reload the app** (shake device and press "Reload" or press `r` in Metro bundler terminal)
3. **For native code changes**, rebuild: `npm run prebuild && npm run android`

## Building for Production

```bash
eas build --platform android
```

Note: You'll need to set up EAS (Expo Application Services) first.
