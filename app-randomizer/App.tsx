import React, { useEffect, useState } from 'react';
import { StyleSheet, View, AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
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
  const [screen, setScreen] = useState<Screen>('welcome');
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [selectedApps, setSelectedApps] = useState<AppInfo[]>([]);
  const [weightedApps, setWeightedApps] = useState<WeightedApp[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  
  const storageService = new StorageService();
  const notificationService = new NotificationService();
  const randomizer = new WeightedRandomizer();
  const appLauncher = new AppLauncher();

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
      const prefs = await storageService.getPreferences();
      const firstLaunch = await storageService.isFirstLaunch();
      
      setIsFirstLaunch(firstLaunch);
      setPreferences(prefs);

      if (prefs && !firstLaunch) {
        setWeightedApps(prefs.selectedApps);
        
        // If app was opened normally (not from notification), launch random app
        if (prefs.selectedApps.length > 0) {
          launchRandomApp(prefs.selectedApps);
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
    // Handle notification taps
    Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.type === 'persistent') {
        // Open settings
        setScreen('settings');
      }
    });
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active' && preferences && !isFirstLaunch) {
      // App came to foreground - if not in settings, launch random app
      if (screen !== 'settings' && preferences.selectedApps.length > 0) {
        launchRandomApp(preferences.selectedApps);
      }
    }
  };

  const launchRandomApp = async (apps: WeightedApp[]) => {
    try {
      const selectedApp = randomizer.selectApp(apps);
      const success = await appLauncher.launchApp(selectedApp.packageName);
      
      if (success) {
        // App launched successfully, minimize Nudge
        // On Android, the launched app will come to foreground automatically
      } else {
        console.error('Failed to launch app:', selectedApp.packageName);
        // Could show error message or try another app
      }
    } catch (error) {
      console.error('Error launching random app:', error);
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
});
