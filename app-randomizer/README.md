# Nudge - App Randomizer

A mobile application designed to help users break habitual app usage patterns by introducing weighted randomness into their app launching behavior.

## Overview

Nudge helps you break out of mindless app scrolling by randomly launching apps from your curated list based on configurable weights. When you want to open a frequently-used app, Nudge can instead launch a random app from your list, encouraging exploration.

## Features

- Select apps from your installed applications
- Assign weights (1-10) to each app for weighted random selection
- Persistent notification for quick access to settings
- Automatic app launching when you open Nudge
- Fully offline and privacy-first (all data stored locally)

## Setup

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Android Studio (for Android development)
- Android device or emulator (API 29+, Android 10+)
- Expo CLI

### Installation

1. Navigate to the project directory:
```bash
cd app-randomizer
```

2. Install dependencies (already done):
```bash
npm install
```

3. Generate native code:
```bash
npm run prebuild
```

4. Run on Android device/emulator:
```bash
npm run run:android
```

Or use Expo Go for development:
```bash
npm start
# Then press 'a' for Android
```

## Project Structure

```
app-randomizer/
├── src/
│   ├── types/           # TypeScript type definitions
│   ├── services/        # Core business logic services
│   │   ├── StorageService.ts
│   │   ├── AppDiscoveryService.ts
│   │   ├── WeightedRandomizer.ts
│   │   ├── AppLauncher.ts
│   │   └── NotificationService.ts
│   ├── screens/         # React Native screens
│   │   ├── WelcomeScreen.tsx
│   │   ├── AppSelectionScreen.tsx
│   │   ├── WeightConfigScreen.tsx
│   │   └── SettingsScreen.tsx
│   └── components/      # Reusable UI components
├── assets/              # Images and icons
├── App.tsx              # Main app component
└── app.json             # Expo configuration
```

## Development

### Running the App

- **Development mode**: `npm start` then press 'a' for Android
- **Native build**: `npm run run:android` (requires prebuild)

### Building for Production

```bash
eas build --platform android
```

## Permissions

The app requires the following Android permissions:
- `QUERY_ALL_PACKAGES` - To list installed apps (Android 11+)
- `POST_NOTIFICATIONS` - For persistent notification (Android 13+)

## Configuration

App configuration is stored in `app.json`. Key settings:
- Package name: `com.nudge.app`
- App name: `Nudge`
- Target Android API: 29+ (Android 10+)

## Notes

- The app uses `react-native-installed-apps` which requires custom native code
- After making changes to native dependencies, run `npm run prebuild` again
- The persistent notification provides quick access to settings

## Troubleshooting

1. **Apps not showing**: Ensure `QUERY_ALL_PACKAGES` permission is granted
2. **Notification not appearing**: Check notification permissions in Android settings
3. **App won't launch**: Verify the target app is installed and launchable
4. **Build errors**: Run `npm run prebuild` to regenerate native code

## License

Private project
