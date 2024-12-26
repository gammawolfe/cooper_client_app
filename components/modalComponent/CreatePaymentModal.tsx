import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SelectDropdown from 'react-native-select-dropdown';
import DepositModal from './DepositModal';
import WithdrawModal from './WithdrawModal';
import { useWallet } from '@/context/WalletContextProvider';

interface CreatePaymentModalProps {
  visible: boolean;
  onClose: () => void;
}

interface PaymentOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  route?: "/(tabs)/pay-friend" | "/bank" | "/withdraw";
  action?: () => void;
}

const paymentOptions: Record<string, PaymentOption[]> = {
  'Add New': [
    {
      id: 'pay-friend',
      title: 'Pay a Friend',
      description: 'Send money to friends and family',
      icon: 'account-cash',
      route: "/(tabs)/pay-friend",
    },
    {
      id: 'add-bank',
      title: 'Add Bank Account',
      description: 'Connect your bank account',
      icon: 'bank-plus',
      route: "/bank",
    },
    {
      id: 'add-card',
      title: 'Add Card',
      description: 'Add a debit or credit card',
      icon: 'credit-card-plus',
      action: () => {
        // TODO: Implement card addition flow
        console.log('Add card flow not yet implemented');
      },
    },
  ],
  'Money Out': [
    {
      id: 'withdraw',
      title: 'Withdraw to Bank',
      description: 'Transfer money to your bank account',
      icon: 'bank-transfer-out',
      action: () => {}, // Will be set in the component
    },
    {
      id: 'pay-bills',
      title: 'Pay Bills',
      description: 'Pay your bills and utilities',
      icon: 'file-document-outline',
      action: () => {
        // TODO: Implement bill payment flow
        console.log('Bill payment flow not yet implemented');
      },
    },
  ],
  'Money In': [
    {
      id: 'add-money',
      title: 'Add Money',
      description: 'Add money from bank or card',
      icon: 'cash-plus',
      action: () => {}, // Will be set in the component
    },
    {
      id: 'request-money',
      title: 'Request Money',
      description: 'Request money from others',
      icon: 'cash-refund',
      action: () => {
        // TODO: Implement request money flow
        console.log('Request money flow not yet implemented');
      },
    },
  ],
};

export default function CreatePaymentModal({
  visible,
  onClose,
}: CreatePaymentModalProps) {
  const { colors } = useTheme();
  const { wallets } = useWallet();
  const [isDepositModalVisible, setIsDepositModalVisible] = useState(false);
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);

  // Get the default wallet (first wallet or undefined if no wallets)
  const defaultWallet = wallets[0];

  // Update the action handlers
  paymentOptions['Money In'][0].action = () => setIsDepositModalVisible(true);
  paymentOptions['Money Out'][0].action = () => setIsWithdrawModalVisible(true);

  const handleOptionPress = (option: PaymentOption) => {
    if (option.action) {
      option.action();
    } else if (option.route) {
      router.push(option.route);
    }
    onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={[styles.container, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.content, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Create Payment</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsContainer}>
              {Object.entries(paymentOptions).map(([category, options]) => (
                <View key={category} style={styles.categoryContainer}>
                  <Text style={[styles.categoryTitle, { color: colors.text }]}>{category}</Text>
                  {options.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[styles.optionButton, { backgroundColor: colors.card }]}
                      onPress={() => handleOptionPress(option)}
                    >
                      <MaterialCommunityIcons
                        name={option.icon as any}
                        size={24}
                        color={colors.primary}
                        style={styles.optionIcon}
                      />
                      <View style={styles.optionTextContainer}>
                        <Text style={[styles.optionTitle, { color: colors.text }]}>
                          {option.title}
                        </Text>
                        <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                          {option.description}
                        </Text>
                      </View>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={24}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <DepositModal
        visible={isDepositModalVisible}
        onClose={() => setIsDepositModalVisible(false)}
      />

      <WithdrawModal
        visible={isWithdrawModalVisible}
        onClose={() => setIsWithdrawModalVisible(false)}
        defaultWallet={defaultWallet}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
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
  optionsContainer: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionIcon: {
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
});
