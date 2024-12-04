import React, { useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  RefreshControl, 
  Text, 
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useLoan } from '@/context/LoanContextProvider';
import { formatCurrency, formatDate } from '@/utilities/format';
import { Card } from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';

export default function LoanDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    getLoan,
    makePayment,
    refreshLoans,
  } = useLoan();

  const loan = getLoan(id as string);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshLoans();
    } finally {
      setRefreshing(false);
    }
  }, [refreshLoans]);

  const handleMakePayment = async (paymentId: string) => {
    try {
      await makePayment(id as string, paymentId);
    } catch (error) {
      console.error('Failed to make payment:', error);
    }
  };

  if (!loan) {
    return (
      <View style={styles.container}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Loan not found
        </Text>
      </View>
    );
  }

  const isUserBorrower = loan.borrowerId === 'currentUserId'; // TODO: Replace with actual user ID
  const nextPayment = loan.repaymentSchedule?.find(payment => !payment.isPaid);

  return (
    <SafeAreaView edges={['left', 'right']} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Card style={styles.card}>
          <View style={styles.header}>
            <Ionicons 
              name={isUserBorrower ? 'arrow-down' : 'arrow-up'} 
              size={24} 
              color={colors.primary} 
            />
            <Text style={[styles.title, { color: colors.text }]}>
              Loan Details
            </Text>
          </View>

          <View style={styles.detailsContainer}>
            <DetailRow 
              label="Amount"
              value={formatCurrency(loan.amount)}
              textColor={colors.text}
            />
            <DetailRow 
              label="Interest Rate"
              value={`${loan.interestRate}%`}
              textColor={colors.text}
            />
            <DetailRow 
              label="Duration"
              value={`${loan.duration} months`}
              textColor={colors.text}
            />
            <DetailRow 
              label="Start Date"
              value={formatDate(loan.startDate)}
              textColor={colors.text}
            />
            <DetailRow 
              label="Status"
              value={loan.status}
              textColor={colors.text}
            />
          </View>

          {nextPayment && (
            <View style={styles.nextPaymentContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Next Payment
              </Text>
              <DetailRow 
                label="Amount"
                value={formatCurrency(nextPayment.amount)}
                textColor={colors.text}
              />
              <DetailRow 
                label="Due Date"
                value={formatDate(nextPayment.dueDate)}
                textColor={colors.text}
              />
              {isUserBorrower && !nextPayment.isPaid && (
                <TouchableOpacity
                  style={[styles.paymentButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleMakePayment(nextPayment._id)}
                >
                  <Text style={styles.paymentButtonText}>
                    Make Payment
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.scheduleContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Payment Schedule
            </Text>
            <View style={styles.scheduleHeader}>
              <Text style={[styles.scheduleHeaderText, { color: colors.text }]}>Due Date</Text>
              <Text style={[styles.scheduleHeaderText, { color: colors.text }]}>Amount</Text>
              <Text style={[styles.scheduleHeaderText, { color: colors.text }]}>Status</Text>
            </View>
            {loan.repaymentSchedule?.map((payment, index) => (
              <View key={payment._id} style={styles.scheduleRow}>
                <Text style={[styles.scheduleText, { color: colors.text }]}>
                  {formatDate(payment.dueDate)}
                </Text>
                <Text style={[styles.scheduleText, { color: colors.text }]}>
                  {formatCurrency(payment.amount)}
                </Text>
                <Text style={[styles.scheduleText, { color: payment.isPaid ? colors.success : colors.error }]}>
                  {payment.isPaid ? 'Paid' : 'Pending'}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const DetailRow = ({ label, value, textColor }) => (
  <View style={styles.detailRow}>
    <Text style={[styles.label, { color: textColor }]}>{label}:</Text>
    <Text style={[styles.value, { color: textColor }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
  },
  nextPaymentContainer: {
    marginTop: 24,
    gap: 12,
  },
  scheduleContainer: {
    marginTop: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  scheduleHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'left',
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  scheduleText: {
    fontSize: 14,
    flex: 1,
    textAlign: 'left',
  },
  paymentButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
  },
});