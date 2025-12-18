import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Text, Button, Checkbox, Card, IconButton } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { appDiscoveryService } from '../services/AppDiscoveryService';
import { AppInfo, UserPreferences, WeightedApp } from '../types';

interface SettingsScreenProps {
  preferences: UserPreferences;
  onSave: (apps: WeightedApp[]) => void;
}

export default function SettingsScreen({ preferences, onSave }: SettingsScreenProps) {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [selectedApps, setSelectedApps] = useState<WeightedApp[]>(preferences.selectedApps);
  const [loading, setLoading] = useState(true);
  const [showWeights, setShowWeights] = useState(false);

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

  const toggleApp = (appInfo: AppInfo) => {
    const existingIndex = selectedApps.findIndex(
      app => app.packageName === appInfo.packageName
    );

    if (existingIndex >= 0) {
      // Remove app
      setSelectedApps(prev => prev.filter((_, i) => i !== existingIndex));
    } else {
      // Add app with default weight
      setSelectedApps(prev => [
        ...prev,
        {
          ...appInfo,
          weight: 5,
        },
      ]);
    }
  };

  const updateWeight = (packageName: string, weight: number) => {
    setSelectedApps(prev =>
      prev.map(app =>
        app.packageName === packageName
          ? { ...app, weight: Math.round(weight) }
          : app
      )
    );
  };

  const handleSave = () => {
    if (selectedApps.length === 0) {
      // Show error
      return;
    }

    const hasValidWeight = selectedApps.some(app => app.weight > 0);
    if (!hasValidWeight) {
      // Show error
      return;
    }

    onSave(selectedApps);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading apps...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Settings
        </Text>
        <IconButton
          icon={showWeights ? 'eye-off' : 'eye'}
          onPress={() => setShowWeights(!showWeights)}
        />
      </View>

      <FlatList
        data={apps}
        keyExtractor={(item) => item.packageName}
        renderItem={({ item }) => {
          const isSelected = selectedApps.some(
            app => app.packageName === item.packageName
          );
          const selectedApp = selectedApps.find(
            app => app.packageName === item.packageName
          );

          return (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.appRow}>
                  <Checkbox
                    status={isSelected ? 'checked' : 'unchecked'}
                    onPress={() => toggleApp(item)}
                  />
                  <View style={styles.appInfo}>
                    <Text variant="bodyLarge">{item.label}</Text>
                    <Text variant="bodySmall" style={styles.packageName}>
                      {item.packageName}
                    </Text>
                  </View>
                </View>
                {isSelected && showWeights && selectedApp && (
                  <View style={styles.weightSection}>
                    <Text variant="bodyMedium">Weight: {selectedApp.weight}</Text>
                    <Slider
                      style={styles.slider}
                      minimumValue={1}
                      maximumValue={10}
                      step={1}
                      value={selectedApp.weight}
                      onValueChange={(value) => updateWeight(item.packageName, value)}
                      minimumTrackTintColor="#6200ee"
                      maximumTrackTintColor="#ccc"
                    />
                  </View>
                )}
              </Card.Content>
            </Card>
          );
        }}
        style={styles.list}
      />

      <Button
        mode="contained"
        onPress={handleSave}
        disabled={selectedApps.length === 0}
        style={styles.button}
      >
        Save ({selectedApps.length} apps selected)
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    flex: 1,
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
  appRow: {
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
  weightSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  slider: {
    width: '100%',
    height: 40,
    marginVertical: 8,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
});
