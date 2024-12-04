import React from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl, 
  Text,
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useLoan } from '@/context/LoanContextProvider';
import { formatCurrency } from '@/utilities/format';
import { Ionicons } from '@expo/vector-icons';

export default function LoansScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);
  
  const {
    borrowedLoans,
    lentLoans,
    isLoading,
    refreshLoans,
  } = useLoan();

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshLoans();
    } finally {
      setRefreshing(false);
    }
  }, [refreshLoans]);

  const handleLoanPress = (id: string) => {
    router.push(`/loans/${id}`);
  };

  const renderLoan = ({ item }) => {
    const isBorrowed = borrowedLoans.includes(item);
    const nextPayment = item.repaymentSchedule?.find(payment => !payment.isPaid);
    const nextPaymentAmount = nextPayment ? formatCurrency(nextPayment.amount) : 'No payments due';
    const nextPaymentDate = nextPayment 
      ? new Date(nextPayment.dueDate).toLocaleDateString()
      : 'N/A';

    return (
      <TouchableOpacity
        style={[styles.listItem, { backgroundColor: colors.surface }]}
        onPress={() => handleLoanPress(item._id)}
      >
        <View style={styles.listItemContent}>
          <View style={styles.listItemHeader}>
            <Ionicons 
              name={isBorrowed ? 'arrow-down' : 'arrow-up'} 
              size={24} 
              color={colors.primary} 
            />
            <Text style={[styles.listItemTitle, { color: colors.text }]}>
              {formatCurrency(item.amount)} @ {item.interestRate}%
            </Text>
          </View>
          <View style={styles.listItemDetails}>
            <Text style={[styles.listItemDescription, { color: colors.text }]}>
              Next Payment: {nextPaymentAmount}{'\n'}
              Due Date: {nextPaymentDate}{'\n'}
              Term: {item.duration} months
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {borrowedLoans.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Borrowed Loans
            </Text>
            <FlatList
              data={borrowedLoans}
              renderItem={renderLoan}
              keyExtractor={item => item._id}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.text}
                />
              }
            />
          </View>
        )}

        {lentLoans.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Lent Loans
            </Text>
            <FlatList
              data={lentLoans}
              renderItem={renderLoan}
              keyExtractor={item => item._id}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.text}
                />
              }
            />
          </View>
        )}

        {borrowedLoans.length === 0 && lentLoans.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No loans found
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  listContent: {
    gap: 8,
  },
  listItem: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  listItemContent: {
    padding: 12,
  },
  listItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  listItemDetails: {
    marginLeft: 32,
  },
  listItemDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});