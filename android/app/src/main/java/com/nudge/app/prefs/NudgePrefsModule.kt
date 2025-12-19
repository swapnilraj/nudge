package com.nudge.app.prefs

import android.content.Intent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class NudgePrefsModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  companion object {
    const val PREFS_NAME = "nudge_prefs"
    const val KEY_WEIGHTED_APPS_JSON = "weighted_apps_json"
    const val KEY_OPEN_SETTINGS = "openSettings"
  }

  override fun getName(): String = "NudgePrefs"

  @ReactMethod
  fun setWeightedAppsJson(json: String?, promise: Promise) {
    try {
      reactContext
        .getSharedPreferences(PREFS_NAME, 0)
        .edit()
        .putString(KEY_WEIGHTED_APPS_JSON, json)
        .apply()
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("E_PREFS_WRITE", "Failed to save weighted apps json", e)
    }
  }

  @ReactMethod
  fun consumeOpenSettingsFlag(promise: Promise) {
    try {
      val activity = reactContext.currentActivity
      val intent: Intent? = activity?.intent
      val value = intent?.getBooleanExtra(KEY_OPEN_SETTINGS, false) ?: false
      if (value) {
        intent?.removeExtra(KEY_OPEN_SETTINGS)
      }
      promise.resolve(value)
    } catch (e: Exception) {
      promise.reject("E_INTENT_READ", "Failed to read openSettings flag", e)
    }
  }
}


