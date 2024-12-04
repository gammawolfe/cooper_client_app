import React from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '@/utilities/format';
import { Loan } from '@/services/api.loan.service';
import { ThemedText } from '@/components/ThemedText';

interface LoanItemProps {
  loan: Loan;
  onPress?: (id: string) => void;
  isGiven?: boolean;
  colors: {
    text: string;
    primary: string;
    surface: string;
  };
}

export function LoanItem({ 
  loan, 
  onPress,
  isGiven = false,
  colors
}: LoanItemProps) {
  const status = loan.status.charAt(0).toUpperCase() + loan.status.slice(1);
  const userToShow = isGiven ? loan.borrowerId : loan.lenderId;

  return (
    <TouchableOpacity 
      style={[styles.loanItem, { backgroundColor: colors.surface }]}
      onPress={() => onPress?.(loan._id)}
    >
      <View style={styles.loanContent}>
        <View style={styles.loanHeader}>
          <Ionicons 
            name={isGiven ? 'arrow-up' : 'arrow-down'} 
            size={20} 
            color={colors.primary} 
          />
          <ThemedText style={[styles.loanTitle, { color: colors.text }]}>
            {isGiven ? 'Given to' : 'Received from'} {userToShow.firstName} {userToShow.lastName}
          </ThemedText>
        </View>

        <View style={styles.loanDetails}>
          <View style={styles.amountContainer}>
            <ThemedText style={[styles.amount, { color: colors.text }]}>
              {formatCurrency(loan.amount, 'GBP')}
            </ThemedText>
            <ThemedText style={[styles.interestRate, { color: colors.text }]}>
              {loan.interestRate}% Interest
            </ThemedText>
          </View>

          <View style={styles.statusContainer}>
            <ThemedText style={[styles.status, { color: colors.primary }]}>
              {status}
            </ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  loanItem: {
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
    width: 300,
  },
  loanContent: {
    padding: 16,
  },
  loanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  loanTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loanDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  amountContainer: {
    flex: 1,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  interestRate: {
    fontSize: 14,
    opacity: 0.7,
  },
  statusContainer: {
    marginLeft: 12,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
});