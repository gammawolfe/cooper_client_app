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
      if (viewingWalletId && transaction.fromWalletId?._id) {
        return transaction.fromWalletId._id === viewingWalletId ? 'Transfer Out' : 'Transfer In';
      }
      return transferType === 'in' ? 'Transfer In' : 'Transfer Out';
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <TouchableOpacity
      onPress={() => onPress?.(transaction)}
      style={[
        styles.container,
        { backgroundColor: colors.card }
      ]}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={getTransactionIcon(transaction.type)}
          size={24}
          color={colors.primary}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.mainContent}>
          <View style={styles.leftContent}>
            <View style={styles.typeContainer}>
              <Text style={[styles.type, { color: colors.text }]} numberOfLines={1}>
                {getTransferTypeLabel(transaction.type, transaction.metadata?.transferType)}
              </Text>
            </View>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {format(new Date(transaction.date), 'MMM d, yyyy')} {formatTime(transaction.date)}
            </Text>

            {transaction.metadata?.contributionName && (
              <View style={styles.detailsContainer}>
                <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {transaction.metadata.contributionName}
                  {transaction.metadata.cycleNumber && ` - Cycle ${transaction.metadata.cycleNumber}`}
                </Text>
              </View>
            )}
            {transaction.type === 'transfer' && transaction.fromWalletId && transaction.toWalletId && (
              <View style={styles.detailsContainer}>
                <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {viewingWalletId === transaction.fromWalletId._id
                    ? `To: ${transaction.toWalletId.name}`
                    : `From: ${transaction.fromWalletId.name}`}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.rightContent}>
            <Text style={[styles.amount, { color: colors.text }]}>
              {(transaction.type === 'withdrawal' || 
                (transaction.type === 'transfer' && transaction.fromWalletId?._id === viewingWalletId)) 
                ? '-' : '+'}
              {new Intl.NumberFormat('en-GB', {
                style: 'currency',
                currency: transaction.currency,
              }).format(transaction.amount)}
            </Text>
            {transaction.status && (
              <Text style={[styles.status, { color: getStatusColor(transaction.status) }]}>
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
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
    marginRight: 16,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  typeContainer: {
    marginBottom: 4,
  },
  type: {
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  status: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  detailsContainer: {
    marginTop: 4,
  },
  detailText: {
    fontSize: 14,
  },
});