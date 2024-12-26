import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { useStripe } from '@/context/StripeContextProvider';
import { DropdownItem } from '@/components/dropdownComponent/DropdownItem';
import { SupportedCurrency } from '@/services/api.stripe.service';

interface AddBankModalProps {
  visible: boolean;
  onClose: () => void;
}

interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  accountType: "checking" | "savings";  
  currency: SupportedCurrency;
  country: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
}

interface DropdownOption {
  id: string;
  name: string;
}

const CURRENCIES: DropdownOption[] = [
  { id: 'USD', name: 'USD - US Dollar' },
  { id: 'EUR', name: 'EUR - Euro' },
  { id: 'GBP', name: 'GBP - British Pound' },
];

const COUNTRIES: DropdownOption[] = [
  { id: 'US', name: 'United States' },
  { id: 'GB', name: 'United Kingdom' },
  { id: 'EU', name: 'European Union' },
];

export default function AddBankModal({ visible, onClose }: AddBankModalProps) {
  const { colors } = useTheme();
  const { registerBankAccount, isLoading } = useStripe();
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountHolderName: '',
    accountNumber: '',
    routingNumber: '',
    bankName: '',
    accountType: 'checking',  
    currency: 'USD',
    country: 'US',
    city: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    phoneNumber: '',
    email: '',
  });

  const updateField = (field: keyof BankDetails, value: string) => {
    setBankDetails(prev => ({ ...prev, [field]: value }));
  };

  const getRoutingLabel = (country: string) => {
    switch (country) {
      case 'GB': return 'Sort Code';
      case 'EU': return 'IBAN';
      default: return 'Routing Number';
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields: (keyof BankDetails)[] = [
      'accountHolderName',
      'accountNumber',
      'routingNumber',
      'bankName',
      'accountType',
      'currency',
      'country',
      'city',
      'addressLine1',
      'postalCode',
      'phoneNumber',
      'email',
    ];

    const missingFields = requiredFields.filter(field => !bankDetails[field]);
    if (missingFields.length > 0) {
      Alert.alert(
        'Missing Information',
        `Please fill in the following fields: ${missingFields.join(', ')}`
      );
      return;
    }

    try {
      await registerBankAccount(bankDetails);
      Alert.alert('Success', 'Bank account added successfully');
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to add bank account');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Add Bank Account</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Bank Name</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="Enter bank name"
                placeholderTextColor={colors.textSecondary}
                value={bankDetails.bankName}
                onChangeText={(value) => updateField('bankName', value)}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Account Holder Name</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="Enter account holder name"
                placeholderTextColor={colors.textSecondary}
                value={bankDetails.accountHolderName}
                onChangeText={(value) => updateField('accountHolderName', value)}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Account Number</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="Enter account number"
                placeholderTextColor={colors.textSecondary}
                value={bankDetails.accountNumber}
                onChangeText={(value) => updateField('accountNumber', value)}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>{getRoutingLabel(bankDetails.country)}</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder={`Enter ${getRoutingLabel(bankDetails.country).toLowerCase()}`}
                placeholderTextColor={colors.textSecondary}
                value={bankDetails.routingNumber}
                onChangeText={(value) => updateField('routingNumber', value)}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Account Type</Text>
              <DropdownItem<DropdownOption>
                data={[
                  { id: 'checking', name: 'Checking' },
                  { id: 'savings', name: 'Savings' },
                ]}
                placeholder="Select account type"
                onSelect={(item) => updateField('accountType', item.id as "checking" | "savings")}
                buttonTextAfterSelection={(item) => item.name}
                rowTextForSelection={(item) => item.name}
                value={{ 
                  id: bankDetails.accountType,
                  name: bankDetails.accountType.charAt(0).toUpperCase() + bankDetails.accountType.slice(1)
                }}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Currency</Text>
              <DropdownItem<DropdownOption>
                data={CURRENCIES}
                placeholder="Select currency"
                onSelect={(currency) => updateField('currency', currency.id as SupportedCurrency)}
                buttonTextAfterSelection={(currency) => currency.name}
                rowTextForSelection={(currency) => currency.name}
                value={CURRENCIES.find(c => c.id === bankDetails.currency)}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Country</Text>
              <DropdownItem<DropdownOption>
                data={COUNTRIES}
                placeholder="Select country"
                onSelect={(country) => updateField('country', country.id)}
                buttonTextAfterSelection={(country) => country.name}
                rowTextForSelection={(country) => country.name}
                value={COUNTRIES.find(c => c.id === bankDetails.country)}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="Enter email address"
                placeholderTextColor={colors.textSecondary}
                value={bankDetails.email}
                onChangeText={(value) => updateField('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="Enter phone number"
                placeholderTextColor={colors.textSecondary}
                value={bankDetails.phoneNumber}
                onChangeText={(value) => updateField('phoneNumber', value)}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Address</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="Enter street address"
                placeholderTextColor={colors.textSecondary}
                value={bankDetails.addressLine1}
                onChangeText={(value) => updateField('addressLine1', value)}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Address Line 2 (Optional)</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="Enter apartment, suite, etc."
                placeholderTextColor={colors.textSecondary}
                value={bankDetails.addressLine2}
                onChangeText={(value) => updateField('addressLine2', value)}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>City</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="Enter city"
                placeholderTextColor={colors.textSecondary}
                value={bankDetails.city}
                onChangeText={(value) => updateField('city', value)}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>{bankDetails.country === 'US' ? 'ZIP Code' : 'Postal Code'}</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder={bankDetails.country === 'US' ? "Enter ZIP code" : "Enter postal code"}
                placeholderTextColor={colors.textSecondary}
                value={bankDetails.postalCode}
                onChangeText={(value) => updateField('postalCode', value)}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              variant="primary"
              onPress={handleSubmit}
              disabled={isLoading}
              style={styles.submitButton}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                'Add Bank Account'
              )}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    height: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  footer: {
    marginTop: 24,
  },
  submitButton: {
    marginTop: 16,
  },
});
