package com.nudge.app.services

import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ResolveInfo
import com.nudge.app.data.AppInfo

class AppDiscoveryService(private val packageManager: PackageManager) {
    
    fun getInstalledApps(): List<AppInfo> {
        val intent = Intent(Intent.ACTION_MAIN, null).apply {
            addCategory(Intent.CATEGORY_LAUNCHER)
        }
        val resolveInfos: List<ResolveInfo> = packageManager.queryIntentActivities(intent, 0)
        
        return resolveInfos.mapNotNull { ri ->
            val packageName = ri.activityInfo?.packageName ?: return@mapNotNull null
            val label = ri.loadLabel(packageManager)?.toString() ?: packageName
            
            AppInfo(
                packageName = packageName,
                label = label
            )
        }
    }
    
    fun filterLaunchableApps(apps: List<AppInfo>): List<AppInfo> {
        return apps.filter { app ->
            val packageName = app.packageName.lowercase()
            !packageName.startsWith("com.android") &&
            !packageName.startsWith("com.google.android") &&
            !packageName.startsWith("com.nudge.app") &&
            !packageName.contains("launcher") &&
            !packageName.contains("settings")
        }
    }
}
