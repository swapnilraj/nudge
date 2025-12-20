package com.nudge.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nudge.app.data.AppInfo
import com.nudge.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)

@Composable
fun AppSelectionScreen(
    allApps: List<AppInfo>,
    selectedApps: List<AppInfo>,
    onAppsSelected: (List<AppInfo>) -> Unit,
    onNext: () -> Unit
) {
    var query by remember { mutableStateOf("") }
    var selected by remember { mutableStateOf(selectedApps.map { it.packageName }.toSet()) }
    
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
    
    LaunchedEffect(selectedApps) {
        selected = selectedApps.map { it.packageName }.toSet()
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        "Select Apps",
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
                    onClick = onNext,
                    enabled = selected.isNotEmpty(),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                        .height(56.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (selected.isNotEmpty()) Primary else PrimaryMuted,
                        disabledContainerColor = PrimaryMuted
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        "Next (${selected.size} selected)",
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
                text = "Choose apps you want to be nudged towards",
                style = MaterialTheme.typography.bodyMedium,
                color = TextMuted,
                modifier = Modifier.padding(bottom = 16.dp)
            )
            
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
            
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(visibleApps) { app ->
                    val isSelected = selected.contains(app.packageName)
                    
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
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
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
                                    selected = if (isSelected) {
                                        selected - app.packageName
                                    } else {
                                        selected + app.packageName
                                    }
                                    onAppsSelected(allApps.filter { selected.contains(it.packageName) })
                                },
                                colors = CheckboxDefaults.colors(
                                    checkedColor = Primary
                                )
                            )
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
        }
    }
}
