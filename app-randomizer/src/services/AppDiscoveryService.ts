import { AppInfo } from '../types';

// Dynamic import to handle cases where native module isn't available (e.g., Expo Go)
let InstalledApps: any = null;
try {
  InstalledApps = require('react-native-installed-apps');
} catch (error) {
  console.warn('react-native-installed-apps not available. This requires a development build.');
}

export class AppDiscoveryService {
  async getInstalledApps(): Promise<AppInfo[]> {
    try {
      if (!InstalledApps) {
        console.warn('InstalledApps module not available. This app requires a development build, not Expo Go.');
        // Return mock data for development/testing
        return [
          { packageName: 'com.example.app1', label: 'Example App 1' },
          { packageName: 'com.example.app2', label: 'Example App 2' },
        ];
      }
      
      const apps = await InstalledApps.getApps();
      return apps.map((app: any) => ({
        packageName: app.packageName,
        label: app.label || app.packageName,
        icon: app.icon,
      }));
    } catch (error) {
      console.error('Error getting installed apps:', error);
      return [];
    }
  }

  filterLaunchableApps(apps: AppInfo[]): AppInfo[] {
    // Filter out system apps and the Nudge app itself
    return apps.filter(app => {
      const packageName = app.packageName.toLowerCase();
      return (
        !packageName.startsWith('com.android') &&
        !packageName.startsWith('com.google.android') &&
        !packageName.startsWith('com.nudge.app') &&
        !packageName.includes('launcher') &&
        !packageName.includes('settings')
      );
    });
  }
}
