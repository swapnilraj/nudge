import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider';
import { WeightedApp, AppInfo } from '../types';
import { AppDiscoveryService } from '../services/AppDiscoveryService';

interface SettingsScreenProps {
  currentApps: WeightedApp[];
  onSave: (apps: WeightedApp[]) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ currentApps, onSave }) => {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [selectedApps, setSelectedApps] = useState<WeightedApp[]>(currentApps);
  const [loading, setLoading] = useState(true);
  const discoveryService = new AppDiscoveryService();

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      const installedApps = await discoveryService.getInstalledApps();
      const launchableApps = discoveryService.filterLaunchableApps(installedApps);
      setApps(launchableApps);
    } catch (error) {
      console.error('Error loading apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleApp = (app: AppInfo) => {
    const existingIndex = selectedApps.findIndex(a => a.packageName === app.packageName);
    if (existingIndex >= 0) {
      // Remove app
      setSelectedApps(selectedApps.filter((_, i) => i !== existingIndex));
    } else {
      // Add app with default weight
      setSelectedApps([...selectedApps, { ...app, weight: 5 }]);
    }
  };

  const updateWeight = (packageName: string, weight: number) => {
    setSelectedApps(selectedApps.map(app =>
      app.packageName === packageName ? { ...app, weight } : app
    ));
  };

  const handleSave = () => {
    if (selectedApps.length === 0) {
      alert('Please select at least one app');
      return;
    }
    onSave(selectedApps);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Select apps and configure weights</Text>
      
      <FlatList
        data={apps}
        keyExtractor={(item) => item.packageName}
        renderItem={({ item }) => {
          const isSelected = selectedApps.some(a => a.packageName === item.packageName);
          const weightedApp = selectedApps.find(a => a.packageName === item.packageName);
          
          return (
            <View style={styles.appItem}>
              <TouchableOpacity
                style={styles.appHeader}
                onPress={() => toggleApp(item)}
              >
                <Text style={styles.appName}>{item.label}</Text>
                <Text style={styles.checkbox}>{isSelected ? '✓' : ''}</Text>
              </TouchableOpacity>
              {isSelected && weightedApp && (
                <View style={styles.sliderContainer}>
                  <Text style={styles.weightLabel}>Weight: {weightedApp.weight}</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={10}
                    step={1}
                    value={weightedApp.weight}
                    onValueChange={(value) => updateWeight(item.packageName, value)}
                    minimumTrackTintColor="#2196F3"
                    maximumTrackTintColor="#ddd"
                  />
                </View>
              )}
            </View>
          );
        }}
      />
      
      <TouchableOpacity
        style={[styles.button, selectedApps.length === 0 && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={selectedApps.length === 0}
      >
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  appItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  appName: {
    fontSize: 16,
  },
  checkbox: {
    fontSize: 20,
    color: '#2196F3',
  },
  sliderContainer: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  weightLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  slider: {
    height: 40,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
