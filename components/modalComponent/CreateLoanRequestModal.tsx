import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useWallet } from '@/context/WalletContextProvider';
import { useContacts } from '@/context/ContactContextProvider';
import { IContact } from '@/types/contact';
import { CreateLoanRequestDTO } from '@/services/api.loan.service';
import { DropdownItem } from '@/components/dropdownComponent/DropdownItem';
import { useAuth } from '@/context/AuthContextProvider';

const DURATIONS = ['1', '3', '6', '12', '24', '36'];
const INTEREST_RATES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '12', '15', '18', '20'];

interface CreateLoanRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLoanRequestDTO) => Promise<any>;
}

export default function CreateLoanRequestModal({
  visible,
  onClose,
  onSubmit,
}: CreateLoanRequestModalProps) {
  const { colors } = useTheme();
  const { contacts } = useContacts();
  const { user } = useAuth();
  const { wallets } = useWallet();
  const [amount, setAmount] = useState('');
  const [selectedContact, setSelectedContact] = useState<IContact | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [description, setDescription] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter to show only registered contacts, excluding the current user
  const filteredContacts = contacts.filter(contact => 
    contact.isRegistered && contact.registeredUserId !== user?._id
  );

  // Calculate loan breakdown
  const calculateLoanBreakdown = () => {
    if (!amount || !interestRate || !duration) return null;

    const principal = parseFloat(amount);
    const annualRate = parseFloat(interestRate);
    const months = parseInt(duration);
    const repaymentScheduleInDays = 30; // Monthly payments
    
    // Calculate total repayment amount (matching backend calculation)
    const totalRepaymentAmount = principal + (principal * annualRate) / 100;
    
    // Calculate number of payments (matching backend calculation)
    const totalIntervals = Math.floor((months * 30) / repaymentScheduleInDays);
    
    // Calculate payment per interval (matching backend calculation)
    const paybackAmountPerInterval = Math.round((totalRepaymentAmount / totalIntervals) * 100) / 100;
    
    // Recalculate total amount based on rounded payments
    const actualTotalAmount = paybackAmountPerInterval * totalIntervals;
    
    // Calculate total interest
    const totalInterest = actualTotalAmount - principal;

    return {
      monthlyPayment: paybackAmountPerInterval.toFixed(2),
      totalAmount: actualTotalAmount.toFixed(2),
      totalInterest: totalInterest.toFixed(2)
    };
  };

  const loanBreakdown = calculateLoanBreakdown();

  const validateForm = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount greater than 0');
      return false;
    }

    if (!selectedContact?.registeredUserId) {
      Alert.alert('Error', 'Please select a valid registered contact');
      return false;
    }

    if (!selectedWallet) {
      Alert.alert('Error', 'Please select a wallet to receive the loan');
      return false;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }

    if (!interestRate || isNaN(parseFloat(interestRate)) || parseFloat(interestRate) < 0) {
      Alert.alert('Error', 'Please select a valid interest rate');
      return false;
    }

    if (!duration || isNaN(parseInt(duration)) || parseInt(duration) <= 0) {
      Alert.alert('Error', 'Please select a valid duration');
      return false;
    }

    // Validate repayment schedule
    const repaymentScheduleInDays = 30; // Monthly payments
    const durationInMonths = parseInt(duration);
    if (repaymentScheduleInDays > durationInMonths * 30) {
      Alert.alert('Error', 'Repayment schedule cannot be longer than loan duration');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const loanRequestData: CreateLoanRequestDTO = {
        amount: parseFloat(amount),
        currency: 'USD',
        lenderId: selectedContact!.registeredUserId!,
        borrowerNotes: description.trim(),
        interestRate: parseFloat(interestRate),
        durationInMonths: parseInt(duration),
        repaymentScheduleInDays: 30, // Monthly repayment schedule
        recipientWalletId: selectedWallet,
      };

      const response = await onSubmit(loanRequestData);
      
      // Only show success if we get a 201 response with success: true
      if (response?.success) {
        Alert.alert(
          'Success',
          'Your loan request has been created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form and close modal
                setAmount('');
                setSelectedContact(null);
                setSelectedWallet('');
                setDescription('');
                setInterestRate('');
                setDuration('');
                onClose();
              }
            }
          ]
        );
      }
    } catch (err: any) {
      console.error('Failed to create loan request:', err);
      setError(err?.message || 'Failed to create loan request. Please try again.');
      Alert.alert('Error', err?.message || 'Failed to create loan request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={[styles.content, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>
                Create New Loan Request
              </Text>
              <Text style={[styles.subtitle, { color: colors.text + '80' }]}>
                Set up your loan request details
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Enter amount"
                  placeholderTextColor={colors.text + '80'}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Contact</Text>
                <DropdownItem<IContact>
                  data={filteredContacts}
                  placeholder="Select contact"
                  value={selectedContact || undefined}
                  onSelect={(selectedItem) => setSelectedContact(selectedItem)}
                  buttonTextAfterSelection={(selectedItem) => selectedItem.name}
                  rowTextForSelection={(item) => item.name}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Receiving Wallet</Text>
                <DropdownItem<string>
                  data={wallets.map(w => w._id)}
                  placeholder="Select wallet"
                  value={selectedWallet || undefined}
                  onSelect={(selectedItem) => setSelectedWallet(selectedItem)}
                  buttonTextAfterSelection={(selectedItem) => 
                    wallets.find(w => w._id === selectedItem)?.name || selectedItem
                  }
                  rowTextForSelection={(item) => 
                    wallets.find(w => w._id === item)?.name || item
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Description</Text>
                <TextInput
                  style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Enter description"
                  placeholderTextColor={colors.text + '80'}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Loan Terms</Text>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Interest Rate</Text>
                <DropdownItem<string>
                  data={INTEREST_RATES}
                  placeholder="Select interest rate (%)"
                  value={interestRate}
                  onSelect={(selectedItem) => setInterestRate(selectedItem)}
                  buttonTextAfterSelection={(selectedItem) => `${selectedItem}%`}
                  rowTextForSelection={(item) => `${item}%`}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Duration</Text>
                <DropdownItem<string>
                  data={DURATIONS}
                  placeholder="Select duration (months)"
                  value={duration}
                  onSelect={(selectedItem) => setDuration(selectedItem)}
                  buttonTextAfterSelection={(selectedItem) => `${selectedItem} months`}
                  rowTextForSelection={(item) => `${item} months`}
                />
              </View>
            </View>

            {loanBreakdown && (
              <View style={[styles.breakdownContainer, { backgroundColor: colors.card }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Loan Breakdown</Text>
                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownLabel, { color: colors.text }]}>Monthly Payment:</Text>
                  <Text style={[styles.breakdownValue, { color: colors.text }]}>${loanBreakdown.monthlyPayment}</Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownLabel, { color: colors.text }]}>Total Interest:</Text>
                  <Text style={[styles.breakdownValue, { color: colors.text }]}>${loanBreakdown.totalInterest}</Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownLabel, { color: colors.text }]}>Total Amount to Repay:</Text>
                  <Text style={[styles.breakdownValue, { color: colors.text }]}>${loanBreakdown.totalAmount}</Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: colors.primary },
                loading && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Creating...' : 'Create Request'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  form: {
    flex: 1,
  },
  formContent: {
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 48,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 100,
  },
  footer: {
    marginTop: 'auto',
  },
  submitButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  breakdownContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
