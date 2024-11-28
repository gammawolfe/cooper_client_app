import React from 'react';
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

interface CreatePaymentModalProps {
  visible: boolean;
  onClose: () => void;
}

interface PaymentOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: `/${string}`;
}

const paymentOptions: Record<string, PaymentOption[]> = {
  'Add New': [
    {
      id: 'pay-friend',
      title: 'Pay a Friend',
      description: 'Send money to friends and family',
      icon: 'account-cash',
      route: '/(tabs)/pay-friend',
    },
    {
      id: 'add-bank',
      title: 'Add Bank Account',
      description: 'Connect your bank account',
      icon: 'bank-plus',
      route: '/bank',
    },
    {
      id: 'add-card',
      title: 'Add Card',
      description: 'Add a debit or credit card',
      icon: 'credit-card-plus',
      route: '/add-card',
    },
  ],
  'Money Out': [
    {
      id: 'withdraw',
      title: 'Withdraw to Bank',
      description: 'Transfer money to your bank account',
      icon: 'bank-transfer-out',
      route: '/withdraw',
    },
    {
      id: 'pay-bills',
      title: 'Pay Bills',
      description: 'Pay your bills and utilities',
      icon: 'file-document-outline',
      route: '/pay-bills',
    },
  ],
  'Money In': [
    {
      id: 'add-money',
      title: 'Add Money',
      description: 'Add money from bank or card',
      icon: 'cash-plus',
      route: '/add-money',
    },
    {
      id: 'request-money',
      title: 'Request Money',
      description: 'Request money from others',
      icon: 'cash-clock',
      route: '/request-money',
    },
  ],
};

export default function CreatePaymentModal({
  visible,
  onClose,
}: CreatePaymentModalProps) {
  const { colors } = useTheme();

  const handleOptionPress = (route: `/${string}`) => {
    onClose();
    router.replace(route);
  };

  const renderPaymentOption = (option: PaymentOption) => (
    <TouchableOpacity
      key={option.id}
      style={[styles.optionButton, { borderColor: colors.border }]}
      onPress={() => handleOptionPress(option.route)}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
        <MaterialCommunityIcons name={option.icon as any} size={24} color={colors.primary} />
      </View>
      <View style={styles.optionContent}>
        <Text style={[styles.optionTitle, { color: colors.text }]}>{option.title}</Text>
        <Text style={[styles.optionDescription, { color: colors.gray }]}>
          {option.description}
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={colors.gray} />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={[styles.content, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>
                Payments
              </Text>
              <Text style={[styles.subtitle, { color: colors.gray }]}>
                Send, receive, or manage your money
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {Object.entries(paymentOptions).map(([section, options]) => (
              <View key={section} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{section}</Text>
                {options.map(renderPaymentOption)}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
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
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
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
