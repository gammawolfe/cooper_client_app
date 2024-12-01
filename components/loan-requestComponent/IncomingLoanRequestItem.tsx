import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LoanRequest } from '@/services/api.loan.service';
import { useTheme } from '@/context/ThemeContext';
import { formatCurrency } from '@/utils/currency';

interface IncomingLoanRequestProps {
  loanRequest: LoanRequest;
  onPress: () => void;
  onAccept?: () => void;
  onReject?: () => void;
}

const getStatusColor = (status: LoanRequest['status'], colors: any) => {
  switch (status) {
    case 'approved':
      return colors.success;
    case 'rejected':
      return colors.error;
    case 'cancelled':
      return colors.gray;
    default:
      return colors.warning;
  }
};

const getStatusIcon = (status: LoanRequest['status']) => {
  switch (status) {
    case 'approved':
      return 'check-circle';
    case 'rejected':
      return 'cancel';
    case 'cancelled':
      return 'block';
    default:
      return 'schedule';
  }
};

export default function IncomingLoanRequestItem({ 
  loanRequest, 
  onPress, 
  onAccept, 
  onReject 
}: IncomingLoanRequestProps) {
  const { colors } = useTheme();
  
  const nextPayment = loanRequest.repaymentSchedule?.find(payment => !payment.isPaid);
  const nextPaymentDate = nextPayment ? new Date(nextPayment.dueDate).toLocaleDateString() : null;
  const isPending = loanRequest.status === 'pending';
  
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: colors.text }]}>
            {formatCurrency(loanRequest.amount)}
          </Text>
          <Text style={[styles.date, { color: colors.gray }]}>
            Requested on {new Date(loanRequest.requestDate).toLocaleDateString()}
          </Text>
        </View>
        <MaterialIcons 
          name={getStatusIcon(loanRequest.status)} 
          size={24} 
          color={getStatusColor(loanRequest.status, colors)} 
        />
      </View>

      <View style={styles.details}>
        <Text style={[styles.detailText, { color: colors.text }]}>
          From: {loanRequest.borrowerId.firstName} {loanRequest.borrowerId.lastName}
        </Text>
        <Text style={[styles.detailText, { color: colors.text }]}>
          Interest: {loanRequest.interestRate}% • Duration: {loanRequest.durationInMonths} months
        </Text>
        <Text style={[styles.detailText, { color: colors.text }]}>
          Receive in: {loanRequest.recipientWalletId.name}
        </Text>
        {loanRequest.borrowerNotes && (
          <Text style={[styles.notes, { color: colors.gray }]} numberOfLines={2}>
            Note: {loanRequest.borrowerNotes}
          </Text>
        )}
      </View>

      {nextPayment && (
        <View style={[styles.paymentInfo, { backgroundColor: colors.card }]}>
          <Text style={[styles.paymentTitle, { color: colors.text }]}>Next Payment</Text>
          <View style={styles.paymentDetails}>
            <Text style={[styles.paymentAmount, { color: colors.primary }]}>
              {formatCurrency(nextPayment.amount)}
            </Text>
            <Text style={[styles.paymentDate, { color: colors.text }]}>
              Due: {nextPaymentDate}
            </Text>
          </View>
        </View>
      )}

      {isPending && (
        <View style={styles.actions}>
          {onAccept && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.success }]}
              onPress={onAccept}
            >
              <Text style={styles.actionButtonText}>Accept</Text>
            </TouchableOpacity>
          )}
          {onReject && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.error }]}
              onPress={onReject}
            >
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  amountContainer: {
    flex: 1,
  },
  amount: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
  details: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4,
  },
  notes: {
    fontSize: 12,
    marginTop: 4,
  },
  paymentInfo: {
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  paymentTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  paymentDate: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});
