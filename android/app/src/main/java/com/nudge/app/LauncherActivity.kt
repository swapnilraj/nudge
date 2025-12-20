package com.nudge.app

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import com.nudge.app.notifications.NudgeNotificationHelper
import org.json.JSONArray
import kotlin.math.max

class LauncherActivity : Activity() {

  private val prefsName = "nudge_prefs"
  private val appsKey = "weighted_apps_json"

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // Ensure the persistent settings notification exists even when we don't start React Native.
    NudgeNotificationHelper.showPersistentNotification(this)

    // No UI: immediately attempt to launch a weighted-random app.
    val json = getSharedPreferences(prefsName, MODE_PRIVATE).getString(appsKey, null)
    val selectedPackage = trySelectWeightedPackage(json)

    if (selectedPackage == null) {
      openSettings()
      return
    }

    val launchIntent = packageManager.getLaunchIntentForPackage(selectedPackage)?.apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }

    if (launchIntent == null) {
      openSettings()
      return
    }

    startActivity(launchIntent)
    finish()
  }

  private fun openSettings() {
    val i = Intent(this, SettingsActivity::class.java).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
    }
    startActivity(i)
    finish()
  }

  private fun trySelectWeightedPackage(json: String?): String? {
    if (json.isNullOrBlank()) return null
    val apps: List<Pair<String, Int>> = try {
      val arr = JSONArray(json)
      val out = ArrayList<Pair<String, Int>>(arr.length())
      for (i in 0 until arr.length()) {
        val obj = arr.optJSONObject(i) ?: continue
        val pkg = obj.optString("packageName", "").trim()
        if (pkg.isEmpty()) continue
        val weight = max(0, obj.optInt("weight", 0))
        if (weight <= 0) continue
        out.add(pkg to weight)
      }
      out
    } catch (_: Exception) {
      return null
    }

    if (apps.isEmpty()) return null

    val total = apps.sumOf { it.second }
    if (total <= 0) return null

    var r = (Math.random() * total).toInt() + 1 // 1..total
    for ((pkg, w) in apps) {
      r -= w
      if (r <= 0) return pkg
    }
    return apps.last().first
  }
}


