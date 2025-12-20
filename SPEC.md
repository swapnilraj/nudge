# Nudge - App Specification

## Overview

**Nudge** is a mobile application designed to help users break habitual app usage patterns by introducing weighted randomness into their app launching behavior. When users want to open frequently-used apps, Nudge can instead launch a random app from their curated list based on configurable weights, encouraging exploration and reducing mindless scrolling.

## Core Concept

Instead of mindlessly opening the same apps (social media, etc.), users configure Nudge with a list of apps they want to be "nudged" towards, assign weights to each app, and use Nudge's launcher to open a randomly selected app based on those weights.

---

## Functionality

### 1. First-Time Setup
When users first open Nudge:
- Present a screen to select apps from their installed applications
- Allow users to assign weights (1-10) to each selected app
- Higher weights = higher probability of being selected
- Save preferences locally

### 2. Normal Usage Flow
After initial setup:
- User opens Nudge from their app drawer/home screen (like any other app)
- Nudge **immediately** and **automatically** launches a weighted-random app from the user's configured list
- Nudge then closes itself, leaving the randomly selected app in the foreground
- A **persistent notification** remains visible with a **"Settings"** button to modify preferences

### 3. Settings/Configuration
Users can modify their preferences anytime:
- Add or remove apps from the list
- Adjust weights for each app
- View current configuration
- Reset to defaults

### 4. App Launching
When user opens Nudge from their app drawer:
- Immediately select an app using weighted random selection algorithm
- Launch the selected app using Android intents
- Close Nudge (bring selected app to foreground)
- Optional: Show a brief toast/notification of which app was selected
- Persistent notification remains for easy settings access

---

## User Flows

### First Launch Flow
```
User opens Nudge
    ↓
Welcome screen (brief explanation)
    ↓
App selection screen (list of installed apps with checkboxes)
    ↓
Weight configuration screen (sliders/inputs for each selected app)
    ↓
Save configuration
    ↓
Show persistent notification
    ↓
App minimizes to background
```

### Normal Usage Flow
```
User opens Nudge from app drawer
    ↓
Nudge automatically selects weighted-random app
    ↓
Selected app launches immediately
    ↓
Nudge closes itself
    ↓
(Notification persists in background for settings access)
```

### Settings Edit Flow
```
User taps "Settings" in notification
    ↓
Nudge opens to settings screen
    ↓
User modifies app list/weights
    ↓
Save changes
    ↓
App minimizes, notification persists
```

---

## Technical Stack

### Platform
- **Framework**: React Native
- **Build Tool**: Expo (SDK 54+)
- **Language**: JavaScript/TypeScript (TypeScript recommended)
- **Target Platform**: Android (API 29+, Android 10+)

### Key Dependencies

#### Core Expo Packages
- **expo** - Expo SDK
- **Native build** - Required for custom native modules
- **react-native** - React Native core

#### Storage
- **@react-native-async-storage/async-storage** - Local persistent storage for user preferences

#### Notifications
- **Native notifications** - Persistent notification is implemented via native Android (`NudgeNotificationHelper`)

#### App Interaction
- **expo-intent-launcher** - Launch other apps using Android intents
- **react-native-installed-apps** - Fetch list of installed applications (requires custom native module)

#### UI Components
- **react-native-paper** or **@react-native-community/slider** - UI components for settings

---

## Architecture

### Component Structure

```
App (Root)
├── WelcomeScreen (First launch only)
├── AppSelectionScreen
│   └── InstalledAppList
│       └── AppListItem (checkbox, app icon, app name)
├── WeightConfigScreen
│   └── WeightedAppList
│       └── WeightedAppItem (app name, weight slider)
├── SettingsScreen
│   └── Same as AppSelection + WeightConfig combined
└── NotificationManager (handles persistent notification)
```

### Data Models

```typescript
interface AppInfo {
  packageName: string;      // e.g., "com.spotify.music"
  label: string;            // e.g., "Spotify"
  icon?: string;            // Base64 or URI
}

interface WeightedApp extends AppInfo {
  weight: number;           // 1-10
}

interface UserPreferences {
  isFirstLaunch: boolean;
  selectedApps: WeightedApp[];
  lastModified: string;     // ISO timestamp
}
```

### Core Services

#### 1. StorageService
```typescript
class StorageService {
  async getPreferences(): Promise<UserPreferences>
  async savePreferences(prefs: UserPreferences): Promise<void>
  async isFirstLaunch(): Promise<boolean>
}
```

#### 2. AppDiscoveryService
```typescript
class AppDiscoveryService {
  async getInstalledApps(): Promise<AppInfo[]>
  async filterLaunchableApps(apps: AppInfo[]): AppInfo[]
}
```

#### 3. WeightedRandomizer
```typescript
class WeightedRandomizer {
  selectApp(apps: WeightedApp[]): WeightedApp
  // Uses weighted random selection algorithm
}
```

