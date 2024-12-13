import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useWallet } from '@/context/WalletContextProvider';
import { formatCurrency } from '@/utilities/format';
import { DropdownItem } from '@/components/dropdownComponent/DropdownItem';

interface CreateLoanPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (paymentData: { amount: number; walletId: string; note?: string }) => Promise<void>;
  loanAmount: number;
  remainingAmount: number;
  currency: string;
  nextPaymentAmount: number;
}

export default function CreateLoanPaymentModal({
  visible,
  onClose,
  onSubmit,
  loanAmount,
  remainingAmount,
  currency,
  nextPaymentAmount,
}: CreateLoanPaymentModalProps) {
  const { colors } = useTheme();
  const { wallets } = useWallet();
  
  const [amount, setAmount] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      // Reset form when modal opens
      setAmount('');
      setSelectedWalletId('');
      setNote('');
      setIsSubmitting(false);
      
      // Set default wallet if available
      if (wallets.length > 0) {
        setSelectedWalletId(wallets[0]._id);
      }
    }
  }, [visible, wallets]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Validate amount matches next payment
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount !== nextPaymentAmount) {
      Alert.alert('Invalid Amount', `Payment amount must be exactly ${formatCurrency(nextPaymentAmount, currency)}`);
      return;
    }

    // Validate wallet selection
    if (!selectedWalletId) {
      Alert.alert('Wallet Required', 'Please select a wallet for payment');
      return;
    }

    // Validate wallet balance
    const selectedWallet = wallets.find(w => w._id === selectedWalletId);
    if (!selectedWallet || selectedWallet.balance < numericAmount) {
      Alert.alert('Insufficient Balance', 'Selected wallet has insufficient funds');
      return;
    }

    // Validate wallet currency matches loan currency
    if (selectedWallet.currency !== currency) {
      Alert.alert('Invalid Wallet', `Please select a wallet with ${currency} currency`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        amount: numericAmount,
        walletId: selectedWalletId,
        note: note.trim() || undefined,
      });
      onClose();
    } catch (error: any) {
      console.error('Failed to make payment:', error);
      Alert.alert('Error', error?.message || 'Failed to process payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.container, { backgroundColor: colors.card }]}
          >
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Make Payment</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={[styles.closeButton, { color: colors.text }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <View style={styles.infoContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Next Payment Due</Text>
                <Text style={[styles.remainingAmount, { color: colors.text }]}>
                  {formatCurrency(nextPaymentAmount, currency)}
                </Text>
                <Text style={[styles.remainingText, { color: colors.text + '80' }]}>
                  Remaining Balance: {formatCurrency(remainingAmount, currency)}
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Payment Amount</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: colors.border,
                    }
                  ]}
                  placeholder="Enter amount"
                  placeholderTextColor={colors.text + '80'}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                  editable={false}
                  defaultValue={nextPaymentAmount.toString()}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Select Wallet</Text>
                <DropdownItem
                  data={wallets.map(w => w._id)}
                  placeholder="Choose wallet"
                  value={selectedWalletId}
                  onSelect={(id) => setSelectedWalletId(id)}
                  buttonTextAfterSelection={(id) => {
                    const wallet = wallets.find(w => w._id === id);
                    return wallet ? `${wallet.name} (${formatCurrency(wallet.balance, wallet.currency)})` : '';
                  }}
                  rowTextForSelection={(id) => {
                    const wallet = wallets.find(w => w._id === id);
                    return wallet ? `${wallet.name} (${formatCurrency(wallet.balance, wallet.currency)})` : '';
                  }}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Note (Optional)</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.noteInput,
                    { 
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: colors.border,
                    }
                  ]}
                  placeholder="Add a note"
                  placeholderTextColor={colors.text + '80'}
                  multiline
                  value={note}
                  onChangeText={setNote}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: colors.primary,
                  opacity: isSubmitting ? 0.7 : 1,
                }
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={[styles.submitButtonText, { color: colors.card }]}>
                {isSubmitting ? 'Processing...' : 'Submit Payment'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
  },
  container: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
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
    fontSize: 24,
    fontWeight: '400',
    padding: 4,
  },
  content: {
    gap: 16,
  },
  infoContainer: {
    marginBottom: 8,
  },
  remainingAmount: {
    fontSize: 24,
    fontWeight: '600',
  },
  remainingText: {
    fontSize: 14,
    marginTop: 4,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  noteInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
