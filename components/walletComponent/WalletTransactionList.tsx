import React from 'react';
import { StyleSheet, View, Text, FlatList, ListRenderItem } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Transaction } from '@/services/api.wallet.service';
import { formatCurrency } from '@/utils/formatters';
import { Card } from '@/components/ui/Card';

interface WalletTransactionListProps {
  transactions: Transaction[];
  currency: string;
  isLoading?: boolean;
}

export function WalletTransactionList({ transactions, currency, isLoading }: WalletTransactionListProps) {
  const { colors } = useTheme();

  const renderItem: ListRenderItem<Transaction> = ({ item }) => (
    <Card style={styles.transactionCard}>
      <View style={styles.transactionRow}>
        <View>
          <Text style={[styles.description, { color: colors.text }]}>
            {item.description}
          </Text>
          <Text style={[styles.timestamp, { color: colors.icon }]}>
            {new Date(item.timestamp).toLocaleDateString()}
          </Text>
        </View>
        <Text
          style={[
            styles.amount,
            { color: item.type === 'credit' ? colors.primary : colors.error }
          ]}
        >
          {item.type === 'credit' ? '+' : '-'}
          {formatCurrency(Math.abs(item.amount), currency)}
        </Text>
      </View>
    </Card>
  );

  if (isLoading) {
    return null; // Loading state is handled by the parent
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Recent Transactions</Text>
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.icon }]}>
            No transactions yet
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  listContent: {
    padding: 16,
    gap: 8,
  },
  transactionCard: {
    marginBottom: 8,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 14,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 24,
  },
});
