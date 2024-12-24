import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { useStripe } from '@/context/StripeContextProvider';
import { DropdownItem } from '@/components/dropdownComponent/DropdownItem';
import { formatCurrency } from '@/utilities/format';

interface DepositModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function DepositModal({ visible, onClose }: DepositModalProps) {
  const { colors } = useTheme();
  const { bankAccounts, initiateDeposit, isLoading } = useStripe();
  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  const handleDeposit = async () => {
    if (!selectedBank) {
      Alert.alert('Error', 'Please select a bank account');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      await initiateDeposit({
        bankAccountId: selectedBank,
        amount: amountValue,
        currency: 'USD', // TODO: Make this dynamic based on the bank account's currency
        description: description.trim() || undefined,
      });
      onClose();
      Alert.alert('Success', 'Deposit initiated successfully');
    } catch (error) {
      console.error('Deposit error:', error);
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
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>From Bank Account</Text>
              <DropdownItem
                data={bankAccounts}
                placeholder="Select bank account"
                onSelect={(bank) => setSelectedBank(bank.id)}
                buttonTextAfterSelection={(bank) => `${bank.bankName} (${bank.last4})`}
                rowTextForSelection={(bank) => `${bank.bankName} (${bank.last4})`}
                value={bankAccounts.find(b => b.id === selectedBank)}
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
                placeholder="Enter amount"
                placeholderTextColor={colors.textSecondary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="Add a note"
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Button
              variant="primary"
              onPress={handleDeposit}
              disabled={isLoading || !selectedBank || !amount}
              style={styles.submitButton}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                'Add Money'
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
