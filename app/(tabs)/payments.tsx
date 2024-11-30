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

type TransactionFilter = 'all' | 'deposit' | 'withdrawal' | 'transfer';

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

  const handleCreatePayment = (paymentData: any) => {
    // TODO: Implement API call to create payment
    console.log('Creating payment:', paymentData);
    setIsCreateModalVisible(false);
  };

  const filterTransactions = (transactions: Transaction[]) => {
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
          amount.includes(searchLower) ||
          transaction.type.toLowerCase().includes(searchLower) ||
          transaction.currency.toLowerCase().includes(searchLower) ||
          transaction.walletId.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  };

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
          <MaterialCommunityIcons name="plus" size={24} color={colors.text} />
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

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TransactionItem transaction={item} />
  );

  const filteredTransactions = filterTransactions(userTransactions);

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
        data={filteredTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item._id}
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
});