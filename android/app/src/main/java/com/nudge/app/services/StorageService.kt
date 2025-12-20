package com.nudge.app.services

import android.content.Context
import android.content.SharedPreferences
import com.nudge.app.data.UserPreferences
import com.nudge.app.data.WeightedApp
import org.json.JSONArray
import org.json.JSONObject

class StorageService(private val context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    
    companion object {
        private const val PREFS_NAME = "nudge_prefs"
        private const val KEY_PREFERENCES = "@nudge:preferences"
        private const val KEY_WEIGHTED_APPS_JSON = "weighted_apps_json"
    }
    
    fun getPreferences(): UserPreferences? {
        return try {
            val json = prefs.getString(KEY_PREFERENCES, null) ?: return null
            val obj = JSONObject(json)
            val appsArray = obj.getJSONArray("selectedApps")
            val apps = mutableListOf<WeightedApp>()
            for (i in 0 until appsArray.length()) {
                val appObj = appsArray.getJSONObject(i)
                apps.add(
                    WeightedApp(
                        packageName = appObj.getString("packageName"),
                        label = appObj.getString("label"),
                        icon = appObj.optString("icon", null),
                        weight = appObj.getInt("weight")
                    )
                )
            }
            UserPreferences(
                isFirstLaunch = obj.optBoolean("isFirstLaunch", true),
                selectedApps = apps,
                lastModified = obj.getString("lastModified")
            )
        } catch (e: Exception) {
            null
        }
    }
    
    fun savePreferences(prefs: UserPreferences) {
        try {
            val json = JSONObject().apply {
                put("isFirstLaunch", prefs.isFirstLaunch)
                put("lastModified", prefs.lastModified)
                val appsArray = JSONArray()
                prefs.selectedApps.forEach { app ->
                    appsArray.put(JSONObject().apply {
                        put("packageName", app.packageName)
                        put("label", app.label)
                        app.icon?.let { put("icon", it) }
                        put("weight", app.weight)
                    })
                }
                put("selectedApps", appsArray)
            }
            this.prefs.edit().putString(KEY_PREFERENCES, json.toString()).apply()
            
            // Also save weighted apps JSON for LauncherActivity
            val appsJson = JSONArray()
            prefs.selectedApps.forEach { app ->
                appsJson.put(JSONObject().apply {
                    put("packageName", app.packageName)
                    put("label", app.label)
                    app.icon?.let { put("icon", it) }
                    put("weight", app.weight)
                })
            }
            this.prefs.edit().putString(KEY_WEIGHTED_APPS_JSON, appsJson.toString()).apply()
        } catch (e: Exception) {
            throw e
        }
    }
    
    fun isFirstLaunch(): Boolean {
        val prefs = getPreferences()
        return prefs == null || prefs.isFirstLaunch
    }
    
    fun getWeightedAppsJson(): String? {
        return prefs.getString(KEY_WEIGHTED_APPS_JSON, null)
    }
}
