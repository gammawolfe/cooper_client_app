import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { useActivity } from '@/context/ActivityContextProvider';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContextProvider';
import * as LocalAuthentication from 'expo-local-authentication';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Keypad from '@/components/securityComponent/Keypad';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function AuthScreen() {
  const { colors } = useTheme();
  const { unlockApp } = useActivity();
  const { user } = useAuth();
  const [biometricType, setBiometricType] = useState<'faceid' | 'touchid' | null>(null);
  const [showPinInput, setShowPinInput] = useState(false); 
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    checkBiometricType();
  }, []);

  const checkBiometricType = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        setShowPinInput(true);
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        setShowPinInput(true);
        return;
      }

      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const hasFaceId = supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
      const hasFingerprint = supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);

      if (hasFaceId) {
        setBiometricType('faceid');
      } else if (hasFingerprint) {
        setBiometricType('touchid');
      } else {
        setShowPinInput(true);
        return;
      }

      setShowPinInput(false);
      authenticateWithBiometrics();
    } catch (error) {
      console.error('Error checking biometric type:', error);
      setShowPinInput(true);
    }
  };

  const getBiometricConfig = () => {
    if (Platform.OS === 'ios') {
      return {
        promptMessage: 'Authenticate to continue',
        fallbackLabel: 'Use PIN',
        cancelLabel: 'Cancel',
      };
    }
    return {
      promptMessage: 'Authenticate to continue',
      cancelLabel: 'Cancel',
      disableDeviceFallback: true, 
    };
  };

  const authenticateWithBiometrics = async () => {
    if (isAuthenticating) return;
    
    try {
      setIsAuthenticating(true);
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        setShowPinInput(true);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync(getBiometricConfig());

      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        unlockApp();
      } else if (result.error === 'user_cancel') {
        setShowPinInput(true);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(Platform.select({
          ios: 'Authentication failed. Please try again or use PIN.',
          android: 'Authentication failed. Please try again.',
          default: 'Authentication failed. Please try again.',
        }));
        if (Platform.OS === 'android') {
          setShowPinInput(true);
        }
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      setShowPinInput(true);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleKeyPress = async (key: string) => {
    await Haptics.selectionAsync();
    if (pin.length < 4) {
      setPin(prev => prev + key);
      setError('');
    }
  };

  const handleDelete = async () => {
    await Haptics.selectionAsync();
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleSubmit = async () => {
    if (pin.length === 4) {
      await Haptics.selectionAsync();
      if (pin === '1234') { 
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        unlockApp();
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError('Invalid PIN');
        setPin('');
      }
    }
  };

  const getBiometricIcon = (): 'face-recognition' | 'fingerprint' => {
    if (biometricType === 'faceid') {
      return 'face-recognition';
    }
    return 'fingerprint';
  };

  return (
    <LinearGradient
      colors={['#701EC2', '#9B4BEA', '#06D6A0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Welcome back{user && user.firstName ? `, ${user.firstName}` : ''}
            </Text>
            <Text style={styles.subtitle}>
              Enter your PIN to continue
            </Text>
          </View>

          <View style={styles.pinContainer}>
            {[...Array(4)].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.pinDot,
                  { 
                    backgroundColor: index < pin.length ? '#fff' : 'transparent',
                    borderColor: '#fff' 
                  }
                ]}
              />
            ))}
          </View>
          {error ? (
            <Text style={[styles.errorText, { color: '#FF6B6B' }]}>{error}</Text>
          ) : null}

          <Keypad 
            onKeyPress={handleKeyPress} 
            onDelete={handleDelete} 
            onSubmit={handleSubmit}
            disabled={pin.length === 4}
          />

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]} />
            <Text style={styles.dividerText}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]} />
          </View>

          <TouchableOpacity
            style={styles.biometricIconButton}
            onPress={async () => {
              const hasHardware = await LocalAuthentication.hasHardwareAsync();
              const isEnrolled = await LocalAuthentication.isEnrolledAsync();
              
              if (!hasHardware || !isEnrolled) {
                setError('Biometric authentication not available');
                return;
              }
              
              authenticateWithBiometrics();
            }}
            disabled={isAuthenticating}
          >
            <MaterialCommunityIcons
              name={biometricType === 'faceid' ? 'face-recognition' : 'fingerprint'}
              size={32}
              color="#fff"
            />
            <Text style={styles.biometricButtonText}>
              {biometricType === 'faceid' ? 'Face ID' : 'Touch ID'}
            </Text>
          </TouchableOpacity>

          {!showPinInput && biometricType && (
            <TouchableOpacity
              style={styles.alternativeButton}
              onPress={() => setShowPinInput(true)}
            >
              <Text style={[styles.alternativeText, { color: '#fff' }]}>
                Use PIN instead
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 8,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 14,
    textAlign: 'center',
    color: '#FF6B6B',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  biometricIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  biometricButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  alternativeButton: {
    padding: 16,
  },
  alternativeText: {
    fontSize: 16,
  },
});
