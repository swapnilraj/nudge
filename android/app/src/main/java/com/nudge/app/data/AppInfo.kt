package com.nudge.app.data

data class AppInfo(
    val packageName: String,
    val label: String,
    val icon: String? = null
)

data class WeightedApp(
    val packageName: String,
    val label: String,
    val icon: String? = null,
    val weight: Int
)

data class UserPreferences(
    val isFirstLaunch: Boolean,
    val selectedApps: List<WeightedApp>,
    val lastModified: String
)
