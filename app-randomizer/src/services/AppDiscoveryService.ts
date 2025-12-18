import InstalledApps from 'react-native-installed-apps';
import { AppInfo } from '../types';

export class AppDiscoveryService {
  async getInstalledApps(): Promise<AppInfo[]> {
    try {
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
