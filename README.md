# Nudge - Android App

A mobile application designed to help users break habitual app usage patterns by introducing weighted randomness into their app launching behavior.

## Overview

Instead of mindlessly opening the same apps (social media, etc.), users configure Nudge with a list of apps they want to be "nudged" towards, assign weights to each app, and use Nudge's launcher to open a randomly selected app based on those weights.

## Features

- ✅ Select apps from installed apps list
- ✅ Assign weights (1-10) to each app
- ✅ Persistent notification with "Settings" button
- ✅ Weighted random app selection
- ✅ Launch selected app automatically
- ✅ Save/load preferences locally

## Tech Stack

- **Framework**: React Native with Expo (SDK 54+)
- **Language**: TypeScript
- **Target Platform**: Android (API 29+, Android 10+)

## Setup

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Android Studio (for Android development)
- Android device or emulator (API 29+)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Generate native code:
```bash
npx expo prebuild
```

3. Run on Android:
```bash
npx expo run:android
```

Or use Expo Go for development:
```bash
npx expo start
```

## Project Structure

```
/workspace
├── App.tsx                 # Main app entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
├── src/
│   ├── types/            # TypeScript type definitions
│   ├── services/         # Core services
│   │   ├── StorageService.ts
│   │   ├── AppDiscoveryService.ts
│   │   ├── WeightedRandomizer.ts
│   │   ├── AppLauncher.ts
│   │   └── NotificationService.ts
│   ├── screens/          # App screens
│   │   ├── WelcomeScreen.tsx
│   │   ├── AppSelectionScreen.tsx
│   │   ├── WeightConfigScreen.tsx
│   │   └── SettingsScreen.tsx
│   └── components/       # Reusable components
└── assets/               # App assets (icons, images)
```

## Development

### Running the App

```bash
# Start Expo development server
npx expo start

# Run on Android device/emulator
npx expo run:android
```

### Building for Production

```bash
# Using Expo Application Services (EAS)
eas build --platform android
```

## Permissions

The app requires the following Android permissions:
- `QUERY_ALL_PACKAGES` - To list installed apps (Android 11+)
- `POST_NOTIFICATIONS` - For persistent notification (Android 13+)

## How It Works

1. **First Launch**: User selects apps and assigns weights
2. **Normal Usage**: Opening Nudge automatically launches a weighted-random app
3. **Settings**: Access via persistent notification to modify preferences

## License

ISC
