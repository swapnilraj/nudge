import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { WeightedApp } from '../types';

interface WeightConfigScreenProps {
  apps: WeightedApp[];
  onComplete: (apps: WeightedApp[]) => void;
}

export default function WeightConfigScreen({ apps, onComplete }: WeightConfigScreenProps) {
  const [weightedApps, setWeightedApps] = useState<WeightedApp[]>(apps);

  const updateWeight = (packageName: string, weight: number) => {
    setWeightedApps(prev =>
      prev.map(app =>
        app.packageName === packageName ? { ...app, weight: Math.round(weight) } : app
      )
    );
  };

  const handleSave = () => {
    // Validate that at least one app has weight > 0
    const hasValidWeight = weightedApps.some(app => app.weight > 0);
    
    if (!hasValidWeight) {
      // Show error - need at least one weight > 0
      return;
    }

    onComplete(weightedApps);
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Configure Weights
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Assign weights (1-10) to each app. Higher weights = higher probability of being selected.
      </Text>

      <ScrollView style={styles.scrollView}>
        {weightedApps.map((app) => (
          <Card key={app.packageName} style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.appName}>
                {app.label}
              </Text>
              <View style={styles.sliderContainer}>
                <Text variant="bodyMedium">Weight: {app.weight}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={app.weight}
                  onValueChange={(value) => updateWeight(app.packageName, value)}
                  minimumTrackTintColor="#6200ee"
                  maximumTrackTintColor="#ccc"
                />
                <View style={styles.sliderLabels}>
                  <Text variant="bodySmall">1</Text>
                  <Text variant="bodySmall">10</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <Button
        mode="contained"
        onPress={handleSave}
        style={styles.button}
      >
        Save & Launch
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    marginBottom: 16,
  },
  appName: {
    marginBottom: 12,
  },
  sliderContainer: {
    marginTop: 8,
  },
  slider: {
    width: '100%',
    height: 40,
    marginVertical: 8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
});
