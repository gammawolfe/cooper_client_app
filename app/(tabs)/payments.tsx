import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import TransactionItem, { Transaction } from '@/components/transactionComponent/TransactionItem';
import { Card } from '@/components/ui/Card';
import CreatePaymentModal from '@/components/modalComponent/CreatePaymentModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Temporary mock data - replace with actual API call
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'credit',
    amount: 500,
    currency: 'USD',
    description: 'Salary Deposit',
    category: 'income',
    timestamp: new Date().toISOString(),
    status: 'completed',
  },
  {
    id: '2',
    type: 'debit',
    amount: 50,
    currency: 'USD',
    description: 'Grocery Shopping',
    category: 'food',
    timestamp: new Date().toISOString(),
    status: 'completed',
  },
  {
    id: '3',
    type: 'debit',
    amount: 30,
    currency: 'USD',
    description: 'Uber Ride',
    category: 'transport',
    timestamp: new Date().toISOString(),
    status: 'completed',
  },
  {
    id: '4',
    type: 'debit',
    amount: 100,
    currency: 'USD',
    description: 'Electric Bill',
    category: 'bills',
    timestamp: new Date().toISOString(),
    status: 'pending',
  },
];

export default function PaymentsScreen() {
  const { colors } = useTheme();
  const [isLoading] = useState(false);
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  const handleCreatePayment = (paymentData: any) => {
    // TODO: Implement API call to create payment
    console.log('Creating payment:', paymentData);
    // After successful creation, you would typically:
    // 1. Make API call to create payment
    // 2. Refresh the transactions list
    // 3. Show success message
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TransactionItem
      transaction={item}
      onPress={(transaction) => {
        console.log('Transaction pressed:', transaction);
      }}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Card style={styles.balanceCard}>
        <Text style={[styles.balanceLabel, { color: colors.gray }]}>
          Total Balance
        </Text>
        <Text style={[styles.balanceAmount, { color: colors.text }]}>
          $2,500.00
        </Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.gray }]}>Income</Text>
            <Text style={[styles.statAmount, { color: colors.success }]}>+$3,000.00</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.gray }]}>Expenses</Text>
            <Text style={[styles.statAmount, { color: colors.error }]}>-$500.00</Text>
          </View>
        </View>
      </Card>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Payments',
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setIsCreateModalVisible(true)}
              style={styles.createButton}
            >
              <MaterialCommunityIcons name="plus" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
  },
  balanceCard: {
    padding: 20,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 16,
  },
  createButton: {
    padding: 8,
    marginRight: 8,
  },
});