import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';
import { UserPreferences } from '../types';

const STORAGE_KEY = '@nudge:preferences';

export class StorageService {
  async getPreferences(): Promise<UserPreferences | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting preferences:', error);
      return null;
    }
  }

  async savePreferences(prefs: UserPreferences): Promise<void> {
    try {
      prefs.lastModified = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));

      // Also persist the selected/weighted apps into native storage so the Android
      // launcher trampoline can read it without starting React Native.
      if (Platform.OS === 'android' && NativeModules.NudgePrefs?.setWeightedAppsJson) {
        await NativeModules.NudgePrefs.setWeightedAppsJson(JSON.stringify(prefs.selectedApps));
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  }

  async isFirstLaunch(): Promise<boolean> {
    const prefs = await this.getPreferences();
    return prefs === null || prefs.isFirstLaunch;
  }
}
