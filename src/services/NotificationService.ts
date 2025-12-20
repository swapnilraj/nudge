import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

export class NotificationService {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    // Android 13+ requires POST_NOTIFICATIONS runtime permission. Earlier versions always allow.
    if (Platform.Version < 33) return true;

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    return status === PermissionsAndroid.RESULTS.GRANTED;
  }

  async createPersistentNotification(): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return;
    }

    if (Platform.OS === 'android' && NativeModules.NudgeNotification?.showPersistentNotification) {
      await NativeModules.NudgeNotification.showPersistentNotification();
      return;
    }
  }

  async removePersistentNotification(): Promise<void> {
    if (Platform.OS === 'android' && NativeModules.NudgeNotification?.hidePersistentNotification) {
      await NativeModules.NudgeNotification.hidePersistentNotification();
    }
  }

  handleNotificationAction(action: 'settings' | 'launch'): void {
    // This will be handled by the app's notification listener
    // Implementation depends on how you want to handle it
  }
}
