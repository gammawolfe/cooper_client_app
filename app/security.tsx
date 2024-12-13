import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Stack } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const SECURITY_SETTINGS_KEY = '@security_settings';
const PIN_KEY = '@security_pin';

interface SecuritySettings {
  useBiometrics: boolean;
  usePin: boolean;
}

export default function SecurityScreen() {
  const { colors } = useTheme();
  const [settings, setSettings] = useState<SecuritySettings>({
    useBiometrics: false,
    usePin: false,
  });
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<'faceid' | 'touchid' | null>(null);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
    loadSecuritySettings();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricsAvailable(hasHardware && isEnrolled);

      if (hasHardware) {
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('faceid');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('touchid');
        }
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
    }
  };

  const loadSecuritySettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SECURITY_SETTINGS_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  };

  const saveSecuritySettings = async (newSettings: SecuritySettings) => {
    try {
      await AsyncStorage.setItem(SECURITY_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving security settings:', error);
    }
  };

  const handleBiometricsToggle = async () => {
    if (!settings.useBiometrics) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to enable biometric login',
        });
        if (result.success) {
          saveSecuritySettings({ ...settings, useBiometrics: true });
        }
      } catch (error) {
        console.error('Error during biometric authentication:', error);
      }
    } else {
      saveSecuritySettings({ ...settings, useBiometrics: false });
    }
  };

  const handlePinToggle = () => {
    if (!settings.usePin) {
      setShowPinSetup(true);
    } else {
      Alert.alert(
        'Disable PIN',
        'Are you sure you want to disable PIN authentication?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Disable', 
            style: 'destructive',
            onPress: async () => {
              await AsyncStorage.removeItem(PIN_KEY);
              saveSecuritySettings({ ...settings, usePin: false });
            }
          },
        ]
      );
    }
  };

  const handlePinSetup = async () => {
    if (pin.length !== 4) {
      Alert.alert('Invalid PIN', 'PIN must be 4 digits');
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('PIN Mismatch', 'PINs do not match');
      return;
    }

    try {
      await AsyncStorage.setItem(PIN_KEY, pin);
      saveSecuritySettings({ ...settings, usePin: true });
      setShowPinSetup(false);
      setPin('');
      setConfirmPin('');
      Alert.alert('Success', 'PIN has been set successfully');
    } catch (error) {
      console.error('Error saving PIN:', error);
      Alert.alert('Error', 'Failed to save PIN');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Security Settings',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Authentication</Text>
        
        {biometricsAvailable && (
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons
                name={biometricType === 'faceid' ? 'scan' : 'finger-print'}
                size={24}
                color={colors.text}
                style={styles.icon}
              />
              <Text style={[styles.settingText, { color: colors.text }]}>
                {biometricType === 'faceid' ? 'Face ID' : 'Touch ID'}
              </Text>
            </View>
            <Switch
              value={settings.useBiometrics}
              onValueChange={handleBiometricsToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        )}

        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingLeft}>
            <Ionicons name="key-outline" size={24} color={colors.text} style={styles.icon} />
            <Text style={[styles.settingText, { color: colors.text }]}>PIN Lock</Text>
          </View>
          <Switch
            value={settings.usePin}
            onValueChange={handlePinToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>

      {showPinSetup && (
        <View style={[styles.pinSetupContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.pinSetupTitle, { color: colors.text }]}>Set Up PIN</Text>
          
          <TextInput
            style={[styles.pinInput, { backgroundColor: colors.background, color: colors.text }]}
            value={pin}
            onChangeText={setPin}
            placeholder="Enter 4-digit PIN"
            placeholderTextColor={colors.text + '80'}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
          />
          
          <TextInput
            style={[styles.pinInput, { backgroundColor: colors.background, color: colors.text }]}
            value={confirmPin}
            onChangeText={setConfirmPin}
            placeholder="Confirm PIN"
            placeholderTextColor={colors.text + '80'}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
          />

          <View style={styles.pinButtonsContainer}>
            <TouchableOpacity
              style={[styles.pinButton, { backgroundColor: colors.border }]}
              onPress={() => {
                setShowPinSetup(false);
                setPin('');
                setConfirmPin('');
              }}
            >
              <Text style={[styles.pinButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.pinButton, { backgroundColor: colors.primary }]}
              onPress={handlePinSetup}
            >
              <Text style={[styles.pinButtonText, { color: colors.background }]}>Set PIN</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
  },
  icon: {
    marginRight: 12,
  },
  pinSetupContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  pinSetupTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  pinInput: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
  },
  pinButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  pinButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  pinButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});