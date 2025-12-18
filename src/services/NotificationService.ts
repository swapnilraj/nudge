import * as Notifications from 'expo-notifications';
import { AppState } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const NOTIFICATION_ID = 'nudge-persistent-notification';

export class NotificationService {
  private notificationListener: Notifications.EventSubscription | null = null;
  private responseListener: Notifications.EventSubscription | null = null;

  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  }

  async createPersistentNotification(): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return;
    }

    try {
      // Cancel any existing notification first
      await Notifications.cancelNotificationAsync(NOTIFICATION_ID);

      // Create persistent notification with action buttons
      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_ID,
        content: {
          title: 'Nudge',
          body: 'Tap to launch a random app or open settings',
          data: { type: 'persistent' },
          sticky: true, // Make it persistent
        },
        trigger: null, // Show immediately
      });

      // Set up notification channel for Android
      await Notifications.setNotificationChannelAsync('nudge-default', {
        name: 'Nudge',
        importance: Notifications.AndroidImportance.LOW,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    } catch (error) {
      console.error('Error creating persistent notification:', error);
    }
  }

  async removePersistentNotification(): Promise<void> {
    try {
      await Notifications.cancelNotificationAsync(NOTIFICATION_ID);
    } catch (error) {
      console.error('Error removing persistent notification:', error);
    }
  }

  setupNotificationHandlers(
    onSettingsPress: () => void,
    onLaunchPress: () => void
  ): void {
    // Handle notification responses (when user taps notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        
        if (data?.action === 'settings') {
          onSettingsPress();
        } else if (data?.action === 'launch') {
          onLaunchPress();
        } else {
          // Default: open settings
          onSettingsPress();
        }
      }
    );
  }

  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
      this.notificationListener = null;
    }
    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }
  }
}

export const notificationService = new NotificationService();
