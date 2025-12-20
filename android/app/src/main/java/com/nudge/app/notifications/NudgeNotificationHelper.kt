package com.nudge.app.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.nudge.app.MainActivity
import com.nudge.app.R

object NudgeNotificationHelper {
  private const val CHANNEL_ID = "nudge_persistent"
  private const val CHANNEL_NAME = "Nudge"
  private const val NOTIFICATION_ID = 4242

  fun showPersistentNotification(context: Context) {
    // Check if notifications are enabled
    if (!areNotificationsEnabled(context)) {
      return
    }

    ensureChannel(context)

    // Clear any prior notifications from previous builds (including Expo fallback ones).
    NotificationManagerCompat.from(context).cancelAll()

    val intent = Intent(context, MainActivity::class.java).apply {
      putExtra("openSettings", true)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
    }

    val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    } else {
      PendingIntent.FLAG_UPDATE_CURRENT
    }

    val pendingIntent = PendingIntent.getActivity(context, 0, intent, flags)

    val notification = NotificationCompat.Builder(context, CHANNEL_ID)
      .setSmallIcon(R.drawable.notification_icon)
      .setContentTitle("Nudge")
      .setContentText("Tap to open settings")
      .setContentIntent(pendingIntent)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setPriority(NotificationCompat.PRIORITY_MIN)
      .setSilent(true)
      .build()

    NotificationManagerCompat.from(context).notify(NOTIFICATION_ID, notification)
  }

  private fun areNotificationsEnabled(context: Context): Boolean {
    val notificationManager = NotificationManagerCompat.from(context)
    
    // Check if notifications are enabled for the app
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      if (!notificationManager.areNotificationsEnabled()) {
        return false
      }
    }
    
    // For Android 13+, check POST_NOTIFICATIONS permission
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      return ContextCompat.checkSelfPermission(
        context,
        android.Manifest.permission.POST_NOTIFICATIONS
      ) == PackageManager.PERMISSION_GRANTED
    }
    
    return true
  }

  fun hidePersistentNotification(context: Context) {
    NotificationManagerCompat.from(context).cancel(NOTIFICATION_ID)
  }

  private fun ensureChannel(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val existing = nm.getNotificationChannel(CHANNEL_ID)
    if (existing != null) {
      // Update existing channel to be silent
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        existing.importance = NotificationManager.IMPORTANCE_MIN
        existing.setShowBadge(false)
        existing.enableVibration(false)
        existing.enableLights(false)
        existing.setSound(null, null)
        nm.createNotificationChannel(existing)
      }
      return
    }

    val channel = NotificationChannel(
      CHANNEL_ID,
      CHANNEL_NAME,
      NotificationManager.IMPORTANCE_MIN
    )
    channel.setShowBadge(false)
    channel.enableVibration(false)
    channel.enableLights(false)
    channel.setSound(null, null)
    channel.description = "Persistent notification to quickly access Nudge settings"
    nm.createNotificationChannel(channel)
  }
}


