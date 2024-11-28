import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LoanRequest } from '@/services/api.loan.service';
import { useTheme } from '@/context/ThemeContext';

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
  
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: colors.text }]}>
            {loanRequest.amount} {loanRequest.currency}
          </Text>
          <Text style={[styles.date, { color: colors.gray }]}>
            {new Date(loanRequest.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <MaterialIcons 
          name={getStatusIcon(loanRequest.status)} 
          size={24} 
          color={getStatusColor(loanRequest.status, colors)} 
        />
      </View>
      <Text style={[styles.description, { color: colors.gray }]} numberOfLines={2}>
        {loanRequest.description}
      </Text>
      <View style={styles.footer}>
        <Text style={[styles.requestInfo, { color: colors.text }]}>
          From: {loanRequest.requestedFrom}
        </Text>
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
    fontSize: 20,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestInfo: {
    fontSize: 14,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
});
