package com.nudge.app

import android.app.Application
import android.content.Intent
import com.nudge.app.notifications.NudgeNotificationHelper

class MainApplication : Application() {
  
  var shouldOpenSettings = false
  
  override fun onCreate() {
    super.onCreate()
    // Note: Notification will be shown from MainActivity after permission is granted
    // This ensures we request permission first on Android 13+
  }
  
  fun checkIntent(intent: Intent?) {
    shouldOpenSettings = intent?.getBooleanExtra("openSettings", false) ?: false
  }
}
