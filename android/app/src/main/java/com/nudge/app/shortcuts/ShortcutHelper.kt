package com.nudge.app.shortcuts

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import androidx.core.content.pm.ShortcutInfoCompat
import androidx.core.content.pm.ShortcutManagerCompat
import androidx.core.graphics.drawable.IconCompat
import com.nudge.app.LauncherActivity
import com.nudge.app.MainActivity
import com.nudge.app.R

object ShortcutHelper {
    
    fun isPinShortcutSupported(context: Context): Boolean {
        return ShortcutManagerCompat.isRequestPinShortcutSupported(context)
    }
    
    /**
     * Creates a pinned shortcut on the user's launcher.
     *
     * @param context the application context
     * @param shortcutId stable id for the shortcut (e.g. "nudge.launch" or "nudge.settings")
     * @param label the shortcut label
     * @param iconFromPackageName optional package name to clone icon from; if empty/null uses Nudge icon
     * @param kind either "launch" (opens LauncherActivity) or "settings" (opens MainActivity with openSettings=true)
     */
    fun requestPinShortcut(
        context: Context,
        shortcutId: String,
        label: String,
        iconFromPackageName: String?,
        kind: String
    ): Boolean {
        return try {
            if (!ShortcutManagerCompat.isRequestPinShortcutSupported(context)) {
                return false
            }

            val intent = when (kind) {
                "settings" -> Intent(context, MainActivity::class.java).apply {
                    putExtra("openSettings", true)
                    action = Intent.ACTION_VIEW
                }
                else -> Intent(context, LauncherActivity::class.java).apply {
                    action = Intent.ACTION_VIEW
                }
            }

            val icon = buildIcon(context, iconFromPackageName)

            val shortcut = ShortcutInfoCompat.Builder(context, shortcutId)
                .setShortLabel(label)
                .setIcon(icon)
                .setIntent(intent)
                .build()

            ShortcutManagerCompat.requestPinShortcut(context, shortcut, null)
        } catch (e: Exception) {
            false
        }
    }

    private fun buildIcon(context: Context, iconFromPackageName: String?): IconCompat {
        val pm = context.packageManager
        val pkg = iconFromPackageName?.trim().orEmpty()
        return try {
            if (pkg.isNotEmpty()) {
                val drawable = pm.getApplicationIcon(pkg)
                IconCompat.createWithAdaptiveBitmap(drawableToBitmap(drawable))
            } else {
                IconCompat.createWithResource(context, R.mipmap.ic_launcher)
            }
        } catch (_: Exception) {
            IconCompat.createWithResource(context, R.mipmap.ic_launcher)
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
