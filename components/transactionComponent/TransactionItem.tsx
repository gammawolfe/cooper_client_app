import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Transaction } from '@/services/api.transaction.service';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
  viewingWalletId?: string;
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

export default function TransactionItem({ transaction, onPress, viewingWalletId }: TransactionItemProps) {
  const { colors } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'failed':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const formatTime = (date: string) => {
    return format(new Date(date), 'h:mm a');
  };

  const getTransferTypeLabel = (type: string, transferType?: string) => {
    if (type === 'transfer') {
      return transferType === 'in' ? 'Transfer In' : 'Transfer Out';
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getTransferIcon = (type: string, transferType?: string) => {
    if (type === 'transfer' || type === 'deposit') {
      return transferType === 'in' ? 'bank-transfer-in' : 'bank-transfer-out';
    }
    return getTransactionIcon(type);
  };

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
          name={getTransferIcon(transaction.type, transaction.metadata?.transferType)}
          size={24}
          color={getTransactionColor(transaction.type, colors)}
        />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.mainContent}>
          <View style={styles.leftContent}>
            <View style={styles.typeContainer}>
              <Text style={[styles.type, { color: colors.text }]}>
                {getTransferTypeLabel(transaction.type, transaction.metadata?.transferType)}
              </Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(transaction.status) }]} />
                <Text style={[styles.status, { color: colors.textSecondary }]}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </Text>
              </View>
            </View>
            <View style={styles.dateContainer}>
              <Text style={[styles.date, { color: colors.textSecondary }]}>
                {format(new Date(transaction.date), 'MMM d, yyyy')}
              </Text>
              <Text style={[styles.time, { color: colors.textSecondary }]}>
                {formatTime(transaction.date)}
              </Text>
            </View>
            {transaction.metadata?.fromWalletId && (
              <Text style={[styles.walletInfo, { color: colors.textSecondary }]} numberOfLines={1}>
                From Wallet: {transaction.metadata.fromWalletId.slice(-6)}
              </Text>
            )}
          </View>
          <View style={styles.rightContent}>
            <Text
              style={[
                styles.amount,
                {
                  color: getTransactionColor(transaction.type, colors),
                },
              ]}
            >
              {(transaction.type === 'withdrawal' || 
                (transaction.type === 'transfer' && 
                  (viewingWalletId ? transaction.fromWalletId._id === viewingWalletId : transaction.fromWalletId))) 
                ? '-' : '+'}
              {new Intl.NumberFormat('en-GB', {
                style: 'currency',
                currency: transaction.currency,
              }).format(transaction.amount)}
            </Text>
          </View>
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
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftContent: {
    flex: 1,
    marginRight: 12,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  type: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  status: {
    fontSize: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
  },
  description: {
    fontSize: 12,
    marginTop: 4,
  },
  walletInfo: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
});