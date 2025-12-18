import { WeightedApp } from '../types';

export class WeightedRandomizer {
  selectApp(apps: WeightedApp[]): WeightedApp {
    if (apps.length === 0) {
      throw new Error('Cannot select from empty app list');
    }

    // Filter out apps with weight 0
    const validApps = apps.filter(app => app.weight > 0);
    
    if (validApps.length === 0) {
      throw new Error('No apps with weight > 0');
    }

    const totalWeight = validApps.reduce((sum, app) => sum + app.weight, 0);
    let random = Math.random() * totalWeight;

    for (const app of validApps) {
      random -= app.weight;
      if (random <= 0) {
        return app;
      }
    }

    // Fallback to last app (shouldn't happen, but just in case)
    return validApps[validApps.length - 1];
  }
}

export const weightedRandomizer = new WeightedRandomizer();
