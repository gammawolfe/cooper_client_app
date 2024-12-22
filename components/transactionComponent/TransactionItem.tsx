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
      // If we're viewing from a specific wallet's perspective
      if (viewingWalletId && transaction.fromWalletId?._id) {
        // If the viewing wallet is the source (fromWalletId), it's a Transfer Out
        // If the viewing wallet is the destination (toWalletId), it's a Transfer In
        return transaction.fromWalletId._id === viewingWalletId ? 'Transfer Out' : 'Transfer In';
      }
      // Default behavior if no viewingWalletId is provided
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
          borderRadius: onPress ? 12 : 0,
          marginHorizontal: onPress ? 16 : 0,
          marginBottom: onPress ? 8 : 0,
          padding: onPress ? 16 : 0,
        },
      ]}
      onPress={() => onPress?.(transaction)}
      disabled={!onPress}
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
            {transaction.description && (
              <View style={styles.detailsContainer}>
                <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {transaction.description}
                </Text>
              </View>
            )}
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
                (transaction.type === 'transfer' && transaction.fromWalletId?._id === viewingWalletId)) 
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
  detailsContainer: {
    marginTop: 4,
  },
  detailText: {
    fontSize: 12,
  },
});