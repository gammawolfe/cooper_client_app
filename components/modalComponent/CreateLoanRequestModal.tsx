import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useWallet } from '@/context/WalletContextProvider';
import { useLoan } from '@/context/LoanContextProvider';
import { useContacts } from '@/context/ContactContextProvider';
import { DropdownItem } from '@/components/dropdownComponent/DropdownItem';
import { formatCurrency } from '@/utils/currency';
import { IContact } from '@/types/contact';
import { CreateLoanRequestDTO } from '@/services/api.loan.service';

interface CreateLoanRequestModalProps {
  visible: boolean;
  onClose: () => void;
}

interface DropdownOption {
  label: string;
  value: number;
}

interface WalletOption {
  _id: string;
  name: string;
  balance: number;
}

const REPAYMENT_SCHEDULES: DropdownOption[] = [
  { label: 'Weekly', value: 7 },
  { label: 'Bi-Weekly', value: 14 },
  { label: 'Monthly', value: 30 },
];

const INTEREST_RATES: DropdownOption[] = [
  { label: '5%', value: 5 },
  { label: '7%', value: 7 },
  { label: '10%', value: 10 },
  { label: '12%', value: 12 },
  { label: '15%', value: 15 },
];

const DURATIONS: DropdownOption[] = Array.from({ length: 24 }, (_, i) => ({
  label: `${i + 1} ${i === 0 ? 'month' : 'months'}`,
  value: i + 1,
}));

export default function CreateLoanRequestModal({ visible, onClose }: CreateLoanRequestModalProps) {
  const { colors } = useTheme();
  const { wallets } = useWallet();
  const { contacts } = useContacts();
  const { createLoanRequest } = useLoan();

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [interestRate, setInterestRate] = useState(5);
  const [durationInMonths, setDurationInMonths] = useState(1);
  const [repaymentScheduleInDays, setRepaymentScheduleInDays] = useState(30);
  const [recipientWalletId, setRecipientWalletId] = useState('');
  const [borrowerNotes, setBorrowerNotes] = useState('');
  const [lenderId, setLenderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const registeredContacts = contacts.filter((contact: IContact) => contact.isRegistered && contact.registeredUserId);

  const resetForm = () => {
    setAmount('');
    setCurrency('USD');
    setInterestRate(5);
    setDurationInMonths(1);
    setRepaymentScheduleInDays(30);
    setRecipientWalletId('');
    setBorrowerNotes('');
    setLenderId('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const calculateTotalRepayment = () => {
    const principal = parseFloat(amount) || 0;
    const monthlyInterestRate = interestRate / 100 / 12;
    const totalInterest = principal * monthlyInterestRate * durationInMonths;
    return principal + totalInterest;
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setLoading(true);

      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (!recipientWalletId) {
        throw new Error('Please select a recipient wallet');
      }

      if (!lenderId) {
        throw new Error('Please select a lender');
      }

      const loanRequest: CreateLoanRequestDTO = {
        amount: parseFloat(amount),
        currency,
        interestRate,
        durationInMonths,
        repaymentScheduleInDays,
        recipientWalletId,
        lenderId,
        borrowerNotes: borrowerNotes.trim(),
      };

      await createLoanRequest(loanRequest);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create loan request');
    } finally {
      setLoading(false);
    }
  };

  const totalRepayment = calculateTotalRepayment();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={[styles.content, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Request Loan</Text>
              <Text style={[styles.subtitle, { color: colors.gray }]}>
                Borrow money from friends and family
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Loan Amount Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Amount & Currency</Text>
              <View style={[styles.card, { borderColor: colors.border }]}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    placeholder="0.00"
                    placeholderTextColor={colors.gray}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Currency</Text>
                  <DropdownItem
                    data={['USD', 'EUR', 'GBP', 'CAD', 'AUD']}
                    placeholder="Select currency"
                    onSelect={setCurrency}
                    value={currency}
                    buttonTextAfterSelection={(item) => item}
                    rowTextForSelection={(item) => item}
                  />
                </View>
              </View>
            </View>

            {/* Loan Terms Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Loan Terms</Text>
              <View style={[styles.card, { borderColor: colors.border }]}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Interest Rate</Text>
                  <DropdownItem<DropdownOption>
                    data={INTEREST_RATES}
                    placeholder="Select interest rate"
                    onSelect={(item) => setInterestRate(item.value)}
                    value={INTEREST_RATES.find(rate => rate.value === interestRate)}
                    buttonTextAfterSelection={(item) => `${item.label}`}
                    rowTextForSelection={(item) => `${item.label}`}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Duration</Text>
                  <DropdownItem<DropdownOption>
                    data={DURATIONS}
                    placeholder="Select duration"
                    onSelect={(item) => setDurationInMonths(item.value)}
                    value={DURATIONS.find(d => d.value === durationInMonths)}
                    buttonTextAfterSelection={(item) => item.label}
                    rowTextForSelection={(item) => item.label}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Repayment Schedule</Text>
                  <DropdownItem<DropdownOption>
                    data={REPAYMENT_SCHEDULES}
                    placeholder="Select schedule"
                    onSelect={(item) => setRepaymentScheduleInDays(item.value)}
                    value={REPAYMENT_SCHEDULES.find(s => s.value === repaymentScheduleInDays)}
                    buttonTextAfterSelection={(item) => item.label}
                    rowTextForSelection={(item) => item.label}
                  />
                </View>
              </View>
            </View>

            {/* Lender Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Lender & Wallet</Text>
              <View style={[styles.card, { borderColor: colors.border }]}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Select Lender</Text>
                  <DropdownItem
                    data={registeredContacts}
                    placeholder="Select lender"
                    onSelect={(item: IContact) => setLenderId(item.registeredUserId!)}
                    value={registeredContacts.find(c => c.registeredUserId === lenderId)}
                    buttonTextAfterSelection={(item: IContact) => item.name}
                    rowTextForSelection={(item: IContact) => item.name}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Select Wallet</Text>
                  <DropdownItem<WalletOption>
                    data={wallets}
                    placeholder="Select wallet"
                    onSelect={(item) => setRecipientWalletId(item._id)}
                    value={wallets.find(w => w._id === recipientWalletId)}
                    buttonTextAfterSelection={(item) => `${item.name} (${formatCurrency(item.balance)})`}
                    rowTextForSelection={(item) => `${item.name} (${formatCurrency(item.balance)})`}
                  />
                </View>
              </View>
            </View>

            {/* Notes Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Additional Notes</Text>
              <View style={[styles.card, { borderColor: colors.border }]}>
                <TextInput
                  style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Add any additional notes or context for your loan request..."
                  placeholderTextColor={colors.gray}
                  value={borrowerNotes}
                  onChangeText={setBorrowerNotes}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            {/* Summary Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Loan Summary</Text>
              <View style={[styles.card, { borderColor: colors.border }]}>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.gray }]}>Loan Amount</Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {formatCurrency(parseFloat(amount) || 0)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.gray }]}>Total Repayment</Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {formatCurrency(totalRepayment)}
                  </Text>
                </View>
              </View>
            </View>

            {error ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            ) : null}

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: colors.primary },
                loading && { opacity: 0.7 }
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Creating Request...' : 'Submit Request'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
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
    height: '90%',
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
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginLeft: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  submitButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
