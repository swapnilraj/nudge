package com.nudge.app.ui.screens

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.ArrowDropUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nudge.app.data.AppInfo
import com.nudge.app.data.WeightedApp
import com.nudge.app.shortcuts.ShortcutHelper
import com.nudge.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)

@Composable
fun SettingsScreen(
    allApps: List<AppInfo>,
    currentApps: List<WeightedApp>,
    onSave: (List<WeightedApp>) -> Unit
) {
    val context = LocalContext.current
    var query by remember { mutableStateOf("") }
    var selectedApps by remember { mutableStateOf(currentApps.toMutableList()) }
    var shortcutExpanded by remember { mutableStateOf(false) }
    var shortcutLabel by remember { mutableStateOf("Nudge") }
    var shortcutIconPackage by remember { mutableStateOf<String?>(null) }
    var shortcutIconLabel by remember { mutableStateOf<String?>(null) }
    var iconPickerOpen by remember { mutableStateOf(false) }
    
    val visibleApps = remember(allApps, query) {
        val q = query.trim().lowercase()
        val sorted = allApps.sortedBy { it.label }
        if (q.isEmpty()) {
            sorted
        } else {
            sorted.filter {
                it.label.lowercase().contains(q) || it.packageName.lowercase().contains(q)
            }
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        "Settings",
                        fontWeight = FontWeight.Bold
                    ) 
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface
                )
            )
        },
        bottomBar = {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                tonalElevation = 8.dp,
                color = MaterialTheme.colorScheme.surface
            ) {
                Button(
                    onClick = { onSave(selectedApps) },
                    enabled = selectedApps.isNotEmpty(),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                        .height(56.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (selectedApps.isNotEmpty()) Primary else PrimaryMuted,
                        disabledContainerColor = PrimaryMuted
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        "Save Configuration",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp)
        ) {
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "Select apps and configure weights",
                style = MaterialTheme.typography.bodyMedium,
                color = TextMuted,
                modifier = Modifier.padding(bottom = 16.dp)
            )
            
            // Search bar
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                placeholder = { Text("Search apps…") },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp),
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Primary,
                    unfocusedBorderColor = Border
                )
            )
            
            // Shortcut section - collapsible
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Column {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { shortcutExpanded = !shortcutExpanded }
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Customize Launcher Shortcut",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.SemiBold
                        )
                        Icon(
                            imageVector = if (shortcutExpanded) Icons.Default.ArrowDropUp else Icons.Default.ArrowDropDown,
                            contentDescription = null,
                            tint = TextMuted
                        )
                    }
                    
                    if (shortcutExpanded) {
                        HorizontalDivider()
                        Column(
                            modifier = Modifier.padding(16.dp)
                        ) {
                            Text(
                                text = "Create a home-screen shortcut with a custom name and icon.",
                                style = MaterialTheme.typography.bodySmall,
                                color = TextMuted,
                                modifier = Modifier.padding(bottom = 12.dp)
                            )
                            
                            OutlinedTextField(
                                value = shortcutLabel,
                                onValueChange = { shortcutLabel = it },
                                label = { Text("Shortcut name") },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 12.dp),
                                singleLine = true,
                                shape = RoundedCornerShape(8.dp)
                            )
                            
                            OutlinedButton(
                                onClick = { iconPickerOpen = true },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 12.dp),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(
                                    text = shortcutIconLabel ?: "Select icon source (optional)",
                                    modifier = Modifier.weight(1f),
                                    textAlign = androidx.compose.ui.text.style.TextAlign.Start
                                )
                            }
                            
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Button(
                                    onClick = {
                                        val supported = ShortcutHelper.isPinShortcutSupported(context)
                                        if (!supported) {
                                            Toast.makeText(context, "Your launcher does not support pinned shortcuts.", Toast.LENGTH_SHORT).show()
                                            return@Button
                                        }
                                        val id = "nudge.launch"
                                        val label = shortcutLabel.trim().ifEmpty { "Nudge" }
                                        val ok = ShortcutHelper.requestPinShortcut(context, id, label, shortcutIconPackage, "launch")
                                        if (!ok) {
                                            Toast.makeText(context, "Shortcut request was not accepted.", Toast.LENGTH_SHORT).show()
                                        } else {
                                            Toast.makeText(context, "Shortcut request sent. Confirm it in the system prompt.", Toast.LENGTH_SHORT).show()
                                        }
                                    },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Launch", style = MaterialTheme.typography.labelSmall)
                                }
                                Button(
                                    onClick = {
                                        val supported = ShortcutHelper.isPinShortcutSupported(context)
                                        if (!supported) {
                                            Toast.makeText(context, "Your launcher does not support pinned shortcuts.", Toast.LENGTH_SHORT).show()
                                            return@Button
                                        }
                                        val id = "nudge.settings"
                                        val label = shortcutLabel.trim().ifEmpty { "Nudge Settings" }
                                        val ok = ShortcutHelper.requestPinShortcut(context, id, label, shortcutIconPackage, "settings")
                                        if (!ok) {
                                            Toast.makeText(context, "Shortcut request was not accepted.", Toast.LENGTH_SHORT).show()
                                        } else {
                                            Toast.makeText(context, "Shortcut request sent. Confirm it in the system prompt.", Toast.LENGTH_SHORT).show()
                                        }
                                    },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Settings", style = MaterialTheme.typography.labelSmall)
                                }
                            }
                        }
                    }
                }
            }
            
            // App list
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(visibleApps) { app ->
                    val isSelected = selectedApps.any { it.packageName == app.packageName }
                    val weightedApp = selectedApps.find { it.packageName == app.packageName }
                    
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isSelected) 
                                Primary.copy(alpha = 0.1f) 
                            else 
                                MaterialTheme.colorScheme.surface
                        ),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = app.label,
                                    style = MaterialTheme.typography.bodyLarge,
                                    fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                                    modifier = Modifier.weight(1f)
                                )
                                
                                Checkbox(
                                    checked = isSelected,
                                    onCheckedChange = {
                                        selectedApps = if (isSelected) {
                                            selectedApps.filter { it.packageName != app.packageName }.toMutableList()
                                        } else {
                                            (selectedApps + WeightedApp(
                                                packageName = app.packageName,
                                                label = app.label,
                                                icon = app.icon,
                                                weight = 5
                                            )).toMutableList()
                                        }
                                    },
                                    colors = CheckboxDefaults.colors(
                                        checkedColor = Primary
                                    )
                                )
                            }
                            
                            if (isSelected && weightedApp != null) {
                                Spacer(modifier = Modifier.height(12.dp))
                                HorizontalDivider()
                                Spacer(modifier = Modifier.height(12.dp))
                                
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "Weight: ${weightedApp.weight}",
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = FontWeight.Medium,
                                        color = Primary
                                    )
                                }
                                
                                Spacer(modifier = Modifier.height(8.dp))
                                
                            Slider(
                                value = weightedApp.weight.toFloat(),
                                onValueChange = { value ->
                                    val newWeight = value.toInt().coerceIn(1, 10)
                                    val index = selectedApps.indexOfFirst { it.packageName == app.packageName }
                                    if (index >= 0) {
                                        val updated = selectedApps.toMutableList()
                                        updated[index] = updated[index].copy(weight = newWeight)
                                        selectedApps = updated
                                    }
                                },
                                valueRange = 1f..10f,
                                steps = 8,
                                colors = SliderDefaults.colors(
                                    thumbColor = Primary,
                                    activeTrackColor = Primary
                                )
                            )
                            }
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
        }
    }
    
    // Icon picker - use bottom sheet instead of modal
    if (iconPickerOpen) {
        ModalBottomSheet(
            onDismissRequest = { iconPickerOpen = false },
            containerColor = MaterialTheme.colorScheme.surface,
            shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Text(
                    text = "Select Icon Source",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 16.dp)
                )
                
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp)
                        .clickable {
                            shortcutIconPackage = null
                            shortcutIconLabel = null
                            iconPickerOpen = false
                        },
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Text(
                        text = "Use Nudge icon",
                        modifier = Modifier.padding(16.dp),
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = FontWeight.Medium
                    )
                }
                
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 400.dp)
                ) {
                    items(allApps) { app ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 8.dp)
                                .clickable {
                                    shortcutIconPackage = app.packageName
                                    shortcutIconLabel = app.label
                                    iconPickerOpen = false
                                },
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text(
                                text = app.label,
                                modifier = Modifier.padding(16.dp),
                                style = MaterialTheme.typography.bodyLarge
                            )
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}
