import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Nudge</Text>
      <Text style={styles.description}>
        Nudge helps you break habitual app usage patterns by introducing weighted randomness
        into your app launching behavior.
      </Text>
      <Text style={styles.description}>
        Select apps you want to be "nudged" towards and assign weights to each app.
        When you open Nudge, it will launch a random app based on those weights.
      </Text>
      <Button title="Get Started" onPress={onContinue} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24,
  },
});
