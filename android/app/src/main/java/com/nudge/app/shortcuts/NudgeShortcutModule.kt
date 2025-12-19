package com.nudge.app.shortcuts

import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import androidx.core.content.pm.ShortcutInfoCompat
import androidx.core.content.pm.ShortcutManagerCompat
import androidx.core.graphics.drawable.IconCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.nudge.app.LauncherActivity
import com.nudge.app.MainActivity
import com.nudge.app.R

class NudgeShortcutModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "NudgeShortcut"

  @ReactMethod
  fun isPinShortcutSupported(promise: Promise) {
    promise.resolve(ShortcutManagerCompat.isRequestPinShortcutSupported(reactContext))
  }

  /**
   * Creates a pinned shortcut on the user's launcher.
   *
   * @param shortcutId stable id for the shortcut (e.g. "nudge.launch" or "nudge.settings")
   * @param label the shortcut label
   * @param iconFromPackageName optional package name to clone icon from; if empty/null uses Nudge icon
   * @param kind either "launch" (opens LauncherActivity) or "settings" (opens MainActivity with openSettings=true)
   */
  @ReactMethod
  fun requestPinShortcut(
    shortcutId: String,
    label: String,
    iconFromPackageName: String?,
    kind: String,
    promise: Promise
  ) {
    try {
      if (!ShortcutManagerCompat.isRequestPinShortcutSupported(reactContext)) {
        promise.resolve(false)
        return
      }

      val intent = when (kind) {
        "settings" -> Intent(reactContext, MainActivity::class.java).apply {
          putExtra("openSettings", true)
          action = Intent.ACTION_VIEW
        }
        else -> Intent(reactContext, LauncherActivity::class.java).apply {
          action = Intent.ACTION_VIEW
        }
      }

      val icon = buildIcon(iconFromPackageName)

      val shortcut = ShortcutInfoCompat.Builder(reactContext, shortcutId)
        .setShortLabel(label)
        .setIcon(icon)
        .setIntent(intent)
        .build()

      val ok = ShortcutManagerCompat.requestPinShortcut(reactContext, shortcut, null)
      promise.resolve(ok)
    } catch (e: Exception) {
      promise.reject("E_SHORTCUT", "Failed to request pinned shortcut", e)
    }
  }

  private fun buildIcon(iconFromPackageName: String?): IconCompat {
    val pm = reactContext.packageManager
    val pkg = iconFromPackageName?.trim().orEmpty()
    return try {
      if (pkg.isNotEmpty()) {
        val drawable = pm.getApplicationIcon(pkg)
        IconCompat.createWithAdaptiveBitmap(drawableToBitmap(drawable))
      } else {
        IconCompat.createWithResource(reactContext, R.mipmap.ic_launcher)
      }
    } catch (_: Exception) {
      IconCompat.createWithResource(reactContext, R.mipmap.ic_launcher)
    }
  }

  private fun drawableToBitmap(drawable: Drawable): Bitmap {
    if (drawable is BitmapDrawable && drawable.bitmap != null) {
      return drawable.bitmap
    }

    val width = if (drawable.intrinsicWidth > 0) drawable.intrinsicWidth else 192
    val height = if (drawable.intrinsicHeight > 0) drawable.intrinsicHeight else 192
    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)
    drawable.setBounds(0, 0, canvas.width, canvas.height)
    drawable.draw(canvas)
    return bitmap
  }
}


