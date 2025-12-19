import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface WelcomeScreenProps {
  onContinue: () => void;
}

const COLORS = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  primary: '#2563EB',
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome to Nudge</Text>
        <Text style={styles.description}>
          Nudge helps you break habitual app usage patterns by introducing weighted randomness into your app launching behavior.
        </Text>
        <Text style={styles.description}>
          Pick a list of apps and assign weights. When you open Nudge, it launches a random app based on those weights.
        </Text>
        <TouchableOpacity style={styles.button} onPress={onContinue}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.bg,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.text,
  },
  description: {
    fontSize: 16,
    marginBottom: 15,
    lineHeight: 24,
    color: COLORS.muted,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
