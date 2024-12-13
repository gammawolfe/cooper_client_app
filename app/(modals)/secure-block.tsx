import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Image } from 'react-native';
import { useActivity } from '@/context/ActivityContextProvider';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContextProvider';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';

export default function SecureBlockScreen() {
  const { colors } = useTheme();
  const { unlockApp } = useActivity();
  const { user } = useAuth();
  const [biometricType, setBiometricType] = useState<'faceid' | 'touchid' | null>(null);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkBiometricType();
    authenticateWithBiometrics();
  }, []);

  const checkBiometricType = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        setShowPinInput(true);
        return;
      }

      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('faceid');
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('touchid');
      } else {
        setShowPinInput(true);
      }
    } catch (error) {
      console.error('Error checking biometric type:', error);
      setShowPinInput(true);
    }
  };

  const authenticateWithBiometrics = async () => {
    try {
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        setShowPinInput(true);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to continue',
        fallbackLabel: 'Use PIN instead',
        cancelLabel: 'Cancel',
        disableDeviceFallback: true, // We'll handle PIN fallback ourselves
      });

      if (result.success) {
        unlockApp();
      } else if (result.error === 'user_cancel') {
        setShowPinInput(true);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setShowPinInput(true);
    }
  };

  const handlePinSubmit = () => {
    // In a real app, validate against stored PIN
    if (pin === '1234') {
      setError('');
      unlockApp();
    } else {
      setError('Invalid PIN');
      setPin('');
    }
  };

  const retryBiometrics = () => {
    setShowPinInput(false);
    authenticateWithBiometrics();
  };

  if (showPinInput) {
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
          onPress={handlePinSubmit}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>
            Unlock
          </Text>
        </TouchableOpacity>

        {biometricType && (
          <TouchableOpacity
            style={[styles.biometricButton]}
            onPress={retryBiometrics}
          >
            <Ionicons 
              name={biometricType === 'faceid' ? 'scan-outline' : 'finger-print-outline'} 
              size={24} 
              color={colors.primary} 
            />
            <Text style={[styles.biometricText, { color: colors.primary }]}>
              Use {biometricType === 'faceid' ? 'Face ID' : 'Touch ID'} instead
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Welcome back, {user?.firstName}
      </Text>
      
      <Text style={[styles.subtitle, { color: colors.text }]}>
        Authenticate to continue
      </Text>

      <TouchableOpacity
        style={styles.biometricIcon}
        onPress={authenticateWithBiometrics}
      >
        <Ionicons 
          name={biometricType === 'faceid' ? 'scan-outline' : 'finger-print-outline'} 
          size={64} 
          color={colors.primary} 
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pinButton}
        onPress={() => setShowPinInput(true)}
      >
        <Text style={[styles.pinButtonText, { color: colors.primary }]}>
          Use PIN instead
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
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  biometricIcon: {
    padding: 20,
    marginBottom: 30,
  },
  pinButton: {
    padding: 10,
  },
  pinButtonText: {
    fontSize: 16,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
  },
  biometricText: {
    fontSize: 16,
  },
});