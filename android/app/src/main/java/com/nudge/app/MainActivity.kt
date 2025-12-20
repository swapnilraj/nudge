package com.nudge.app

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import com.nudge.app.notifications.NudgeNotificationHelper
import com.nudge.app.ui.MainViewModel
import com.nudge.app.ui.Screen
import com.nudge.app.ui.screens.*
import com.nudge.app.ui.theme.NudgeTheme

class MainActivity : ComponentActivity() {
    
    private val viewModel: MainViewModel by viewModels()
    
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            // Show notification after permission is granted
            NudgeNotificationHelper.showPersistentNotification(this)
        }
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Check if we should open settings
        (application as MainApplication).checkIntent(intent)
        
        // Request notification permission on Android 13+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            when {
                ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.POST_NOTIFICATIONS
                ) == PackageManager.PERMISSION_GRANTED -> {
                    // Permission already granted, show notification
                    NudgeNotificationHelper.showPersistentNotification(this)
                }
                else -> {
                    // Request permission
                    requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                }
            }
        } else {
            // Android 12 and below - no permission needed
            NudgeNotificationHelper.showPersistentNotification(this)
        }
        
        setContent {
            NudgeTheme {
                val uiState = viewModel.uiState
                
                when (uiState.value.currentScreen) {
                    is Screen.Launching -> {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator()
                        }
                    }
                    
                    is Screen.Welcome -> {
                        WelcomeScreen(
                            onContinue = { viewModel.onWelcomeContinue() }
                        )
                    }
                    
                    is Screen.AppSelection -> {
                        AppSelectionScreen(
                            allApps = uiState.value.allApps,
                            selectedApps = uiState.value.selectedApps,
                            onAppsSelected = { viewModel.onAppsSelected(it) },
                            onNext = { viewModel.onAppSelectionNext() }
                        )
                    }
                    
                    is Screen.WeightConfig -> {
                        WeightConfigScreen(
                            apps = uiState.value.weightedApps,
                            onWeightsChanged = { viewModel.onWeightsChanged(it) },
                            onSave = { viewModel.onWeightConfigSave() }
                        )
                    }
                    
                    is Screen.Settings -> {
                        SettingsScreen(
                            allApps = uiState.value.allApps,
                            currentApps = uiState.value.preferences?.selectedApps ?: emptyList(),
                            onSave = { viewModel.onSettingsSave(it) }
                        )
                    }
                }
            }
        }
    }
    
    override fun onNewIntent(intent: android.content.Intent?) {
        super.onNewIntent(intent)
        (application as MainApplication).checkIntent(intent)
        viewModel.openSettings()
    }
}
