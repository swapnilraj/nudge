import * as Notifications from 'expo-notifications';
import { NativeModules, Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const PERSISTENT_NOTIFICATION_TAG = 'nudge-persistent-notification';

export class NotificationService {
  private async clearPersistentNotifications(): Promise<void> {
    // On Android we show a native ongoing notification instead of scheduling via Expo.
    if (Platform.OS === 'android' && NativeModules.NudgeNotification?.hidePersistentNotification) {
      await NativeModules.NudgeNotification.hidePersistentNotification();
      // Also clear any previously created Expo notifications from older builds
      // so we don't end up with duplicate ongoing notifications.
      try {
        await Notifications.dismissAllNotificationsAsync();
        await Notifications.cancelAllScheduledNotificationsAsync();
      } catch {
        // ignore
      }
    }

    // Cancel scheduled notifications that we previously scheduled as "persistent"
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const scheduledPersistent = scheduled.filter(
      req => (req.content.data as any)?.notificationTag === PERSISTENT_NOTIFICATION_TAG
    );
    await Promise.all(
      scheduledPersistent.map(req => Notifications.cancelScheduledNotificationAsync(req.identifier))
    );

    // Dismiss currently presented notifications matching our tag
    const presented = await Notifications.getPresentedNotificationsAsync();
    const presentedPersistent = presented.filter(
      n => (n.request.content.data as any)?.notificationTag === PERSISTENT_NOTIFICATION_TAG
    );
    await Promise.all(
      presentedPersistent.map(n => Notifications.dismissNotificationAsync(n.request.identifier))
    );
  }

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

    // Clear any existing persistent notification (scheduled or currently shown)
    await this.clearPersistentNotifications();

    if (Platform.OS === 'android' && NativeModules.NudgeNotification?.showPersistentNotification) {
      await NativeModules.NudgeNotification.showPersistentNotification();
      return;
    }

    // Create persistent notification with action buttons
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Nudge',
        body: 'Tap to launch a random app or open settings',
        data: { type: 'persistent', notificationTag: PERSISTENT_NOTIFICATION_TAG },
        sticky: true, // Makes it persistent
      },
      trigger: null, // null means show immediately and persist
    });
  }

  async removePersistentNotification(): Promise<void> {
    await this.clearPersistentNotifications();
  }

  handleNotificationAction(action: 'settings' | 'launch'): void {
    // This will be handled by the app's notification listener
    // Implementation depends on how you want to handle it
  }
}
