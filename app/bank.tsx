import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import AddBankModal from '@/components/modalComponent/AddBankModal';
import { useStripe } from '@/context/StripeContextProvider';
import { Card } from '@/components/ui/Card';

export default function BankScreen() {
  const { colors } = useTheme();
  const [isAddBankModalVisible, setIsAddBankModalVisible] = useState(false);
  const { bankAccounts, removeBankAccount, setDefaultBankAccount, isLoading } = useStripe();

  const handleRemoveBank = async (bankId: string) => {
    await removeBankAccount(bankId);
  };

  const handleSetDefaultBank = async (bankId: string) => {
    await setDefaultBankAccount(bankId);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerText, { color: colors.text }]}>Bank Accounts</Text>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.infoCard}>
          <MaterialCommunityIcons
            name="shield-lock-outline"
            size={32}
            color={colors.primary}
          />
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            Secure Bank Connection
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            We use bank-level security to protect your information. Your credentials
            are never stored on our servers.
          </Text>
        </Card>

        {bankAccounts.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="bank-outline"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No bank accounts added yet
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
              Add a bank account to receive payments
            </Text>
          </View>
        ) : (
          bankAccounts.map((bank) => (
            <View
              key={bank.id}
              style={[
                styles.bankCard,
                {
                  backgroundColor: colors.card,
                  borderColor: bank.isDefault ? colors.primary : colors.border,
                },
              ]}
            >
              <View style={styles.bankInfo}>
                <View style={styles.bankNameContainer}>
                  <Text style={[styles.bankName, { color: colors.text }]}>
                    {bank.bankName}
                  </Text>
                  {bank.isDefault && (
                    <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.defaultText, { color: colors.background }]}>
                        Default
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.accountName, { color: colors.textSecondary }]}>
                  {bank.accountHolderName}
                </Text>
                <Text style={[styles.accountDetails, { color: colors.textSecondary }]}>
                  •••• {bank.last4} | {bank.sortCode}
                </Text>
              </View>

              <View style={styles.actions}>
                {!bank.isDefault && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSetDefaultBank(bank.id)}
                    disabled={isLoading}
                  >
                    <MaterialCommunityIcons
                      name="star-outline"
                      size={24}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleRemoveBank(bank.id)}
                  disabled={isLoading}
                >
                  <MaterialCommunityIcons
                    name="delete-outline"
                    size={24}
                    color={colors.error}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          variant="primary"
          onPress={() => setIsAddBankModalVisible(true)}
          disabled={isLoading}
        >
          Add Bank Account
        </Button>
      </View>

      <AddBankModal
        visible={isAddBankModalVisible}
        onClose={() => setIsAddBankModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 16,
    marginTop: 8,
  },
  bankCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  bankInfo: {
    flex: 1,
  },
  bankNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bankName: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '500',
  },
  accountName: {
    fontSize: 16,
    marginBottom: 4,
  },
  accountDetails: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
});
