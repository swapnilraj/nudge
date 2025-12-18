import React, { useEffect, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { storageService } from './src/services/StorageService';
import { notificationService } from './src/services/NotificationService';
import { appLauncher } from './src/services/AppLauncher';
import { weightedRandomizer } from './src/services/WeightedRandomizer';
import { UserPreferences, WeightedApp } from './src/types';
import WelcomeScreen from './src/screens/WelcomeScreen';
import AppSelectionScreen from './src/screens/AppSelectionScreen';
import WeightConfigScreen from './src/screens/WeightConfigScreen';
import SettingsScreen from './src/screens/SettingsScreen';

export default function App() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'loading' | 'welcome' | 'app-selection' | 'weight-config' | 'settings' | 'launch'>('loading');
  const [selectedAppsForConfig, setSelectedAppsForConfig] = useState<WeightedApp[]>([]);

  const handleLaunchRandomApp = useCallback(async () => {
    if (!preferences || preferences.selectedApps.length === 0) {
      setCurrentScreen('settings');
      return;
    }

    try {
      const selectedApp = weightedRandomizer.selectApp(preferences.selectedApps);
      const success = await appLauncher.launchApp(selectedApp.packageName);
      
      if (success) {
        // Close Nudge by going to background
        // The notification will remain visible
        await notificationService.createPersistentNotification();
      } else {
        // If launch failed, show settings
        setCurrentScreen('settings');
      }
    } catch (error) {
      console.error('Error launching app:', error);
      setCurrentScreen('settings');
    }
  }, [preferences]);

  const loadPreferences = useCallback(async () => {
    const prefs = await storageService.getPreferences();
    setPreferences(prefs);
    
    if (prefs.isFirstLaunch) {
      setCurrentScreen('welcome');
    } else {
      setCurrentScreen('launch');
    }
  }, []);

  const setupNotificationHandlers = useCallback(() => {
    notificationService.setupNotificationHandlers(
      () => {
        // Settings button pressed
        setCurrentScreen('settings');
      },
      () => {
        // Launch button pressed
        handleLaunchRandomApp();
      }
    );
  }, [handleLaunchRandomApp]);

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (nextAppState === 'active' && preferences && !preferences.isFirstLaunch) {
      // App came to foreground - launch random app
      handleLaunchRandomApp();
    }
  }, [preferences, handleLaunchRandomApp]);

  useEffect(() => {
    loadPreferences();
    setupNotificationHandlers();
    
    // Listen for app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
      notificationService.cleanup();
    };
  }, [loadPreferences, setupNotificationHandlers, handleAppStateChange]);

  useEffect(() => {
    if (preferences && !preferences.isFirstLaunch && currentScreen === 'launch') {
      // If app is opened and not first launch, immediately launch a random app
      handleLaunchRandomApp();
    }
  }, [preferences, currentScreen, handleLaunchRandomApp]);

  const handleWelcomeComplete = () => {
    setCurrentScreen('app-selection');
  };

  const handleAppSelectionComplete = (apps: WeightedApp[]) => {
    setSelectedAppsForConfig(apps);
    setCurrentScreen('weight-config');
  };

  const handleWeightConfigComplete = async (apps: WeightedApp[]) => {
    const updatedPrefs: UserPreferences = {
      ...preferences!,
      selectedApps: apps,
      isFirstLaunch: false,
    };
    
    await storageService.savePreferences(updatedPrefs);
    await storageService.markFirstLaunchComplete();
    setPreferences(updatedPrefs);
    
    // Create persistent notification
    await notificationService.createPersistentNotification();
    
    // Launch a random app
    handleLaunchRandomApp();
  };

  const handleSettingsSave = async (apps: WeightedApp[]) => {
    const updatedPrefs: UserPreferences = {
      ...preferences!,
      selectedApps: apps,
    };
    
    await storageService.savePreferences(updatedPrefs);
    setPreferences(updatedPrefs);
    
    // Update notification
    await notificationService.createPersistentNotification();
    
    // Go back to launch mode
    setCurrentScreen('launch');
  };

  if (currentScreen === 'loading' || !preferences) {
    return null; // Or a loading screen
  }

  return (
    <PaperProvider>
      {currentScreen === 'welcome' && (
        <WelcomeScreen onComplete={handleWelcomeComplete} />
      )}
      {currentScreen === 'app-selection' && (
        <AppSelectionScreen
          onComplete={handleAppSelectionComplete}
          initialSelectedApps={preferences.selectedApps}
        />
      )}
      {currentScreen === 'weight-config' && (
        <WeightConfigScreen
          apps={selectedAppsForConfig}
          onComplete={handleWeightConfigComplete}
        />
      )}
      {currentScreen === 'settings' && (
        <SettingsScreen
          preferences={preferences}
          onSave={handleSettingsSave}
        />
      )}
    </PaperProvider>
  );
}
