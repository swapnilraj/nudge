package com.nudge.app.installedapps

import android.content.Intent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Arguments

class InstalledAppListModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "InstalledAppList"

  @ReactMethod
  fun getAll(promise: Promise) {
    try {
      val pm = reactApplicationContext.packageManager
      val intent = Intent(Intent.ACTION_MAIN, null).addCategory(Intent.CATEGORY_LAUNCHER)
      val resolveInfos = pm.queryIntentActivities(intent, 0)

      val apps = Arguments.createArray()
      for (ri in resolveInfos) {
        val packageName = ri.activityInfo?.packageName ?: continue
        val label = ri.loadLabel(pm)?.toString() ?: packageName

        val app = Arguments.createMap().apply {
          putString("packageName", packageName)
          putString("label", label)
        }
        apps.pushMap(app)
      }

      promise.resolve(apps)
    } catch (e: Exception) {
      promise.reject("E_INSTALLED_APPS", "Failed to query installed apps", e)
    }
  }
}


