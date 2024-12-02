import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LoanRequest } from '@/services/api.loan.service';
import { useTheme } from '@/context/ThemeContext';
import { formatCurrency } from '@/utils/currency';

interface LoanRequestItemProps {
  loanRequest: LoanRequest;
  onPress: () => void;
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

export default function LoanRequestItem({ loanRequest, onPress }: LoanRequestItemProps) {
  const { colors } = useTheme();
  
  const nextPayment = loanRequest.repaymentSchedule?.find(payment => !payment.isPaid);
  const nextPaymentDate = nextPayment ? new Date(nextPayment.dueDate).toLocaleDateString() : null;
  
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
          From: {loanRequest.lenderId.firstName} {loanRequest.lenderId.lastName}
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

      <View style={styles.footer}>
        <View>
          <Text style={[styles.totalLabel, { color: colors.gray }]}>Total Repayment</Text>
          <Text style={[styles.totalAmount, { color: colors.text }]}>
            {formatCurrency(loanRequest.totalRepaymentAmount)}
          </Text>
        </View>
        <Text style={[styles.status, { color: getStatusColor(loanRequest.status, colors) }]}>
          {loanRequest.status.charAt(0).toUpperCase() + loanRequest.status.slice(1)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
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
    marginRight: 8,
  },
  amount: {
    fontSize: 24,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    marginTop: 4,
  },
  details: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
  paymentInfo: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});
