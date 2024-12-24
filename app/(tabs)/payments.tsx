import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import TransactionItem from '@/components/transactionComponent/TransactionItem';
import { Transaction } from '@/services/api.transaction.service';
import { Card } from '@/components/ui/Card';
import CreatePaymentModal from '@/components/modalComponent/CreatePaymentModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTransaction } from '@/context/TransactionContextProvider';
import { useAuth } from '@/context/AuthContextProvider';
import { useStripe } from '@/context/StripeContextProvider';
import { formatCurrency } from '@/utilities/format';

type TransactionFilter = 'all' | 'deposit' | 'withdrawal' | 'transfer';

export default function PaymentsScreen() {
  const { colors } = useTheme();
  const [isLoading] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<TransactionFilter>('all');

  const { userTransactions, walletTransactions, getUserTransactions } = useTransaction();
  const { transfers, fetchTransfers } = useStripe();
  const { user } = useAuth();

  // Load user transactions and transfers when the component mounts
  useEffect(() => {
    if (user?._id) {
      getUserTransactions(user._id);
      fetchTransfers();
    }
  }, [user]);

  const filterTransactions = (transactions: Transaction[]) => {
    if (!transactions) return [];
    
    return transactions.filter(transaction => {
      // Apply type filter
      if (activeFilter !== 'all' && transaction.type !== activeFilter) {
        return false;
      }

      // Apply search query
      if (searchQuery) {
        const amount = transaction.amount.toString();
        const searchLower = searchQuery.toLowerCase();
        return (
          transaction.description?.toLowerCase().includes(searchLower) ||
          amount.includes(searchLower) ||
          transaction.type.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  };

  // Convert transfers to transaction format for display
  const transferTransactions: Transaction[] = transfers.map(transfer => {
    // Determine the base type from the transfer ID
    const baseType = transfer.id.startsWith('dep_') ? 'deposit' : 'withdrawal';
    
    // Map Stripe transfer status to Transaction status
    let transactionStatus: 'pending' | 'failed' | 'completed';
    switch (transfer.status) {
      case 'failed':
        transactionStatus = 'failed';
        break;
      case 'succeeded':
        transactionStatus = 'completed';
        break;
      case 'processing':
      case 'pending':
      default:
        transactionStatus = 'pending';
        break;
    }
    
    const date = new Date(transfer.created * 1000);
    
    return {
      _id: transfer.id,
      type: baseType as 'deposit' | 'withdrawal' | 'transfer',
      amount: transfer.amount,
      currency: transfer.currency,
      description: transfer.description || 
                  (baseType === 'deposit' ? 'Bank Deposit' : 'Bank Withdrawal') +
                  (transfer.status !== 'succeeded' ? ` (${transfer.status})` : ''),
      status: transactionStatus,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
      walletId: user?._id || '',
      date: date.toISOString(),
      __v: 0,
      metadata: {
        fromWalletId: user?._id,
        toWalletId: user?._id,
        transferType: baseType === 'deposit' ? 'in' : 'out',
        description: transfer.description
      }
    };
  });

  const allTransactions = [
    ...filterTransactions(userTransactions),
    ...filterTransactions(walletTransactions),
    ...transferTransactions,
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const FilterButton = ({ type, label }: { type: TransactionFilter; label: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor: activeFilter === type ? colors.primary : colors.card,
        },
      ]}
      onPress={() => setActiveFilter(type)}
    >
      <Text
        style={[
          styles.filterButtonText,
          {
            color: activeFilter === type ? colors.background : colors.text,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Bar and Create Button Row */}
      <View style={styles.searchRow}>
        <Card style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={24} color={colors.gray} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search transactions..."
            placeholderTextColor={colors.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Card>
        <TouchableOpacity
          onPress={() => setIsCreateModalVisible(true)}
          style={[styles.createButton, { backgroundColor: colors.primary }]}
        >
          <MaterialCommunityIcons name="plus" size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

      {/* Filter Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <FilterButton type="all" label="All" />
        <FilterButton type="deposit" label="Deposits" />
        <FilterButton type="withdrawal" label="Withdrawals" />
        <FilterButton type="transfer" label="Transfers" />
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerTitle: 'Payments',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      />

      <FlatList
        data={allTransactions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            viewingWalletId={
              user?._id && item.metadata && item.metadata.fromWalletId && item.metadata.toWalletId
                ? user._id === item.metadata.fromWalletId 
                  ? item.metadata.fromWalletId 
                  : item.metadata.toWalletId
                : undefined
            }
          />
        )}
        refreshing={isLoading}
        onRefresh={() => {
          if (user?._id) {
            getUserTransactions(user._id);
            fetchTransfers();
          }
        }}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No transactions found
            </Text>
          </View>
        )}
      />

      <CreatePaymentModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    height: 24,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
  },
  createButton: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
  },
  transactionItemContainer: {
    marginBottom: 8,
  },
});