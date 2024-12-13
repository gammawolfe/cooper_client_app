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
  ActivityIndicator,
  Alert,
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
import CreateLoanPaymentModal from '@/components/modalComponent/CreateLoanPaymentModal';

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

const DetailRow = ({ label, value, textColor }: DetailRowProps) => (
  <View style={styles.detailRow}>
    <Text style={[styles.detailLabel, { color: textColor + '80' }]}>{label}</Text>
    <Text style={[styles.detailValue, { color: textColor }]}>{value}</Text>
  </View>
);

export default function LoanDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loan, setLoan] = useState<Loan | null>(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  
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

  const handleMakePayment = async (paymentData: {
    amount: number;
    walletId: string;
    note?: string;
  }) => {
    if (!loan) return;
    
    try {
      await makePayment(loan._id, paymentData);
      await onRefresh();
      Alert.alert('Success', 'Payment processed successfully');
    } catch (error: any) {
      console.error('Failed to make payment:', error);
      Alert.alert('Error', error?.message || 'Failed to process payment');
      throw error;
    }
  };

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
  const nextPayment = loan?.repaymentSchedule?.find((payment: Payment) => !payment.isPaid);
  const completedPayments = loan?.repaymentSchedule?.filter((payment: Payment) => payment.isPaid).length || 0;
  const totalPayments = loan?.repaymentSchedule?.length || 0;
  const progress = (completedPayments / totalPayments) * 100;

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
              {formatCurrency(loan.amount, loan.currency)}
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
          {isUserBorrower && nextPayment && (
            <TouchableOpacity
              style={[styles.paymentButton, { backgroundColor: colors.tint }]}
              onPress={() => setIsPaymentModalVisible(true)}
            >
              <Text style={[styles.paymentButtonText, { color: colors.background }]}>
                Make Payment
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Card style={styles.infoCard}>
          <DetailRow
            label="Status"
            value={loan.status.toUpperCase()}
            textColor={colors.text}
          />
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
        </Card>

        {nextPayment && (
          <Card style={styles.nextPaymentCard}>
            <View style={styles.nextPaymentHeader}>
              <Text style={[styles.nextPaymentTitle, { color: colors.text }]}>
                Next Payment
              </Text>
              <Text style={[styles.nextPaymentAmount, { color: colors.text }]}>
                {formatCurrency(nextPayment.amount, loan.currency)}
              </Text>
              <Text style={[styles.nextPaymentDate, { color: colors.text }]}>
                Due on {formatDate(nextPayment.dueDate)}
              </Text>
            </View>
          </Card>
        )}

        <Card style={styles.scheduleCard}>
          <Text style={[styles.scheduleTitle, { color: colors.text }]}>
            Payment Schedule
          </Text>
          {loan.repaymentSchedule.map((payment: Payment, index: number) => (
            <View 
              key={payment._id}
              style={[
                styles.scheduleItem,
                index < loan.repaymentSchedule.length - 1 && styles.scheduleItemBorder,
                { borderBottomColor: colors.border }
              ]}
            >
              <View style={styles.scheduleItemLeft}>
                <Text style={[styles.scheduleItemDate, { color: colors.text }]}>
                  {formatDate(payment.dueDate)}
                </Text>
                <Text style={[styles.scheduleItemAmount, { color: colors.text }]}>
                  {formatCurrency(payment.amount, loan.currency)}
                </Text>
              </View>
              <View 
                style={[
                  styles.scheduleItemStatus,
                  { 
                    backgroundColor: payment.isPaid ? colors.success + '20' : colors.warning + '20',
                    borderColor: payment.isPaid ? colors.success : colors.warning,
                  }
                ]}
              >
                <Text 
                  style={[
                    styles.scheduleItemStatusText,
                    { color: payment.isPaid ? colors.success : colors.warning }
                  ]}
                >
                  {payment.isPaid ? 'Paid' : 'Pending'}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>

      <CreateLoanPaymentModal
        visible={isPaymentModalVisible}
        onClose={() => setIsPaymentModalVisible(false)}
        onSubmit={handleMakePayment}
        loanAmount={loan.amount}
        remainingAmount={loan.remainingBalance}
        currency={loan.currency}
        nextPaymentAmount={nextPayment?.amount || 0}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
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
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: '600',
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
  },
  paymentButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  nextPaymentCard: {
    padding: 16,
    marginBottom: 16,
  },
  nextPaymentHeader: {
    gap: 4,
  },
  nextPaymentTitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  nextPaymentAmount: {
    fontSize: 24,
    fontWeight: '600',
  },
  nextPaymentDate: {
    fontSize: 14,
  },
  scheduleCard: {
    padding: 16,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  scheduleItemBorder: {
    borderBottomWidth: 1,
  },
  scheduleItemLeft: {
    gap: 4,
  },
  scheduleItemDate: {
    fontSize: 14,
  },
  scheduleItemAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
  scheduleItemStatus: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  scheduleItemStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});