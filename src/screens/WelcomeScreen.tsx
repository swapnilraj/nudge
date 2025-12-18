import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  return (
    <View style={styles.container}>
      <Text variant="displaySmall" style={styles.title}>
        Welcome to Nudge
      </Text>
      <Text variant="bodyLarge" style={styles.description}>
        Nudge helps you break habitual app usage patterns by introducing weighted randomness into your app launching behavior.
      </Text>
      <Text variant="bodyMedium" style={styles.description}>
        Instead of mindlessly opening the same apps, Nudge will randomly select from your curated list based on weights you assign.
      </Text>
      <Button
        mode="contained"
        onPress={onComplete}
        style={styles.button}
      >
        Get Started
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    marginBottom: 15,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  button: {
    marginTop: 30,
    paddingHorizontal: 30,
  },
});
