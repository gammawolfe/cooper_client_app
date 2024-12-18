import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, RefreshControl, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useLoan } from '@/context/LoanContextProvider';
import { useAuth } from '@/context/AuthContextProvider';
import { formatCurrency, formatDate } from '@/utilities/format';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { LoanRequest } from '@/services/api.loan.service';

export default function LoanRequestDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [loanRequest, setLoanRequest] = useState<LoanRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    approveLoanRequest,
    declineLoanRequest,
    cancelLoanRequest,
    refreshLoanRequests,
    fetchLoanRequestById
  } = useLoan();

  useEffect(() => {
    loadLoanRequest();
  }, [id]);

  const loadLoanRequest = async () => {
    if (!id || typeof id !== 'string') return;
    
    try {
      setIsLoading(true);
      setError(null);
      const request = await fetchLoanRequestById(id);
      
      // Verify user has permission to view this loan request
      if (!user?._id) {
        setError('You must be logged in to view loan requests');
        return;
      }
      
      if (request.borrowerId._id !== user._id && request.lenderId._id !== user._id) {
        setError('You do not have permission to view this loan request');
        return;
      }
      
      setLoanRequest(request);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError('You do not have permission to view this loan request');
      } else {
        setError('Failed to load loan request. Please try again later.');
      }
      console.error('Error loading loan request:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadLoanRequest();
    } finally {
      setRefreshing(false);
    }
  }, [id]);

  const handleApprove = async () => {
    try {
      await approveLoanRequest(id as string);
      router.back();
    } catch (error) {
      console.error('Failed to approve loan request:', error);
    }
  };

  const handleReject = async () => {
    if (!rejectReason) {
      setShowRejectInput(true);
      return;
    }

    try {
      await declineLoanRequest(id as string, rejectReason);
      router.back();
    } catch (error) {
      console.error('Failed to reject loan request:', error);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelLoanRequest(id as string, 'Request cancelled by user');
      router.back();
    } catch (error) {
      console.error('Failed to cancel loan request:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={['left', 'right']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !loanRequest) {
    return (
      <SafeAreaView edges={['left', 'right']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error || 'Loan request not found'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isIncoming = loanRequest.lenderId._id === user?._id;

  return (
    <SafeAreaView edges={['left', 'right']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Card style={styles.headerCard}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              Loan Request
            </Text>
            <Text style={[styles.subtitle, { color: colors.text + '80' }]}>
              {loanRequest.borrowerNotes || 'No description provided'}
            </Text>
          </View>

          <View style={styles.amountContainer}>
            <Text style={[styles.amountLabel, { color: colors.text + '80' }]}>
              Loan Amount
            </Text>
            <Text style={[styles.amount, { color: colors.primary }]}>
              {formatCurrency(loanRequest.amount, loanRequest.currency)}
            </Text>
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={[styles.infoItem, styles.infoItemBorder]}>
              <Text style={[styles.infoLabel, { color: colors.text + '80' }]}>Interest Rate</Text>
              <Text style={[styles.infoValue, { color: colors.primary }]}>
                {loanRequest.interestRate}%
              </Text>
            </View>
            <View style={[styles.infoItem, styles.infoItemBorder]}>
              <Text style={[styles.infoLabel, { color: colors.text + '80' }]}>Duration</Text>
              <Text style={[styles.infoValue, { color: colors.primary }]}>
                {loanRequest.durationInMonths} months
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.text + '80' }]}>Status</Text>
              <Text style={[styles.infoValue, { color: colors.primary }]}>
                {loanRequest.status.charAt(0).toUpperCase() + loanRequest.status.slice(1)}
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.detailsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Request Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.text + '80' }]}>Request Date</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDate(loanRequest.requestDate)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.text + '80' }]}>Borrower</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {`${loanRequest.borrowerId.firstName} ${loanRequest.borrowerId.lastName}`}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.text + '80' }]}>Lender</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {`${loanRequest.lenderId.firstName} ${loanRequest.lenderId.lastName}`}
            </Text>
          </View>
        </Card>

        <Card style={styles.detailsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Repayment Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.text + '80' }]}>Total Repayment</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatCurrency(loanRequest.totalRepaymentAmount, loanRequest.currency)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.text + '80' }]}>Monthly Payment</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatCurrency(loanRequest.totalRepaymentAmount / loanRequest.durationInMonths, loanRequest.currency)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.text + '80' }]}>Total Interest</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatCurrency(loanRequest.totalRepaymentAmount - loanRequest.amount, loanRequest.currency)}
            </Text>
          </View>

          <Text style={[styles.scheduleTitle, { color: colors.text, marginTop: 16 }]}>Payment Schedule</Text>
          {loanRequest.repaymentSchedule.map((payment: any, index: number) => (
            <View key={index} style={styles.scheduleRow}>
              <Text style={[styles.scheduleLabel, { color: colors.text + '80' }]}>
                Payment {index + 1}
              </Text>
              <Text style={[styles.scheduleValue, { color: colors.text }]}>
                {formatCurrency(payment.amount, loanRequest.currency)}
              </Text>
            </View>
          ))}
        </Card>

        {loanRequest.status === 'pending' && (
          <Card style={styles.actionsCard}>
            {showRejectInput ? (
              <View style={styles.rejectInputContainer}>
                <TextInput
                  style={[styles.rejectInput, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Enter reason for rejection..."
                  placeholderTextColor={colors.text + '80'}
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  multiline
                />
                <View style={styles.rejectActions}>
                  <Button 
                    variant="secondary"
                    onPress={() => setShowRejectInput(false)}
                    style={styles.actionButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onPress={handleReject}
                    style={styles.actionButton}
                  >
                    Confirm Rejection
                  </Button>
                </View>
              </View>
            ) : (
              <View style={styles.actionButtons}>
                {isIncoming ? (
                  <>
                    <Button
                      variant="secondary"
                      onPress={() => setShowRejectInput(true)}
                      style={styles.actionButton}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      onPress={handleApprove}
                      style={styles.actionButton}
                    >
                      Approve
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="secondary"
                    onPress={handleCancel}
                    style={styles.actionButton}
                  >
                    Cancel Request
                  </Button>
                )}
              </View>
            )}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  headerCard: {
    padding: 16,
    marginBottom: 16,
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  amountContainer: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  amount: {
    fontSize: 32,
    fontWeight: '600',
  },
  infoCard: {
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoItemBorder: {
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  detailsCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsCard: {
    padding: 16,
  },
  rejectInputContainer: {
    marginBottom: 16,
  },
  rejectInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 80,
  },
  rejectActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    minWidth: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
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
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  scheduleLabel: {
    fontSize: 14,
  },
  scheduleValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});