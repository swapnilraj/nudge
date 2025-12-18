import InstalledApps from 'react-native-installed-apps';
import { AppInfo } from '../types';

export class AppDiscoveryService {
  async getInstalledApps(): Promise<AppInfo[]> {
    try {
      const apps = await InstalledApps.getApps();
      return apps.map((app: any) => ({
        packageName: app.packageName || app.package,
        label: app.appName || app.label || app.packageName,
        icon: app.icon || undefined,
      }));
    } catch (error) {
      console.error('Error fetching installed apps:', error);
      // Return empty array on error
      return [];
    }
  }

  filterLaunchableApps(apps: AppInfo[]): AppInfo[] {
    // Filter out system apps and the Nudge app itself
    return apps.filter(app => {
      // Exclude system apps (common patterns)
      const systemAppPatterns = [
        'com.android.',
        'com.google.android.',
        'com.qualcomm.',
        'com.nudge.app', // Exclude Nudge itself
      ];
      
      return !systemAppPatterns.some(pattern => 
        app.packageName.startsWith(pattern)
      );
    });
  }
}

export const appDiscoveryService = new AppDiscoveryService();
