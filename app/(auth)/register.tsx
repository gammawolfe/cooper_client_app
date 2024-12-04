import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView, SafeAreaView } from 'react-native';
import { Stack, router } from 'expo-router';
import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContextProvider';
import { DropdownItem } from '@/components/dropdownComponent/DropdownItem';
import { COUNTRIES } from '@/utilities/format';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface PasswordRule {
  regex: RegExp;
  message: string;
}

const PASSWORD_RULES: PasswordRule[] = [
  { regex: /.{8,}/, message: 'At least 8 characters long' },
  { regex: /[A-Z]/, message: 'One uppercase letter' },
  { regex: /[a-z]/, message: 'One lowercase letter' },
  { regex: /[0-9]/, message: 'One number' },
  { regex: /[@$!%*?&]/, message: 'One special character (@$!%*?&)' },
];

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [country, setCountry] = useState('');

  const passwordValidation = useMemo(() => {
    return PASSWORD_RULES.map(rule => ({
      ...rule,
      isValid: rule.regex.test(password),
    }));
  }, [password]);

  const isPasswordValid = passwordValidation.every(rule => rule.isValid);
  const doPasswordsMatch = password === confirmPassword && confirmPassword !== '';

  const handleRegister = async () => {
    try {
      // Validate required inputs
      if (!firstName || !lastName || !email || !mobile || !password || !confirmPassword ||
          !addressLine1 || !city || !country) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      if (!isPasswordValid) {
        Alert.alert('Error', 'Please ensure your password meets all requirements');
        return;
      }

      if (!doPasswordsMatch) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      
      // Attempt registration using AuthContext
      await register(
        firstName,
        lastName,
        email,
        mobile,
        password,
        addressLine1,
        addressLine2,
        city,
        postcode,
        country
      );
      
      // Note: No need to handle navigation here as AuthContext will handle it
    } catch (error) {
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Stack.Screen options={{ 
          headerTitle: 'Register',
          headerStyle: { backgroundColor: '#fff' },
          headerShadowVisible: false,
        }} />

        <ScrollView style={styles.scrollView}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Account</Text>
            
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <TextInput
              style={styles.input}
              placeholder="First Name *"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />

            <TextInput
              style={styles.input}
              placeholder="Last Name *"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />

            <TextInput
              style={styles.input}
              placeholder="Email *"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="Mobile Number *"
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
            />

            <Text style={styles.sectionTitle}>Address</Text>

            <TextInput
              style={styles.input}
              placeholder="Address Line 1 *"
              value={addressLine1}
              onChangeText={setAddressLine1}
            />

            <TextInput
              style={styles.input}
              placeholder="Address Line 2 (Optional)"
              value={addressLine2}
              onChangeText={setAddressLine2}
            />

            <TextInput
              style={styles.input}
              placeholder="City *"
              value={city}
              onChangeText={setCity}
            />

            <TextInput
              style={styles.input}
              placeholder="Postcode (Optional)"
              value={postcode}
              onChangeText={setPostcode}
            />

            <DropdownItem<string>
              data={COUNTRIES.map(country => country.name)}
              placeholder="Select Country *"
              value={country}
              onSelect={(selectedItem) => setCountry(selectedItem)}
              buttonTextAfterSelection={(selectedItem) => selectedItem}
              rowTextForSelection={(item) => item}
            />

            <Text style={styles.sectionTitle}>Security</Text>

            <TextInput
              style={styles.input}
              placeholder="Password *"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <View style={styles.passwordRules}>
              {passwordValidation.map((rule, index) => (
                <View key={index} style={styles.passwordRule}>
                  <MaterialIcons
                    name={rule.isValid ? 'check-circle' : 'cancel'}
                    size={16}
                    color={rule.isValid ? '#4CAF50' : '#FF5252'}
                    style={styles.ruleIcon}
                  />
                  <Text style={[
                    styles.ruleText,
                    { color: rule.isValid ? '#4CAF50' : '#FF5252' }
                  ]}>
                    {rule.message}
                  </Text>
                </View>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Confirm Password *"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            {confirmPassword !== '' && (
              <View style={styles.passwordRule}>
                <MaterialIcons
                  name={doPasswordsMatch ? 'check-circle' : 'cancel'}
                  size={16}
                  color={doPasswordsMatch ? '#4CAF50' : '#FF5252'}
                  style={styles.ruleIcon}
                />
                <Text style={[
                  styles.ruleText,
                  { color: doPasswordsMatch ? '#4CAF50' : '#FF5252' }
                ]}>
                  Passwords match
                </Text>
              </View>
            )}

            <TouchableOpacity 
              style={[
                styles.button,
                (!isPasswordValid || !doPasswordsMatch || isLoading) && styles.buttonDisabled
              ]}
              onPress={handleRegister}
              disabled={!isPasswordValid || !doPasswordsMatch || isLoading || !firstName || !lastName || !email || !mobile || !password || !confirmPassword || !addressLine1 || !city || !country}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => router.replace('/login')}
            >
              <Text style={styles.linkText}>Already have an account? Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 15,
    color: '#666',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  passwordRules: {
    marginTop: -8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  passwordRule: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  ruleIcon: {
    marginRight: 8,
  },
  ruleText: {
    fontSize: 12,
  },
  button: {
    backgroundColor: Colors.light.tint,
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 15,
  },
  linkText: {
    color: Colors.light.tint,
    textAlign: 'center',
    fontSize: 16,
  },
});