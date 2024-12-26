import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStripe } from '@/context/StripeContextProvider';
import { useWallet } from '@/context/WalletContextProvider';
import { DropdownItem } from '@/components/dropdownComponent/DropdownItem';
import { BankAccount, SupportedCurrency } from '@/services/api.stripe.service';
import { Wallet } from '@/services/api.wallet.service';

interface DepositModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function DepositModal({ visible, onClose }: DepositModalProps) {
  const { colors } = useTheme();
  const { createACHTransfer, presentPaymentSheet, isLoading, bankAccounts } = useStripe();
  const { wallets } = useWallet();
  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const selectedBankAccount = bankAccounts.find(account => account.id === selectedBank);
  const selectedWalletDetails = wallets.find(wallet => wallet._id === selectedWallet);

  const handleDeposit = async () => {
    if (!selectedBank || !selectedWallet) {
      Alert.alert('Error', 'Please select a bank account and wallet');
      return;
    }

    if (!selectedBankAccount || !selectedWalletDetails) {
      Alert.alert('Error', 'Invalid bank account or wallet selection');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    // Ensure currencies match
    if (selectedBankAccount.currency !== selectedWalletDetails.currency) {
      Alert.alert('Error', 'Bank account and wallet currencies must match');
      return;
    }

    try {
      // Create ACH transfer and initialize payment sheet
      await createACHTransfer({
        amount: amountValue,
        currency: selectedBankAccount.currency,
        walletId: selectedWallet,
        bankId: selectedBank
      });

      // Present the payment sheet for confirmation
      const { error } = await presentPaymentSheet();
      
      if (error) {
        throw error;
      }

      Alert.alert(
        'Success', 
        'ACH transfer initiated. The funds will be available in your wallet once the transfer is complete (typically 3-5 business days).'
      );
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to initiate transfer');
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
            <Text style={[styles.title, { color: colors.text }]}>Add Money</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {selectedWalletDetails && (
              <View style={styles.balanceContainer}>
                <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Available Balance:</Text>
                <Text style={[styles.balanceAmount, { color: colors.text }]}>
                  {selectedWalletDetails.balance.toFixed(2)} {selectedWalletDetails.currency}
                </Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>From Bank Account</Text>
              <DropdownItem<BankAccount>
                data={bankAccounts}
                placeholder="Select bank account"
                onSelect={(account) => {
                  setSelectedBank(account.id);
                  // Clear wallet selection if currency doesn't match
                  if (selectedWalletDetails && selectedWalletDetails.currency !== account.currency) {
                    setSelectedWallet(null);
                  }
                }}
                buttonTextAfterSelection={(account) => `${account.bankName} (****${account.last4}) - ${account.currency}`}
                rowTextForSelection={(account) => `${account.bankName} (****${account.last4}) - ${account.currency}`}
                value={selectedBankAccount}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>To Wallet</Text>
              <DropdownItem<Wallet>
                data={selectedBankAccount 
                  ? wallets.filter(wallet => wallet.currency === selectedBankAccount.currency)
                  : wallets
                }
                placeholder="Select wallet"
                onSelect={(wallet) => setSelectedWallet(wallet._id)}
                buttonTextAfterSelection={(wallet) => `${wallet.name} (${wallet.balance.toFixed(2)} ${wallet.currency})`}
                rowTextForSelection={(wallet) => `${wallet.name} (${wallet.balance.toFixed(2)} ${wallet.currency})`}
                value={selectedWalletDetails}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder={`Enter amount${selectedBankAccount ? ` in ${selectedBankAccount.currency}` : ''}`}
                placeholderTextColor={colors.textSecondary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>

            <TouchableOpacity
              onPress={handleDeposit}
              disabled={isLoading || !selectedBank || !selectedWallet || !amount}
              style={[
                styles.button,
                {
                  backgroundColor: (isLoading || !selectedBank || !selectedWallet || !amount) ? colors.border : colors.primary,
                  opacity: (isLoading || !selectedBank || !selectedWallet || !amount) ? 0.5 : 1
                }
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Add Money</Text>
              )}
            </TouchableOpacity>
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
  balanceContainer: {
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '600',
  },
  button: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});
