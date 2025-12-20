package com.nudge.app.notifications

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class NudgeNotificationModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "NudgeNotification"

  @ReactMethod
  fun showPersistentNotification(promise: Promise) {
    try {
      NudgeNotificationHelper.showPersistentNotification(reactContext)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("E_NOTIFICATION", "Failed to show notification", e)
    }
  }

  @ReactMethod
  fun hidePersistentNotification(promise: Promise) {
    try {
      NudgeNotificationHelper.hidePersistentNotification(reactContext)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("E_NOTIFICATION", "Failed to hide notification", e)
    }
  }
}


