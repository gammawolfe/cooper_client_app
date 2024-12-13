import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { useActivity } from '@/context/ActivityContextProvider';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContextProvider';

export default function LockBlockScreen() {
  const { colors } = useTheme();
  const { unlockApp } = useActivity();
  const { user } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = () => {
    // In a real app, you would validate the PIN against a stored value
    // For now, we'll just check if it's "1234" as an example
    if (pin === '1234') {
      setError('');
      unlockApp();
    } else {
      setError('Invalid PIN');
      setPin('');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Welcome back, {user?.firstName}
      </Text>
      
      <Text style={[styles.subtitle, { color: colors.text }]}>
        Enter your PIN to continue
      </Text>

      <TextInput
        style={[styles.input, { 
          backgroundColor: colors.card,
          color: colors.text,
          borderColor: colors.border
        }]}
        value={pin}
        onChangeText={setPin}
        placeholder="Enter PIN"
        placeholderTextColor={colors.text + '80'}
        keyboardType="numeric"
        secureTextEntry
        maxLength={4}
      />

      {error ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : null}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleUnlock}
      >
        <Text style={[styles.buttonText, { color: colors.background }]}>
          Unlock
        </Text>
      </TouchableOpacity>
    </View>
  );
}

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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    opacity: 0.8,
  },
  input: {
    width: '80%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 18,
  },
  error: {
    marginBottom: 15,
    fontSize: 14,
  },
  button: {
    width: '80%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});