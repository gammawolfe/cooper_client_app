import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Wallet } from '@/services/api.wallet.service';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/formatters';

interface WalletSummaryProps {
  wallet: Wallet;
}

export function WalletSummary({ wallet }: WalletSummaryProps) {
  const { colors } = useTheme();

  return (
    <Card style={styles.container}>
      <Text style={[styles.name, { color: colors.text }]}>
        {wallet.name}
      </Text>
      <Text style={[styles.balance, { color: colors.text }]}>
        {formatCurrency(wallet.balance, wallet.currency)}
      </Text>
      <View style={styles.detailsRow}>
        <Text style={[styles.detail, { color: colors.icon }]}>
          {wallet.isDefault ? 'Default Wallet' : wallet.source === 'contribution' ? 'Contribution Wallet' : 'Personal Wallet'}
        </Text>
        <Text style={[styles.detail, { color: colors.icon }]}>
          Created {new Date(wallet.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  balance: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detail: {
    fontSize: 14,
  },
});
