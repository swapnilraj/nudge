import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { WeightedApp } from '../types';

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
                minimumTrackTintColor="#2196F3"
                maximumTrackTintColor="#ddd"
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
  weightItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  appName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
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
  },
  slider: {
    flex: 1,
    height: 40,
  },
  summary: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    marginTop: 10,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
