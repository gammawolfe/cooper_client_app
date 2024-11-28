import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { LoanRequest } from '@/services/api.loan.service';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/formatters';

interface LoanRequestDetailsProps {
  loanRequest: LoanRequest;
}

export function LoanRequestDetails({ loanRequest }: LoanRequestDetailsProps) {
  const { colors } = useTheme();

  return (
    <Card>
      <View style={styles.container}>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCurrency(loanRequest.amount, loanRequest.currency)}
        </Text>
        
        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.text }]}>Status</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {loanRequest.status.charAt(0).toUpperCase() + loanRequest.status.slice(1)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.text }]}>Requested From</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {loanRequest.requestedFrom}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.text }]}>Description</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {loanRequest.description}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.text }]}>Created At</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {new Date(loanRequest.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
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
});
