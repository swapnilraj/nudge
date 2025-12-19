import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AppInfo } from '../types';
import { AppDiscoveryService } from '../services/AppDiscoveryService';

interface AppSelectionScreenProps {
  selectedApps: AppInfo[];
  onAppsSelected: (apps: AppInfo[]) => void;
  onNext: () => void;
}

export const AppSelectionScreen: React.FC<AppSelectionScreenProps> = ({
  selectedApps,
  onAppsSelected,
  onNext,
}) => {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(selectedApps.map(app => app.packageName))
  );
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
    const newSelected = new Set(selected);
    if (newSelected.has(app.packageName)) {
      newSelected.delete(app.packageName);
    } else {
      newSelected.add(app.packageName);
    }
    setSelected(newSelected);
    
    const selectedAppsList = apps.filter(app => newSelected.has(app.packageName));
    onAppsSelected(selectedAppsList);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Loading installed apps...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Apps</Text>
      <Text style={styles.subtitle}>
        Choose apps you want to be nudged towards ({selected.size} selected)
      </Text>
      <FlatList
        data={apps}
        keyExtractor={(item) => item.packageName}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.appItem,
              selected.has(item.packageName) && styles.appItemSelected,
            ]}
            onPress={() => toggleApp(item)}
          >
            <Text style={styles.appName}>{item.label}</Text>
            <Text style={styles.checkbox}>
              {selected.has(item.packageName) ? '✓' : ''}
            </Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={[styles.button, selected.size === 0 && styles.buttonDisabled]}
        onPress={onNext}
        disabled={selected.size === 0}
      >
        <Text style={styles.buttonText}>Next</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  appItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  appName: {
    fontSize: 16,
  },
  checkbox: {
    fontSize: 20,
    color: '#2196F3',
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
