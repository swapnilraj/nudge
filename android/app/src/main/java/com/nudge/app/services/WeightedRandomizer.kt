package com.nudge.app.services

import com.nudge.app.data.WeightedApp
import kotlin.random.Random

class WeightedRandomizer {
    
    fun selectApp(apps: List<WeightedApp>): WeightedApp {
        if (apps.isEmpty()) {
            throw IllegalStateException("No apps available for selection")
        }
        
        // Filter out apps with weight 0
        val validApps = apps.filter { it.weight > 0 }
        
        if (validApps.isEmpty()) {
            throw IllegalStateException("No apps with valid weights")
        }
        
        val totalWeight = validApps.sumOf { it.weight }
        var random = Random.nextDouble(0.0, totalWeight.toDouble())
        
        for (app in validApps) {
            random -= app.weight
            if (random <= 0) {
                return app
            }
        }
        
        // Fallback to last app
        return validApps.last()
    }
}
