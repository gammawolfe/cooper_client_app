import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCurrency } from '@/utils/formatters';

interface BankAccount {
  id: string;
  bankName: string;
  accountType: string;
  last4: string;
}

// Mock data - replace with actual data from your backend
const mockBankAccounts: BankAccount[] = [
  {
    id: '1',
    bankName: 'Chase',
    accountType: 'Checking',
    last4: '4567',
  },
  {
    id: '2',
    bankName: 'Bank of America',
    accountType: 'Savings',
    last4: '8901',
  },
];

export default function WithdrawScreen() {
  const { colors } = useTheme();
  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAmountChange = (text: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanedText.split('.');
    if (parts.length > 2) return;
    
    // Limit to 2 decimal places
    if (parts[1]?.length > 2) return;
    
    setAmount(cleanedText);
  };

  const handleWithdraw = async () => {
    if (!selectedBank) {
      Alert.alert('Error', 'Please select a bank account');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      setIsLoading(true);
      // TODO: Implement actual withdrawal logic here
      // This would typically involve:
      // 1. Validating the amount against user's balance
      // 2. Creating a withdrawal transaction
      // 3. Initiating the bank transfer
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to success screen
      router.push('/withdraw/success');
    } catch (error) {
      console.error('Withdrawal error:', error);
      Alert.alert('Error', 'Failed to process withdrawal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderBankOption = (bank: BankAccount) => (
    <TouchableOpacity
      key={bank.id}
      style={[
        styles.bankOption,
        { 
          backgroundColor: colors.card,
          borderColor: selectedBank?.id === bank.id ? colors.primary : colors.border,
          borderWidth: selectedBank?.id === bank.id ? 2 : 1,
        },
      ]}
      onPress={() => setSelectedBank(bank)}
    >
      <MaterialCommunityIcons
        name="bank"
        size={24}
        color={selectedBank?.id === bank.id ? colors.primary : colors.text}
      />
      <View style={styles.bankTextContainer}>
        <Text style={[styles.bankName, { color: colors.text }]}>
          {bank.bankName} {bank.accountType}
        </Text>
        <Text style={[styles.accountNumber, { color: colors.textSecondary }]}>
          •••• {bank.last4}
        </Text>
      </View>
      {selectedBank?.id === bank.id && (
        <MaterialCommunityIcons
          name="check-circle"
          size={24}
          color={colors.primary}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerTitle: 'Withdraw to Bank',
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Amount to Withdraw
            </Text>
            <View style={[styles.amountContainer, { backgroundColor: colors.card }]}>
              <Text style={[styles.currencySymbol, { color: colors.text }]}>$</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
                maxLength={10}
              />
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
              Select Bank Account
            </Text>
            {mockBankAccounts.map(renderBankOption)}

            <TouchableOpacity
              style={[styles.addBankButton, { borderColor: colors.border }]}
              onPress={() => router.push('/bank')}
            >
              <MaterialCommunityIcons
                name="plus-circle-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.addBankText, { color: colors.primary }]}>
                Add New Bank Account
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[
              styles.withdrawButton,
              {
                backgroundColor: isLoading ? colors.border : colors.primary,
                opacity: isLoading ? 0.7 : 1,
              },
            ]}
            onPress={handleWithdraw}
            disabled={isLoading || !selectedBank || !amount}
          >
            <Text style={styles.withdrawButtonText}>
              {isLoading ? 'Processing...' : 'Withdraw Funds'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
  },
  bankOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  bankTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '500',
  },
  accountNumber: {
    fontSize: 14,
    marginTop: 4,
  },
  addBankButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addBankText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  withdrawButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  withdrawButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
