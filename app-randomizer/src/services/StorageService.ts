import AsyncStorage from '@react-native-async-storage/async-storage';
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
