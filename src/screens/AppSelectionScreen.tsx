import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Text, Button, Checkbox, Card } from 'react-native-paper';
import { appDiscoveryService } from '../services/AppDiscoveryService';
import { AppInfo, WeightedApp } from '../types';

interface AppSelectionScreenProps {
  onComplete: (apps: WeightedApp[]) => void;
  initialSelectedApps?: WeightedApp[];
}

export default function AppSelectionScreen({ 
  onComplete, 
  initialSelectedApps = [] 
}: AppSelectionScreenProps) {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [selectedApps, setSelectedApps] = useState<Set<string>>(
    new Set(initialSelectedApps.map(app => app.packageName))
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    setLoading(true);
    try {
      const installedApps = await appDiscoveryService.getInstalledApps();
      const launchableApps = appDiscoveryService.filterLaunchableApps(installedApps);
      setApps(launchableApps);
    } catch (error) {
      console.error('Error loading apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleApp = (packageName: string) => {
    const newSelected = new Set(selectedApps);
    if (newSelected.has(packageName)) {
      newSelected.delete(packageName);
    } else {
      newSelected.add(packageName);
    }
    setSelectedApps(newSelected);
  };

  const handleContinue = () => {
    if (selectedApps.size === 0) {
      // Show error - need at least one app
      return;
    }

    const weightedApps: WeightedApp[] = Array.from(selectedApps).map(packageName => {
      const existing = initialSelectedApps.find(app => app.packageName === packageName);
      const appInfo = apps.find(app => app.packageName === packageName);
      
      return {
        packageName,
        label: appInfo?.label || packageName,
        icon: appInfo?.icon,
        weight: existing?.weight || 5, // Default weight of 5
      };
    });

    onComplete(weightedApps);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading installed apps...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Select Apps
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Choose the apps you want Nudge to randomly select from
      </Text>
      
      <FlatList
        data={apps}
        keyExtractor={(item) => item.packageName}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Checkbox
                status={selectedApps.has(item.packageName) ? 'checked' : 'unchecked'}
                onPress={() => toggleApp(item.packageName)}
              />
              <View style={styles.appInfo}>
                <Text variant="bodyLarge">{item.label}</Text>
                <Text variant="bodySmall" style={styles.packageName}>
                  {item.packageName}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
        style={styles.list}
      />

      <Button
        mode="contained"
        onPress={handleContinue}
        disabled={selectedApps.size === 0}
        style={styles.button}
      >
        Continue ({selectedApps.size} selected)
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
    color: '#666',
  },
  loadingText: {
    marginTop: 16,
  },
  list: {
    flex: 1,
  },
  card: {
    marginBottom: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appInfo: {
    flex: 1,
    marginLeft: 12,
  },
  packageName: {
    color: '#666',
    marginTop: 4,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
});
