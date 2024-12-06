import React, { useState, useCallback, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  RefreshControl, 
  Text, 
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useLoan } from '@/context/LoanContextProvider';
import { useAuth } from '@/context/AuthContextProvider';
import { formatCurrency, formatDate } from '@/utilities/format';
import { Ionicons } from '@expo/vector-icons';
import type { Loan } from '@/services/api.loan.service';
import { Card } from '@/components/ui/Card';

interface Payment {
  dueDate: string;
  amount: number;
  isPaid: boolean;
  _id: string;
}

interface DetailRowProps {
  label: string;
  value: string;
  textColor: string;
}

export default function LoanDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loan, setLoan] = useState<Loan | null>(null);
  
  const {
    getLoan,
    makePayment,
    refreshLoans,
    isLoading,
    error,
  } = useLoan();

  useEffect(() => {
    const fetchLoan = async () => {
      try {
        const loanData = await getLoan(id as string);
        setLoan(loanData);
      } catch (err) {
        console.error('Error fetching loan:', err);
      }
    };
    
    fetchLoan();
  }, [id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const loanData = await getLoan(id as string);
      setLoan(loanData);
    } catch (err) {
      console.error('Error refreshing loan:', err);
    } finally {
      setRefreshing(false);
    }
  }, [id, getLoan]);

  if (isLoading) {
    return (
      <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.userHeader, { backgroundColor: colors.card }]}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !loan) {
    return (
      <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.userHeader, { backgroundColor: colors.card }]}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error || 'Loan not found'}
          </Text>
          <TouchableOpacity 
            onPress={() => getLoan(id as string)} 
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.retryText, { color: colors.card }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isUserBorrower = loan.borrowerId._id === user?._id;
  const nextPayment = loan.repaymentSchedule?.find((payment: Payment) => !payment.isPaid);
  const completedPayments = loan.repaymentSchedule?.filter((payment: Payment) => payment.isPaid).length || 0;
  const totalPayments = loan.repaymentSchedule?.length || 0;
  const progress = (completedPayments / totalPayments) * 100;

  const handleMakePayment = async (paymentId: string) => {
    try {
      await makePayment(id as string, paymentId);
      onRefresh();
    } catch (error) {
      console.error('Failed to make payment:', error);
    }
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.userHeader, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {isUserBorrower ? 
                  `${loan.lenderId.firstName[0]}${loan.lenderId.lastName[0]}` :
                  `${loan.borrowerId.firstName[0]}${loan.borrowerId.lastName[0]}`
                }
              </Text>
            </View>
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.userRole, { color: colors.text + '80' }]}>
              {isUserBorrower ? 'Lender' : 'Borrower'}
            </Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {isUserBorrower ? 
                `${loan.lenderId.firstName} ${loan.lenderId.lastName}` :
                `${loan.borrowerId.firstName} ${loan.borrowerId.lastName}`
              }
            </Text>
          </View>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Ionicons 
              name={isUserBorrower ? 'arrow-down' : 'arrow-up'} 
              size={32} 
              color={colors.primary} 
            />
            <Text style={[styles.amount, { color: colors.text }]}>
              {formatCurrency(loan.amount)}
            </Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: colors.primary,
                    width: `${progress}%` 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: colors.text }]}>
              {completedPayments} of {totalPayments} payments completed
            </Text>
          </View>
        </View>

        <Card style={styles.infoCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Loan Information</Text>
          <View style={styles.detailsContainer}>
            <DetailRow 
              label="Interest Rate"
              value={`${loan.interestRate}%`}
              textColor={colors.text}
            />
            <DetailRow 
              label="Duration"
              value={`${loan.durationInMonths} months`}
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
        </Card>

        {nextPayment && (
          <Card style={styles.nextPaymentCard}>
            <View style={styles.nextPaymentHeader}>
              <Ionicons name="time-outline" size={24} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Next Payment Due
              </Text>
            </View>
            <View style={styles.nextPaymentDetails}>
              <Text style={[styles.nextPaymentAmount, { color: colors.text }]}>
                {formatCurrency(nextPayment.amount)}
              </Text>
              <Text style={[styles.nextPaymentDate, { color: colors.text }]}>
                Due on {formatDate(nextPayment.dueDate)}
              </Text>
              {isUserBorrower && !nextPayment.isPaid && (
                <TouchableOpacity
                  style={[styles.paymentButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleMakePayment(nextPayment._id)}
                >
                  <Text style={styles.paymentButtonText}>Make Payment</Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        )}

        <Card style={styles.scheduleCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Payment Schedule
          </Text>
          <View style={styles.scheduleHeader}>
            <Text style={[styles.scheduleHeaderText, { color: colors.text }]}>Due Date</Text>
            <Text style={[styles.scheduleHeaderText, { color: colors.text }]}>Amount</Text>
            <Text style={[styles.scheduleHeaderText, { color: colors.text }]}>Status</Text>
          </View>
          {loan.repaymentSchedule?.map((payment: Payment, index: number) => (
            <View 
              key={payment._id} 
              style={[
                styles.scheduleRow,
                index === loan.repaymentSchedule.length - 1 && styles.lastScheduleRow
              ]}
            >
              <Text style={[styles.scheduleText, { color: colors.text }]}>
                {formatDate(payment.dueDate)}
              </Text>
              <Text style={[styles.scheduleText, { color: colors.text }]}>
                {formatCurrency(payment.amount)}
              </Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: payment.isPaid ? colors.success + '20' : colors.error + '20' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: payment.isPaid ? colors.success : colors.error }
                ]}>
                  {payment.isPaid ? 'Paid' : 'Pending'}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const DetailRow = ({ label, value, textColor }: DetailRowProps) => (
  <View style={styles.detailRow}>
    <Text style={[styles.label, { color: textColor + '80' }]}>{label}</Text>
    <Text style={[styles.value, { color: textColor }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 80,
  },
  userHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userRole: {
    fontSize: 12,
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  infoCard: {
    padding: 16,
    borderRadius: 16,
  },
  nextPaymentCard: {
    padding: 16,
    borderRadius: 16,
  },
  scheduleCard: {
    padding: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  label: {
    fontSize: 15,
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
  },
  nextPaymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  nextPaymentDetails: {
    alignItems: 'center',
    gap: 8,
  },
  nextPaymentAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  nextPaymentDate: {
    fontSize: 15,
    opacity: 0.7,
  },
  paymentButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
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
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  lastScheduleRow: {
    borderBottomWidth: 0,
  },
  scheduleText: {
    fontSize: 14,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flex: 0.8,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
  },
});