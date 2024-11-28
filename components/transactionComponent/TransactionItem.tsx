import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  category: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'food':
      return 'food';
    case 'transport':
      return 'car';
    case 'bills':
      return 'file-document';
    case 'income':
      return 'cash-plus';
    default:
      return 'cash';
  }
};

const getStatusColor = (status: string, colors: any) => {
  switch (status) {
    case 'completed':
      return colors.success;
    case 'pending':
      return colors.warning;
    case 'failed':
      return colors.error;
    default:
      return colors.text;
  }
};

export default function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const { colors } = useTheme();

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: transaction.currency,
  }).format(transaction.amount);

  const formattedDate = format(new Date(transaction.timestamp), 'MMM d, yyyy');

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={() => onPress?.(transaction)}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={getCategoryIcon(transaction.category)}
          size={24}
          color={colors.primary}
        />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.mainContent}>
          <Text style={[styles.description, { color: colors.text }]}>
            {transaction.description}
          </Text>
          <Text
            style={[
              styles.amount,
              { color: transaction.type === 'credit' ? colors.success : colors.error },
            ]}
          >
            {transaction.type === 'credit' ? '+' : '-'}{formattedAmount}
          </Text>
        </View>
        <View style={styles.details}>
          <Text style={[styles.date, { color: colors.gray }]}>
            {formattedDate}
          </Text>
          <Text
            style={[
              styles.status,
              { color: getStatusColor(transaction.status, colors) },
            ]}
          >
            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
  },
});