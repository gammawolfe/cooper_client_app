import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { format } from 'date-fns';
import { useTheme } from '@/context/ThemeContext';
import { Card } from '../ui/Card';
import { formatUSD } from '@/utilities/format';

interface RepaymentScheduleProps {
  schedule: Array<{
    dueDate: string;
    amount: number;
    isPaid: boolean;
    _id: string;
  }>;
}

export function RepaymentSchedule({ schedule }: RepaymentScheduleProps) {
  const { colors } = useTheme();

  return (
    <Card style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Repayment Schedule</Text>
      
      {schedule.map((payment, index) => (
        <View 
          key={payment._id} 
          style={[
            styles.paymentRow,
            index !== schedule.length - 1 && styles.borderBottom,
            { borderBottomColor: colors.border }
          ]}
        >
          <View>
            <Text style={[styles.date, { color: colors.text }]}>
              {format(new Date(payment.dueDate), 'MMM d, yyyy')}
            </Text>
            <Text style={[styles.installment, { color: colors.textSecondary }]}>
              Installment {index + 1}
            </Text>
          </View>

          <View style={styles.rightSection}>
            <Text style={[styles.amount, { color: colors.text }]}>
              {formatUSD(payment.amount)}
            </Text>
            <View 
              style={[
                styles.statusBadge,
                { backgroundColor: payment.isPaid ? colors.success : colors.warning }
              ]}
            >
              <Text style={styles.statusText}>
                {payment.isPaid ? 'PAID' : 'PENDING'}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  borderBottom: {
    borderBottomWidth: 1,
  },
  date: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  installment: {
    fontSize: 14,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});
