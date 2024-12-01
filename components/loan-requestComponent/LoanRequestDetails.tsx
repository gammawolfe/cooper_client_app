import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { LoanRequest } from '@/services/api.loan.service';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/currency';

interface LoanRequestDetailsProps {
  loanRequest: LoanRequest;
}

export function LoanRequestDetails({ loanRequest }: LoanRequestDetailsProps) {
  const { colors } = useTheme();
  const nextPayment = loanRequest.repaymentSchedule?.find(payment => !payment.isPaid);
  const nextPaymentDate = nextPayment ? new Date(nextPayment.dueDate).toLocaleDateString() : null;

  return (
    <View style={styles.wrapper}>
      {/* Main Details Card */}
      <Card style={styles.mainCard}>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCurrency(loanRequest.amount)}
        </Text>
        
        <View style={styles.statusContainer}>
          <Text style={[styles.status, { 
            color: colors.text,
            backgroundColor: loanRequest.status === 'approved' ? colors.success + '20' : 
                           loanRequest.status === 'declined' ? colors.error + '20' : 
                           colors.warning + '20',
            borderColor: loanRequest.status === 'approved' ? colors.success : 
                        loanRequest.status === 'declined' ? colors.error : 
                        colors.warning,
          }]}>
            {loanRequest.status.charAt(0).toUpperCase() + loanRequest.status.slice(1)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={[styles.label, { color: colors.icon }]}>Borrower</Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {loanRequest.borrowerId.firstName} {loanRequest.borrowerId.lastName}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.label, { color: colors.icon }]}>Lender</Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {loanRequest.lenderId.firstName} {loanRequest.lenderId.lastName}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.label, { color: colors.icon }]}>Interest Rate</Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {loanRequest.interestRate}%
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.label, { color: colors.icon }]}>Duration</Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {loanRequest.durationInMonths} months
            </Text>
          </View>
        </View>
      </Card>

      {/* Payment Details Card */}
      <Card style={styles.paymentCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Details</Text>
        
        <View style={styles.paymentDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: colors.icon }]}>Total Repayment</Text>
            <Text style={[styles.value, { color: colors.text, fontWeight: '600' }]}>
              {formatCurrency(loanRequest.totalRepaymentAmount)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: colors.icon }]}>Recipient Wallet</Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {loanRequest.recipientWalletId.name}
            </Text>
          </View>
        </View>

        {nextPayment && (
          <View style={[styles.nextPaymentContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.nextPaymentLabel, { color: colors.text }]}>Next Payment</Text>
            <View style={styles.nextPaymentDetails}>
              <Text style={[styles.nextPaymentAmount, { color: colors.primary }]}>
                {formatCurrency(nextPayment.amount)}
              </Text>
              <Text style={[styles.nextPaymentDate, { color: colors.text }]}>
                Due: {nextPaymentDate}
              </Text>
            </View>
          </View>
        )}
      </Card>

      {/* Notes Card */}
      {loanRequest.borrowerNotes && (
        <Card style={styles.notesCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notes</Text>
          <Text style={[styles.notes, { color: colors.text }]}>
            {loanRequest.borrowerNotes}
          </Text>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 16,
  },
  mainCard: {
    padding: 16,
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
  },
  paymentCard: {
    padding: 16,
  },
  notesCard: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  paymentDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
  },
  nextPaymentContainer: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  nextPaymentLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  nextPaymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextPaymentAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  nextPaymentDate: {
    fontSize: 14,
  },
  notes: {
    fontSize: 14,
    lineHeight: 20,
  },
});
