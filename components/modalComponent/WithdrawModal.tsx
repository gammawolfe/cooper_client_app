import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Alert, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStripe } from '@/context/StripeContextProvider';
import { SupportedCurrency } from '@/services/api.stripe.service';
import { DropdownItem } from '@/components/dropdownComponent/DropdownItem';
import { BankAccount } from '@/services/api.stripe.service';
import { useWallet } from '@/context/WalletContextProvider';
import { Wallet } from '@/services/api.wallet.service';

interface WithdrawModalProps {
  visible: boolean;
  onClose: () => void;
  defaultWallet: Wallet | null;
}

export default function WithdrawModal({ visible, onClose, defaultWallet }: WithdrawModalProps) {
  const { colors } = useTheme();
  const { createACHBankWithdrawal, presentPaymentSheet, getBankAccountByCurrency, isLoading, bankAccounts } = useStripe();
  const { wallets } = useWallet();
  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(defaultWallet?._id || null);
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>(defaultWallet?.currency as SupportedCurrency || 'USD');

  const selectedWalletDetails = wallets.find(w => w._id === selectedWallet);

  if (!defaultWallet) {
    return null;
  }

  useEffect(() => {
    const fetchBankAccount = async () => {
      try {
        const bankAccount = await getBankAccountByCurrency(selectedCurrency);
        if (bankAccount) {
          setSelectedBank(bankAccount.id);
        } else {
          setSelectedBank(null);
        }
      } catch (error) {
        console.error('Error fetching bank account:', error);
        setSelectedBank(null);
      }
    };

    fetchBankAccount();
  }, [selectedCurrency]);

  const handleWithdraw = async () => {
    try {
      if (!selectedWallet || !selectedWalletDetails) {
        Alert.alert('Error', 'Please select a wallet');
        return;
      }

      if (!amount || isNaN(Number(amount))) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }

      if (!selectedBank) {
        Alert.alert('Error', 'Please select a bank account');
        return;
      }

      const numAmount = Number(amount);
      if (numAmount <= 0) {
        Alert.alert('Error', 'Amount must be greater than 0');
        return;
      }

      if (numAmount > selectedWalletDetails.balance) {
        Alert.alert('Error', 'Insufficient funds');
        return;
      }

      // Initialize payment sheet
      const { error: initError } = await presentPaymentSheet();
      if (initError) {
        Alert.alert('Error', initError.message);
        return;
      }

      // Create withdrawal
      await createACHBankWithdrawal({
        amount: numAmount,
        currency: selectedCurrency,
        walletId: selectedWallet,
        bankId: selectedBank
      });

      onClose();
    } catch (error) {
      console.error('Withdrawal error:', error);
      Alert.alert('Error', 'Failed to process withdrawal');
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
            <Text style={[styles.title, { color: colors.text }]}>Withdraw Funds</Text>
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
              <Text style={[styles.label, { color: colors.text }]}>Select Wallet</Text>
              <DropdownItem<Wallet>
                data={wallets.map(wallet => ({
                  ...wallet,
                  currency: wallet.currency as SupportedCurrency
                }))}
                placeholder="Select wallet"
                onSelect={(wallet) => {
                  if (wallet) {
                    setSelectedWallet(wallet._id);
                    setSelectedCurrency(wallet.currency as SupportedCurrency);
                    setSelectedBank(null);
                  }
                }}
                buttonTextAfterSelection={(wallet) => {
                  if (!wallet) return 'Select wallet';
                  return `${wallet.name} (${wallet.balance.toFixed(2)} ${wallet.currency})`;
                }}
                rowTextForSelection={(wallet) => {
                  if (!wallet) return 'Select wallet';
                  return `${wallet.name} (${wallet.balance.toFixed(2)} ${wallet.currency})`;
                }}
                value={selectedWalletDetails ? {
                  ...selectedWalletDetails,
                  currency: selectedWalletDetails.currency as SupportedCurrency
                } : undefined}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Currency</Text>
              <DropdownItem<{ id: SupportedCurrency; name: string }>
                data={[{ id: 'USD', name: 'USD' }, { id: 'EUR', name: 'EUR' }, { id: 'GBP', name: 'GBP' }]}
                placeholder="Select currency"
                onSelect={(currency) => setSelectedCurrency(currency.id)}
                buttonTextAfterSelection={(currency) => currency.name}
                rowTextForSelection={(currency) => currency.name}
                value={{ id: selectedCurrency, name: selectedCurrency }}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Bank Account</Text>
              <DropdownItem<BankAccount>
                data={bankAccounts.filter((account) => account.currency === selectedCurrency)}
                placeholder="Select bank account"
                onSelect={(account) => setSelectedBank(account.id)}
                buttonTextAfterSelection={(account) => `${account.bankName} (${account.last4})`}
                rowTextForSelection={(account) => `${account.bankName} (${account.last4})`}
                value={bankAccounts.find(account => account.id === selectedBank)}
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
                placeholder={`Enter amount in ${selectedCurrency}`}
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            <TouchableOpacity
              onPress={handleWithdraw}
              disabled={isLoading || !selectedBank || !amount}
              style={[
                styles.button,
                {
                  backgroundColor: (isLoading || !selectedBank || !amount) ? colors.border : colors.primary,
                  opacity: (isLoading || !selectedBank || !amount) ? 0.5 : 1
                }
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Withdraw to Bank</Text>
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
