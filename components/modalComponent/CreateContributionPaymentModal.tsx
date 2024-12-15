import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useWallet } from '@/context/WalletContextProvider';
import { formatCurrency } from '@/utilities/format';
import { DropdownItem } from '@/components/dropdownComponent/DropdownItem';

interface CreateContributionPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (paymentData: { amount: number; walletId: string }) => Promise<boolean>;
  contributionAmount: number;
  currency: string;
}

export default function CreateContributionPaymentModal({
  visible,
  onClose,
  onSubmit,
  contributionAmount,
  currency,
}: CreateContributionPaymentModalProps) {
  const { colors } = useTheme();
  const { wallets } = useWallet();
  
  const [amount, setAmount] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      // Reset form when modal opens
      setAmount('');
      setSelectedWalletId('');
      setLoading(false);
      
      // Set default wallet if available with matching currency
      const defaultWallet = wallets.find(w => w.currency === currency);
      if (defaultWallet) {
        setSelectedWalletId(defaultWallet._id);
      }
    }
  }, [visible, wallets, currency]);

  const handleAmountChange = (text: string) => {
    // Only allow numbers and decimal point
    const sanitizedText = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = sanitizedText.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    
    setAmount(sanitizedText);
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (numericAmount !== contributionAmount) {
      Alert.alert(
        'Invalid Amount',
        `Please enter the exact contribution amount: ${formatCurrency(contributionAmount, currency)}`
      );
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

    // Validate wallet currency matches contribution currency
    if (selectedWallet.currency !== currency) {
      Alert.alert('Invalid Wallet', `Please select a wallet with ${currency} currency`);
      return;
    }

    setLoading(true);
    try {
      const success = await onSubmit({ 
        amount: numericAmount,
        walletId: selectedWalletId
      });

      if (success) {
        Alert.alert(
          'Success',
          'Your contribution payment has been processed successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                setAmount('');
                setSelectedWalletId('');
                onClose();
              }
            }
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message || 'Failed to process payment. Please try again.'
      );
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
                Make Contribution Payment
              </Text>
              <Text style={[styles.subtitle, { color: colors.text + '80' }]}>
                Pay your contribution for this cycle
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Details</Text>
              
              <View style={styles.amountPreview}>
                <Text style={[styles.label, { color: colors.text }]}>Required Amount</Text>
                <Text style={[styles.requiredAmount, { color: colors.primary }]}>
                  {formatCurrency(contributionAmount, currency)}
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Select Wallet</Text>
                <DropdownItem
                  data={wallets
                    .filter(w => w.currency === currency)
                    .map(w => w._id)}
                  placeholder="Select a wallet"
                  value={selectedWalletId}
                  onSelect={setSelectedWalletId}
                  buttonTextAfterSelection={(id) => {
                    const wallet = wallets.find(w => w._id === id);
                    return wallet ? `${wallet.name} (${formatCurrency(wallet.balance, wallet.currency)})` : 'Select a wallet';
                  }}
                  rowTextForSelection={(id) => {
                    const wallet = wallets.find(w => w._id === id);
                    return wallet ? `${wallet.name} (${formatCurrency(wallet.balance, wallet.currency)})` : 'Select a wallet';
                  }}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder={`Enter amount in ${currency}`}
                  placeholderTextColor={colors.text + '80'}
                  value={amount}
                  onChangeText={handleAmountChange}
                  keyboardType="decimal-pad"
                  autoFocus
                />
              </View>
            </View>

            <View style={styles.footer}>
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
                  {loading ? 'Processing...' : 'Make Payment'}
                </Text>
              </TouchableOpacity>
            </View>
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
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  amountPreview: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  requiredAmount: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 4,
  },
  footer: {
    marginTop: 'auto',
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
