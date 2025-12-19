import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  NativeModules,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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
  const [query, setQuery] = useState('');
  const [shortcutLabel, setShortcutLabel] = useState('Nudge');
  const [shortcutIconPackage, setShortcutIconPackage] = useState<string | null>(null);
  const [shortcutIconLabel, setShortcutIconLabel] = useState<string | null>(null);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const discoveryService = new AppDiscoveryService();

  useEffect(() => {
    loadApps();
  }, []);

  const visibleApps = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...apps].sort((a, b) =>
      (a.label || a.packageName).localeCompare(b.label || b.packageName, undefined, {
        sensitivity: 'base',
      })
    );
    if (!q) return sorted;
    return sorted.filter(app => {
      const label = (app.label || '').toLowerCase();
      const pkg = (app.packageName || '').toLowerCase();
      return label.includes(q) || pkg.includes(q);
    });
  }, [apps, query]);

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

  const requestPinnedShortcut = async (kind: 'launch' | 'settings') => {
    if (Platform.OS !== 'android') {
      alert('Pinned shortcuts are only supported on Android.');
      return;
    }
    const api = NativeModules.NudgeShortcut;
    if (!api?.requestPinShortcut) {
      alert('Shortcuts API is not available in this build.');
      return;
    }
    const supported = await api.isPinShortcutSupported?.();
    if (supported === false) {
      alert('Your launcher does not support pinned shortcuts.');
      return;
    }
    const id = kind === 'settings' ? 'nudge.settings' : 'nudge.launch';
    const label = shortcutLabel.trim() || (kind === 'settings' ? 'Nudge Settings' : 'Nudge');
    const ok = await api.requestPinShortcut(id, label, shortcutIconPackage ?? '', kind);
    if (!ok) {
      alert('Shortcut request was not accepted.');
    } else {
      alert('Shortcut request sent. Confirm it in the system prompt.');
    }
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

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search apps…"
        autoCorrect={false}
        autoCapitalize="none"
        style={styles.searchInput}
      />

      <View style={styles.shortcutCard}>
        <Text style={styles.shortcutTitle}>Customize launcher shortcut</Text>
        <Text style={styles.shortcutHelp}>
          Android can’t change the app-drawer icon/name at runtime, but you can create a home-screen shortcut with a custom name and an icon cloned from another app.
        </Text>
        <TextInput
          value={shortcutLabel}
          onChangeText={setShortcutLabel}
          placeholder="Shortcut name"
          autoCorrect={false}
          style={styles.shortcutInput}
        />
        <TouchableOpacity style={styles.shortcutRow} onPress={() => setIconPickerOpen(true)}>
          <Text style={styles.shortcutRowLabel}>Icon source</Text>
          <Text style={styles.shortcutRowValue}>
            {shortcutIconLabel ? shortcutIconLabel : 'Use Nudge icon'}
          </Text>
        </TouchableOpacity>
        <View style={styles.shortcutButtons}>
          <TouchableOpacity style={styles.shortcutButton} onPress={() => requestPinnedShortcut('launch')}>
            <Text style={styles.shortcutButtonText}>Create “Launch” shortcut</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shortcutButton} onPress={() => requestPinnedShortcut('settings')}>
            <Text style={styles.shortcutButtonText}>Create “Settings” shortcut</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
        data={visibleApps}
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

      <Modal visible={iconPickerOpen} animationType="slide" onRequestClose={() => setIconPickerOpen(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Pick an app to clone its icon</Text>
          <TouchableOpacity
            style={styles.modalReset}
            onPress={() => {
              setShortcutIconPackage(null);
              setShortcutIconLabel(null);
              setIconPickerOpen(false);
            }}
          >
            <Text style={styles.modalResetText}>Use Nudge icon</Text>
          </TouchableOpacity>
          <FlatList
            data={visibleApps}
            keyExtractor={(item) => item.packageName}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setShortcutIconPackage(item.packageName);
                  setShortcutIconLabel(item.label);
                  setIconPickerOpen(false);
                }}
              >
                <Text style={styles.modalItemText}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.modalClose} onPress={() => setIconPickerOpen(false)}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      
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
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  shortcutCard: {
    borderWidth: 1,
    borderColor: '#e6e6e6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  shortcutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  shortcutHelp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    lineHeight: 16,
  },
  shortcutInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  shortcutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  shortcutRowLabel: {
    fontSize: 14,
    color: '#333',
  },
  shortcutRowValue: {
    fontSize: 14,
    color: '#666',
  },
  shortcutButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  shortcutButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shortcutButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
  },
  modalReset: {
    paddingVertical: 10,
    marginBottom: 10,
  },
  modalResetText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  modalClose: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#2196F3',
    fontWeight: 'bold',
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
