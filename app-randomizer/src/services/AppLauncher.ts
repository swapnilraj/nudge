import * as IntentLauncher from 'expo-intent-launcher';
import { Platform, Linking } from 'react-native';

export class AppLauncher {
  async launchApp(packageName: string): Promise<boolean> {
    try {
      if (Platform.OS !== 'android') {
        console.warn('App launching is only supported on Android');
        return false;
      }

      // Launch app by package name (Android only)
      IntentLauncher.openApplication(packageName);
      return true;
    } catch (error) {
      console.error(`Error launching app ${packageName}:`, error);
      return false;
    }
  }

  async canLaunchApp(packageName: string): Promise<boolean> {
    try {
      if (Platform.OS !== 'android') {
        return false;
      }

      // Try to resolve the intent to check if app exists
      // This is a simple check - in production you might want a more robust solution
      return true; // Assume true for now, actual check would require querying package manager
    } catch (error) {
      return false;
    }
  }
}
