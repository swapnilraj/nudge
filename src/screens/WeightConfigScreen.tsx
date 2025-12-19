import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { WeightedApp } from '../types';

const COLORS = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  primary: '#2563EB',
};

interface WeightConfigScreenProps {
  apps: WeightedApp[];
  onWeightsChanged: (apps: WeightedApp[]) => void;
  onSave: () => void;
}

export const WeightConfigScreen: React.FC<WeightConfigScreenProps> = ({
  apps,
  onWeightsChanged,
  onSave,
}) => {
  const [weightedApps, setWeightedApps] = useState<WeightedApp[]>(
    apps.map(app => ({ ...app, weight: app.weight || 5 }))
  );

  const updateWeight = (packageName: string, weight: number) => {
    const updated = weightedApps.map(app =>
      app.packageName === packageName ? { ...app, weight } : app
    );
    setWeightedApps(updated);
    onWeightsChanged(updated);
  };

  const totalWeight = weightedApps.reduce((sum, app) => sum + app.weight, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configure Weights</Text>
      <Text style={styles.subtitle}>
        Higher weights = higher probability of being selected
      </Text>
      <FlatList
        data={weightedApps}
        keyExtractor={(item) => item.packageName}
        renderItem={({ item }) => (
          <View style={styles.weightItem}>
            <Text style={styles.appName}>{item.label}</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.weightValue}>{item.weight}</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={item.weight}
                onValueChange={(value) => updateWeight(item.packageName, value)}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={COLORS.border}
              />
            </View>
          </View>
        )}
      />
      <View style={styles.summary}>
        <Text style={styles.summaryText}>Total Weight: {totalWeight}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={onSave}>
        <Text style={styles.buttonText}>Save Configuration</Text>
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
  weightItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 10,
  },
  appName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: COLORS.text,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weightValue: {
    width: 30,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  summary: {
    padding: 15,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
