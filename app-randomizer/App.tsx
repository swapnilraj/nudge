import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, AppStateStatus, NativeModules, Platform, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { AppSelectionScreen } from './src/screens/AppSelectionScreen';
import { WeightConfigScreen } from './src/screens/WeightConfigScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { StorageService } from './src/services/StorageService';
import { AppDiscoveryService } from './src/services/AppDiscoveryService';
import { WeightedRandomizer } from './src/services/WeightedRandomizer';
import { AppLauncher } from './src/services/AppLauncher';
import { NotificationService } from './src/services/NotificationService';
import { UserPreferences, WeightedApp, AppInfo } from './src/types';

type Screen = 'welcome' | 'appSelection' | 'weightConfig' | 'settings' | 'launching';

export default function App() {
  // Start in a neutral state to avoid briefly rendering the wrong UI before we know
  // whether we should show onboarding/settings or immediately launch an app.
  const [screen, setScreen] = useState<Screen>('launching');
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [selectedApps, setSelectedApps] = useState<AppInfo[]>([]);
  const [weightedApps, setWeightedApps] = useState<WeightedApp[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  
  const storageService = new StorageService();
  const notificationService = new NotificationService();
  const randomizer = new WeightedRandomizer();
  const appLauncher = new AppLauncher();
  const isLaunchingRef = useRef(false);
  const screenRef = useRef<Screen>(screen);

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  useEffect(() => {
    initializeApp();
    setupNotificationListener();
  }, []);

  useEffect(() => {
    // Handle app state changes - when app comes to foreground, check if we should launch
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [preferences, isFirstLaunch]);

  const initializeApp = async () => {
    try {
      // If Android started MainActivity with openSettings=true (via persistent notification
      // or via launcher trampoline fallback), go straight to Settings and never auto-launch.
      let shouldOpenSettings = false;
      if (Platform.OS === 'android' && NativeModules.NudgePrefs?.consumeOpenSettingsFlag) {
        shouldOpenSettings = await NativeModules.NudgePrefs.consumeOpenSettingsFlag();
      }

      const prefs = await storageService.getPreferences();
      const firstLaunch = await storageService.isFirstLaunch();
      
      setIsFirstLaunch(firstLaunch);
      setPreferences(prefs);

      if (shouldOpenSettings) {
        setScreen('settings');
      } else if (prefs && !firstLaunch) {
        setWeightedApps(prefs.selectedApps);
        
        // Normal launcher open: launch a random app without flashing Settings.
        if (prefs.selectedApps.length > 0) {
          setScreen('launching');
          await launchRandomApp(prefs.selectedApps);
        } else {
          setScreen('settings');
        }
      } else {
        setScreen('welcome');
      }

      // Create persistent notification
      await notificationService.createPersistentNotification();
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  const setupNotificationListener = () => {
    // No-op: on Android we use a native notification PendingIntent to open Settings.
    // (iOS/web behavior can be implemented here if needed later.)
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active' && preferences && !isFirstLaunch) {
      // App came to foreground - if not actively configuring settings/onboarding, launch.
      const currentScreen = screenRef.current;
      const isConfiguring =
        currentScreen === 'settings' ||
        currentScreen === 'welcome' ||
        currentScreen === 'appSelection' ||
        currentScreen === 'weightConfig';

      if (!isConfiguring && preferences.selectedApps.length > 0) {
        setScreen('launching');
        launchRandomApp(preferences.selectedApps);
      }
    }
  };

  const launchRandomApp = async (apps: WeightedApp[]) => {
    if (isLaunchingRef.current) return;
    isLaunchingRef.current = true;
    try {
      const selectedApp = randomizer.selectApp(apps);
      const success = await appLauncher.launchApp(selectedApp.packageName);
      
      if (success) {
        // App launched successfully, minimize Nudge
        // On Android, the launched app will come to foreground automatically
      } else {
        console.error('Failed to launch app:', selectedApp.packageName);
        // Could show error message or try another app
        setScreen('settings');
      }
    } catch (error) {
      console.error('Error launching random app:', error);
      setScreen('settings');
    } finally {
      isLaunchingRef.current = false;
    }
  };

  const handleWelcomeContinue = () => {
    setScreen('appSelection');
  };

  const handleAppsSelected = (apps: AppInfo[]) => {
    setSelectedApps(apps);
  };

  const handleAppSelectionNext = () => {
    // Initialize weights with default value of 5
    const weighted = selectedApps.map(app => ({ ...app, weight: 5 }));
    setWeightedApps(weighted);
    setScreen('weightConfig');
  };

  const handleWeightsChanged = (apps: WeightedApp[]) => {
    setWeightedApps(apps);
  };

  const handleWeightConfigSave = async () => {
    try {
      const prefs: UserPreferences = {
        isFirstLaunch: false,
        selectedApps: weightedApps,
        lastModified: new Date().toISOString(),
      };
      
      await storageService.savePreferences(prefs);
      setPreferences(prefs);
      setIsFirstLaunch(false);
      
      // Create persistent notification
      await notificationService.createPersistentNotification();
      
      // Launch random app and minimize
      if (weightedApps.length > 0) {
        await launchRandomApp(weightedApps);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Error saving configuration. Please try again.');
    }
  };

  const handleSettingsSave = async (apps: WeightedApp[]) => {
    try {
      const prefs: UserPreferences = {
        isFirstLaunch: false,
        selectedApps: apps,
        lastModified: new Date().toISOString(),
      };
      
      await storageService.savePreferences(prefs);
      setPreferences(prefs);
      setWeightedApps(apps);
      
      // Minimize app after saving
      // On Android, you might want to use BackHandler to go back
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    }
  };

  const renderScreen = () => {
    switch (screen) {
      case 'launching':
        return (
          <View style={styles.launchingContainer}>
            <ActivityIndicator size="large" />
          </View>
        );

      case 'welcome':
        return <WelcomeScreen onContinue={handleWelcomeContinue} />;
      
      case 'appSelection':
        return (
          <AppSelectionScreen
            selectedApps={selectedApps}
            onAppsSelected={handleAppsSelected}
            onNext={handleAppSelectionNext}
          />
        );
      
      case 'weightConfig':
        return (
          <WeightConfigScreen
            apps={weightedApps}
            onWeightsChanged={handleWeightsChanged}
            onSave={handleWeightConfigSave}
          />
        );
      
      case 'settings':
        return (
          <SettingsScreen
            currentApps={preferences?.selectedApps || []}
            onSave={handleSettingsSave}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  launchingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
