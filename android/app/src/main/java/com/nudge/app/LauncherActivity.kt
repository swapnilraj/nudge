package com.nudge.app

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import com.nudge.app.notifications.NudgeNotificationHelper
import com.nudge.app.services.StorageService
import com.nudge.app.services.WeightedRandomizer
import com.nudge.app.services.AppLauncher
import org.json.JSONArray
import kotlin.random.Random

class LauncherActivity : Activity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // Note: Notification is shown from MainActivity after permission check
    // LauncherActivity runs before MainActivity, so we don't show it here

    // No UI: immediately attempt to launch a weighted-random app.
    val storageService = StorageService(this)
    val json = storageService.getWeightedAppsJson()
    val selectedPackage = trySelectWeightedPackage(json)

    if (selectedPackage == null) {
      openSettings()
      return
    }

    val appLauncher = AppLauncher(this)
    val success = appLauncher.launchApp(selectedPackage)

    if (!success) {
      openSettings()
      return
    }

    finish()
  }

  private fun openSettings() {
    val i = Intent(this, MainActivity::class.java).apply {
      putExtra("openSettings", true)
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
        val weight = obj.optInt("weight", 0).coerceAtLeast(0)
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

    var r = Random.nextDouble(0.0, total.toDouble())
    for ((pkg, w) in apps) {
      r -= w
      if (r <= 0) return pkg
    }
    return apps.last().first
  }
}