#### 4. AppLauncher
```typescript
class AppLauncher {
  async launchApp(packageName: string): Promise<boolean>
  async canLaunchApp(packageName: string): Promise<boolean>
}
```

#### 5. NotificationService
```typescript
class NotificationService {
  async createPersistentNotification(): Promise<void>
  async removePersistentNotification(): Promise<void>
  handleNotificationAction(action: 'settings'): void
}
```

---

## Algorithms

### Weighted Random Selection

Given a list of apps with weights:
```typescript
function selectWeightedRandom(apps: WeightedApp[]): WeightedApp {
  const totalWeight = apps.reduce((sum, app) => sum + app.weight, 0);
  let random = Math.random() * totalWeight;

  for (const app of apps) {
    random -= app.weight;
    if (random <= 0) {
      return app;
    }
  }

  return apps[apps.length - 1]; // Fallback
}
```

**Example:**
- App A: weight 5 (50% chance)
- App B: weight 3 (30% chance)
- App C: weight 2 (20% chance)
- Total weight: 10

---

## Permissions & Configuration

### Android Permissions Required
- `android.permission.QUERY_ALL_PACKAGES` - To list installed apps (Android 11+)
- `android.permission.POST_NOTIFICATIONS` - For persistent notification (Android 13+)

### app.json Configuration
```json
{
  "expo": {
    "name": "Nudge",
    "slug": "nudge",
    "version": "1.0.0",
    "android": {
      "package": "com.nudge.app",
      "permissions": [
        "android.permission.POST_NOTIFICATIONS"
      ],
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#00000000"
      }
    },
    "plugins": []
  }
}
```

### AndroidManifest.xml Additions
```xml
<manifest>
  <queries>
    <intent>
      <action android:name="android.intent.action.MAIN" />
    </intent>
  </queries>
</manifest>
```

---

## Features Breakdown

### MVP (Minimum Viable Product)
- ✅ Select apps from installed apps list
- ✅ Assign weights (1-10) to each app
- ✅ Persistent notification with "Launch" and "Settings" buttons
- ✅ Weighted random app selection
- ✅ Launch selected app
- ✅ Save/load preferences locally

### Future Enhancements (v2.0+)
- 📊 Usage statistics (how often each app is launched)
- 📅 Time-based weights (different weights for different times of day)
- 🎯 Goals and streaks (encourage using certain apps)
- 🔔 Configurable notification appearance
- 📱 Widget support for quick launch
- 🌙 Dark mode
- ☁️ Cloud sync of preferences
- 📈 Analytics dashboard

---

## Development Workflow

### Setup
```bash
cd app-randomizer
npx expo install @react-native-async-storage/async-storage expo-intent-launcher
npm install react-native-installed-apps
npx expo prebuild  # Generate native code
```

### Development
```bash
npx expo run:android  # Run on Android device/emulator with dev client
```

### Testing
- Test on physical Android device (API 29+)
- Test notification actions
- Test app launching with various apps
- Test weight distribution over multiple launches

### Build
```bash
eas build --platform android  # Using Expo Application Services
```

---

## Security & Privacy

- **All data stored locally** - No data leaves the device
- **No analytics or tracking** - Complete privacy
- **No internet permission required** - Fully offline app
- **Minimal permissions** - Only queries installed apps and shows notifications

---

## Edge Cases & Error Handling

1. **No apps selected**: Show error message, require at least 1 app
2. **App no longer installed**: Remove from list, show notification
3. **App can't be launched**: Try next random selection, log error
4. **All weights are 0**: Show error, require at least one weight > 0
5. **Notification permissions denied**: Show explanation screen
6. **Storage error**: Show error, offer retry

---

## Testing Strategy

### Unit Tests
- Weighted random selection algorithm
- Storage service read/write
- App filtering logic

### Integration Tests
- Full user flow from setup to launch
- Notification action handling
- Settings persistence

### Manual Testing Checklist
- [ ] First launch experience
- [ ] App selection UI
- [ ] Weight configuration
- [ ] Notification appears and persists
- [ ] "Launch Random App" button works
- [ ] "Settings" button opens app
- [ ] App launching works for all selected apps
- [ ] Settings changes persist
- [ ] App survives force-stop
- [ ] Notification survives device reboot

---

## Success Metrics

- App successfully launches on Android 10+ devices
- Weighted randomness produces expected distribution
- Notification persists correctly
- User can modify settings without issues
- No crashes during normal usage

---

## Timeline Estimate

- **Setup & Dependencies**: 1 hour
- **Core Services Implementation**: 3-4 hours
- **UI Screens**: 4-5 hours
- **Notification Integration**: 2-3 hours
- **Testing & Debugging**: 3-4 hours
- **Polish & Edge Cases**: 2-3 hours

**Total**: ~15-20 hours for MVP

---

## Conclusion

Nudge is a focused, privacy-first mobile app that helps users break out of habitual app usage patterns through weighted randomness. Built with modern React Native and Expo tools, it provides a simple yet powerful way to encourage mindful app usage and exploration.
