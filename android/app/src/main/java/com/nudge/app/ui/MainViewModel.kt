package com.nudge.app.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.nudge.app.data.AppInfo
import com.nudge.app.data.UserPreferences
import com.nudge.app.data.WeightedApp
import com.nudge.app.MainApplication
import com.nudge.app.notifications.NudgeNotificationHelper
import com.nudge.app.services.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class Screen {
    object Launching : Screen()
    object Welcome : Screen()
    object AppSelection : Screen()
    object WeightConfig : Screen()
    object Settings : Screen()
}

data class MainUiState(
    val currentScreen: Screen = Screen.Launching,
    val isFirstLaunch: Boolean = true,
    val allApps: List<AppInfo> = emptyList(),
    val selectedApps: List<AppInfo> = emptyList(),
    val weightedApps: List<WeightedApp> = emptyList(),
    val preferences: UserPreferences? = null,
    val isLoading: Boolean = false
)

class MainViewModel(application: Application) : AndroidViewModel(application) {
    private val storageService = StorageService(application)
    private val appDiscoveryService = AppDiscoveryService(application.packageManager)
    private val weightedRandomizer = WeightedRandomizer()
    private val appLauncher = AppLauncher(application)
    
    private val _uiState = MutableStateFlow(MainUiState())
    val uiState: StateFlow<MainUiState> = _uiState.asStateFlow()
    
    init {
        initializeApp()
    }
    
    private fun initializeApp() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val prefs = storageService.getPreferences()
            val firstLaunch = storageService.isFirstLaunch()
            
            val apps = appDiscoveryService.getInstalledApps()
            val launchableApps = appDiscoveryService.filterLaunchableApps(apps)
            
            _uiState.value = _uiState.value.copy(
                isFirstLaunch = firstLaunch,
                allApps = launchableApps,
                preferences = prefs,
                isLoading = false
            )
            
            val shouldOpenSettings = (getApplication() as MainApplication).shouldOpenSettings
            
            if (shouldOpenSettings) {
                _uiState.value = _uiState.value.copy(currentScreen = Screen.Settings)
                (getApplication() as MainApplication).shouldOpenSettings = false
            } else if (prefs != null && !firstLaunch && prefs.selectedApps.isNotEmpty()) {
                _uiState.value = _uiState.value.copy(
                    currentScreen = Screen.Launching,
                    weightedApps = prefs.selectedApps
                )
                launchRandomApp(prefs.selectedApps)
            } else {
                _uiState.value = _uiState.value.copy(currentScreen = Screen.Welcome)
            }
            
            // Notification is shown from MainActivity after permission check
        }
    }
    
    fun onWelcomeContinue() {
        _uiState.value = _uiState.value.copy(currentScreen = Screen.AppSelection)
    }
    
    fun onAppsSelected(apps: List<AppInfo>) {
        _uiState.value = _uiState.value.copy(selectedApps = apps)
    }
    
    fun onAppSelectionNext() {
        val weighted = _uiState.value.selectedApps.map { app ->
            WeightedApp(
                packageName = app.packageName,
                label = app.label,
                icon = app.icon,
                weight = 5
            )
        }
        _uiState.value = _uiState.value.copy(
            weightedApps = weighted,
            currentScreen = Screen.WeightConfig
        )
    }
    
    fun onWeightsChanged(apps: List<WeightedApp>) {
        _uiState.value = _uiState.value.copy(weightedApps = apps)
    }
    
    fun onWeightConfigSave() {
        viewModelScope.launch {
            val prefs = UserPreferences(
                isFirstLaunch = false,
                selectedApps = _uiState.value.weightedApps,
                lastModified = java.time.Instant.now().toString()
            )
            
            storageService.savePreferences(prefs)
            _uiState.value = _uiState.value.copy(
                preferences = prefs,
                isFirstLaunch = false
            )
            
            // Show notification after saving preferences (helper checks permissions)
            NudgeNotificationHelper.showPersistentNotification(getApplication())
            
            if (_uiState.value.weightedApps.isNotEmpty()) {
                launchRandomApp(_uiState.value.weightedApps)
            }
        }
    }
    
    fun onSettingsSave(apps: List<WeightedApp>) {
        viewModelScope.launch {
            val prefs = UserPreferences(
                isFirstLaunch = false,
                selectedApps = apps,
                lastModified = java.time.Instant.now().toString()
            )
            
            storageService.savePreferences(prefs)
            _uiState.value = _uiState.value.copy(
                preferences = prefs,
                weightedApps = apps
            )
        }
    }
    
    fun openSettings() {
        _uiState.value = _uiState.value.copy(currentScreen = Screen.Settings)
    }
    
    private fun launchRandomApp(apps: List<WeightedApp>) {
        viewModelScope.launch {
            try {
                val selectedApp = weightedRandomizer.selectApp(apps)
                val success = appLauncher.launchApp(selectedApp.packageName)
                
                if (!success) {
                    _uiState.value = _uiState.value.copy(currentScreen = Screen.Settings)
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(currentScreen = Screen.Settings)
            }
        }
    }
}
