import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Transaction } from '@/services/api.transaction.service';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
}

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'deposit':
      return 'bank-transfer-in';
    case 'withdrawal':
      return 'bank-transfer-out';
    case 'transfer':
      return 'bank-transfer';
    default:
      return 'cash';
  }
};

const getTransactionColor = (type: string, colors: any) => {
  switch (type) {
    case 'deposit':
      return colors.success;
    case 'withdrawal':
      return colors.error;
    case 'transfer':
      return colors.primary;
    default:
      return colors.text;
  }
};

export default function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderRadius: 12,
          marginHorizontal: 16,
          marginBottom: 8,
        },
      ]}
      onPress={() => onPress?.(transaction)}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={getTransactionIcon(transaction.type)}
          size={24}
          color={getTransactionColor(transaction.type, colors)}
        />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.mainContent}>
          <View style={styles.typeContainer}>
            <Text style={[styles.type, { color: colors.text }]}>
              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
            </Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {format(new Date(transaction.date), 'MMM d, yyyy')}
            </Text>
          </View>
          <Text
            style={[
              styles.amount,
              {
                color: getTransactionColor(transaction.type, colors),
              },
            ]}
          >
            {transaction.type === 'withdrawal' ? '-' : '+'}
            {new Intl.NumberFormat('en-GB', {
              style: 'currency',
              currency: transaction.currency,
            }).format(transaction.amount)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeContainer: {
    flex: 1,
    marginRight: 8,
  },
  type: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
});