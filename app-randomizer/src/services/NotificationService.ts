import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const NOTIFICATION_ID = 'nudge-persistent-notification';

export class NotificationService {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      return finalStatus === 'granted';
    }
    return true;
  }

  async createPersistentNotification(): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return;
    }

    // Cancel existing notification if any
    await Notifications.cancelNotificationAsync(NOTIFICATION_ID);

    // Create persistent notification with action buttons
    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_ID,
      content: {
        title: 'Nudge',
        body: 'Tap to launch a random app or open settings',
        data: { type: 'persistent' },
        sticky: true, // Makes it persistent
      },
      trigger: null, // null means show immediately and persist
    });
  }

  async removePersistentNotification(): Promise<void> {
    await Notifications.cancelNotificationAsync(NOTIFICATION_ID);
  }

  handleNotificationAction(action: 'settings' | 'launch'): void {
    // This will be handled by the app's notification listener
    // Implementation depends on how you want to handle it
  }
}
