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
import { formatCurrency } from '@/utilities/format';

type TransactionFilter = 'all' | 'deposit' | 'withdrawal' | 'transfer';

interface TransactionWithMetadata extends Transaction {
  metadata?: {
    fromWalletId?: string;
    toWalletId?: string;
    transferType?: 'in' | 'out';
    description?: string;
  };
}

export default function PaymentsScreen() {
  const { colors } = useTheme();
  const [isLoading] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<TransactionFilter>('all');

  const { userTransactions, walletTransactions, getUserTransactions } = useTransaction();
  const { user } = useAuth();

  // Load user transactions when the component mounts
  useEffect(() => {
    if (user?._id) {
      getUserTransactions(user._id);
    }
  }, [user]);

  const filterTransactions = (transactions: TransactionWithMetadata[]) => {
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

  const allTransactions = [
    ...filterTransactions(userTransactions as TransactionWithMetadata[]),
    ...filterTransactions(walletTransactions as TransactionWithMetadata[]),
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
  header: {
    padding: 16,
  },
  searchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    marginRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    height: 40,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    marginBottom: 16,
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
  listContent: {
    padding: 16,
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
});