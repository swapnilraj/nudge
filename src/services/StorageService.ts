import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, WeightedApp } from '../types';

const PREFERENCES_KEY = '@nudge:preferences';
const DEFAULT_PREFERENCES: UserPreferences = {
  isFirstLaunch: true,
  selectedApps: [],
  lastModified: new Date().toISOString(),
};

export class StorageService {
  async getPreferences(): Promise<UserPreferences> {
    try {
      const data = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Error loading preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  }

  async savePreferences(prefs: UserPreferences): Promise<void> {
    try {
      const updatedPrefs = {
        ...prefs,
        lastModified: new Date().toISOString(),
      };
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(updatedPrefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  }

  async isFirstLaunch(): Promise<boolean> {
    const prefs = await this.getPreferences();
    return prefs.isFirstLaunch;
  }

  async markFirstLaunchComplete(): Promise<void> {
    const prefs = await this.getPreferences();
    prefs.isFirstLaunch = false;
    await this.savePreferences(prefs);
  }
}

export const storageService = new StorageService();
