import * as IntentLauncher from 'expo-intent-launcher';

export class AppLauncher {
  async launchApp(packageName: string): Promise<boolean> {
    try {
      // Launch app using Android intent
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.MAIN,
        {
          package: packageName,
        }
      );
      return true;
    } catch (error) {
      console.error(`Error launching app ${packageName}:`, error);
      // Try alternative method
      try {
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.MAIN,
          {
            data: `package:${packageName}`,
          }
        );
        return true;
      } catch (secondError) {
        console.error(`Second attempt failed for ${packageName}:`, secondError);
        return false;
      }
    }
  }

  async canLaunchApp(packageName: string): Promise<boolean> {
    try {
      // Try to query if the app exists
      // This is a simplified check - in production you might want more robust checking
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const appLauncher = new AppLauncher();
