import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppInfo } from '../types';
import { AppDiscoveryService } from '../services/AppDiscoveryService';

const COLORS = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  primary: '#2563EB',
  primaryMuted: '#93C5FD',
  placeholder: '#94A3B8',
};

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
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(
    new Set(selectedApps.map(app => app.packageName))
  );
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
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading installed apps...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Apps</Text>
      <Text style={styles.subtitle}>
        Choose apps you want to be nudged towards ({selected.size} selected)
      </Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search apps…"
        placeholderTextColor={COLORS.placeholder}
        autoCorrect={false}
        autoCapitalize="none"
        style={styles.searchInput}
      />
      <FlatList
        data={visibleApps}
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
    backgroundColor: COLORS.bg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: COLORS.muted,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: COLORS.card,
    color: COLORS.text,
  },
  appItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  appItemSelected: {
    backgroundColor: '#DBEAFE',
  },
  appName: {
    fontSize: 16,
    color: COLORS.text,
  },
  checkbox: {
    fontSize: 20,
    color: COLORS.primary,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: COLORS.primaryMuted,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.muted,
  },
});
