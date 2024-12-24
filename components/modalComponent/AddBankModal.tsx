import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { useStripe } from '@/context/StripeContextProvider';
import { DropdownItem } from '@/components/dropdownComponent/DropdownItem';
import { COUNTRIES, SUPPORTED_CURRENCIES } from '@/utilities/format';

// Filter countries to only those supported by Stripe for bank accounts
const SUPPORTED_BANK_COUNTRIES = COUNTRIES.filter(country => 
  SUPPORTED_CURRENCIES.includes(country.currency.code as typeof SUPPORTED_CURRENCIES[number])
);

interface AddBankModalProps {
  visible: boolean;
  onClose: () => void;
}

interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  sortCode: string;
  bankName: string;
  accountType: 'personal' | 'business';
  currency: string;
  country: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
  dateOfBirth?: string;
  companyName?: string;
  companyNumber?: string;
}

export default function AddBankModal({ visible, onClose }: AddBankModalProps) {
  const { colors } = useTheme();
  const { addBankAccount, isLoading } = useStripe();
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountHolderName: '',
    accountNumber: '',
    sortCode: '',
    bankName: '',
    accountType: 'personal',
    currency: 'USD',
    country: 'US',
    city: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    companyName: '',
    companyNumber: '',
  });

  const getRoutingLabel = (country: string) => {
    switch (country) {
      case 'US': return 'Routing Number';
      case 'GB': return 'Sort Code';
      case 'CA': return 'Transit Number';
      case 'AU': return 'BSB Number';
      case 'NZ': return 'Bank Code';
      case 'SG': return 'Bank Code';
      default: return 'Routing Number';
    }
  };

  const handleCountryChange = (country: typeof SUPPORTED_BANK_COUNTRIES[number]) => {
    setBankDetails(prev => ({
      ...prev,
      country: country.code,
      currency: country.currency.code,
    }));
  };

  const handleSubmit = async () => {
    if (!bankDetails.accountHolderName.trim()) {
      Alert.alert('Error', 'Please enter account holder name');
      return;
    }
    if (!bankDetails.accountNumber.trim()) {
      Alert.alert('Error', 'Please enter account number');
      return;
    }
    if (!bankDetails.sortCode.trim()) {
      Alert.alert('Error', `Please enter ${getRoutingLabel(bankDetails.country).toLowerCase()}`);
      return;
    }
    if (!bankDetails.bankName.trim()) {
      Alert.alert('Error', 'Please enter bank name');
      return;
    }
    if (!bankDetails.city.trim()) {
      Alert.alert('Error', 'Please enter city');
      return;
    }
    if (!bankDetails.addressLine1.trim()) {
      Alert.alert('Error', 'Please enter address');
      return;
    }
    if (!bankDetails.postalCode.trim()) {
      Alert.alert('Error', 'Please enter postal code');
      return;
    }
    if (!bankDetails.phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return;
    }
    if (!bankDetails.email.trim()) {
      Alert.alert('Error', 'Please enter email');
      return;
    }

    try {
      const success = await addBankAccount(bankDetails);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error adding bank:', error);
      Alert.alert('Error', 'Failed to add bank account. Please try again.');
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
              <Text style={[styles.label, { color: colors.text }]}>Country</Text>
              <DropdownItem
                data={SUPPORTED_BANK_COUNTRIES}
                placeholder="Select country"
                onSelect={handleCountryChange}
                buttonTextAfterSelection={(selectedItem) => selectedItem.name}
                rowTextForSelection={(item) => item.name}
                value={SUPPORTED_BANK_COUNTRIES.find(c => c.code === bankDetails.country)}
              />

              <View style={styles.inputContainer}>
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
                  onChangeText={(text) => setBankDetails(prev => ({ ...prev, bankName: text }))}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Account Holder Name</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                  }]}
                  placeholder="Enter full name"
                  placeholderTextColor={colors.textSecondary}
                  value={bankDetails.accountHolderName}
                  onChangeText={(text) => setBankDetails(prev => ({ ...prev, accountHolderName: text }))}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>{getRoutingLabel(bankDetails.country)}</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                  }]}
                  placeholder={`Enter ${getRoutingLabel(bankDetails.country).toLowerCase()}`}
                  placeholderTextColor={colors.textSecondary}
                  value={bankDetails.sortCode}
                  onChangeText={(text) => setBankDetails(prev => ({ ...prev, sortCode: text }))}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
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
                  onChangeText={(text) => setBankDetails(prev => ({ ...prev, accountNumber: text }))}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
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
                  onChangeText={(text) => setBankDetails(prev => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
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
                  onChangeText={(text) => setBankDetails(prev => ({ ...prev, phoneNumber: text }))}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
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
                  onChangeText={(text) => setBankDetails(prev => ({ ...prev, addressLine1: text }))}
                />
              </View>

              <View style={styles.inputContainer}>
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
                  onChangeText={(text) => setBankDetails(prev => ({ ...prev, addressLine2: text }))}
                />
              </View>

              <View style={styles.inputContainer}>
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
                  onChangeText={(text) => setBankDetails(prev => ({ ...prev, city: text }))}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {bankDetails.country === 'US' ? 'ZIP Code' : 'Postal Code'}
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                  }]}
                  placeholder={bankDetails.country === 'US' ? "Enter ZIP code" : "Enter postal code"}
                  placeholderTextColor={colors.textSecondary}
                  value={bankDetails.postalCode}
                  onChangeText={(text) => setBankDetails(prev => ({ ...prev, postalCode: text }))}
                />
              </View>
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
