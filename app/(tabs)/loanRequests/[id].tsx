import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, RefreshControl, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useLoan } from '@/context/LoanContextProvider';
import { useAuth } from '@/context/AuthContextProvider';
import { formatCurrency, formatDate } from '@/utilities/format';
import { Card } from '@/components/ui/Card';
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !loanRequest) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Card style={styles.card}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>Loan Request Details</Text>
          </View>

          <DetailRow
            label="Amount"
            value={formatCurrency(loanRequest.amount)}
            textColor={colors.text}
          />
          <DetailRow
            label="Interest Rate"
            value={`${loanRequest.interestRate}%`}
            textColor={colors.text}
          />
          <DetailRow
            label="Duration"
            value={`${loanRequest.durationInMonths} months`}
            textColor={colors.text}
          />
          <DetailRow
            label="Status"
            value={loanRequest.status.charAt(0).toUpperCase() + loanRequest.status.slice(1)}
            textColor={colors.text}
          />
          <DetailRow
            label="Request Date"
            value={formatDate(loanRequest.requestDate)}
            textColor={colors.text}
          />
          <DetailRow
            label="Borrower"
            value={`${loanRequest.borrowerId.firstName} ${loanRequest.borrowerId.lastName}`}
            textColor={colors.text}
          />
          <DetailRow
            label="Lender"
            value={`${loanRequest.lenderId.firstName} ${loanRequest.lenderId.lastName}`}
            textColor={colors.text}
          />
          {loanRequest.borrowerNotes && (
            <DetailRow
              label="Notes"
              value={loanRequest.borrowerNotes}
              textColor={colors.text}
            />
          )}

          {loanRequest.status === 'pending' && (
            <View style={styles.actions}>
              {showRejectInput ? (
                <View style={styles.rejectInputContainer}>
                  <TextInput
                    style={[styles.rejectInput, { color: colors.text, borderColor: colors.border }]}
                    placeholder="Enter reason for rejection..."
                    placeholderTextColor={colors.text}
                    value={rejectReason}
                    onChangeText={setRejectReason}
                    multiline
                  />
                  <TouchableOpacity
                    style={[styles.button, styles.rejectButton]}
                    onPress={handleReject}
                  >
                    <Text style={styles.buttonText}>Confirm Rejection</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {isIncoming ? (
                    <>
                      <TouchableOpacity
                        style={[styles.button, styles.approveButton]}
                        onPress={handleApprove}
                      >
                        <Text style={styles.buttonText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.button, styles.rejectButton]}
                        onPress={() => setShowRejectInput(true)}
                      >
                        <Text style={styles.buttonText}>Reject</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={handleCancel}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, textColor }: { label: string; value: string; textColor: string }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      <Text style={[styles.value, { color: textColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
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
  card: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    opacity: 0.7,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  actions: {
    marginTop: 24,
  },
  rejectInputContainer: {
    marginBottom: 16,
  },
  rejectInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 80,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  cancelButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});