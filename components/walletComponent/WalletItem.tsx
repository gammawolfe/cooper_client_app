import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Wallet } from '@/services/api.wallet.service';
import { formatCurrency } from '@/utilities/format';

interface WalletItemProps {
  wallet: Wallet;
  width: number;
  isActive: boolean;
}

type GradientColors = readonly [string, string];

export default function WalletItem({ wallet, width, isActive }: WalletItemProps) {
  const gradientColors = useMemo(() => {
    const getGradientColors = (currency: string): GradientColors => {
      switch (currency.toUpperCase()) {
        case 'USD':
          return ['#2ecc71', '#27ae60'];
        case 'EUR':
          return ['#3498db', '#2980b9'];
        case 'GBP':
          return ['#9b59b6', '#8e44ad'];
        case 'AUD':
          return ['#e67e22', '#d35400'];
        default:
          return ['#34495e', '#2c3e50'];
      }
    };
    return getGradientColors(wallet.currency);
  }, [wallet.currency]);

  const formattedBalance = useMemo(() => 
    formatCurrency(wallet.balance, wallet.currency),
    [wallet.balance, wallet.currency]
  );

  const formattedDate = useMemo(() => 
    new Date(wallet.createdAt).toLocaleDateString(),
    [wallet.createdAt]
  );

  const sourceIcon = wallet.source === 'user' ? 'account-balance-wallet' : 'group';

  const handlePress = () => {
    router.push(`/wallets/${wallet._id}`);
  };

  return (
    <TouchableOpacity 
      style={[
        styles.touchable,
        { width: width }
      ]} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.sourceIndicator}>
              <MaterialIcons name={sourceIcon} size={16} color="#fff" />
              <ThemedText style={styles.sourceText}>
                {wallet.source === 'user' ? 'Personal' : 'Contribution'}
              </ThemedText>
            </View>
            <ThemedText style={styles.currencyLabel}>
              {wallet.currency.toUpperCase()}
            </ThemedText>
          </View>

          <ThemedText style={styles.name} numberOfLines={1}>
            {wallet.name}
          </ThemedText>

          <View style={styles.balanceContainer}>
            <ThemedText style={styles.balanceLabel}>Available Balance</ThemedText>
            <ThemedText style={styles.balance}>
              {formattedBalance}
            </ThemedText>
          </View>

          <View style={styles.footer}>
            <View style={styles.dateContainer}>
              <MaterialIcons name="schedule" size={12} color="rgba(255,255,255,0.6)" />
              <ThemedText style={styles.date}>
                Created {formattedDate}
              </ThemedText>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#fff" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginRight: 16,
    marginVertical: 8,
  },
  gradient: {
    borderRadius: 16,
    height: 180,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sourceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
    marginBottom: 4,
  },
  currencyLabel: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  balanceContainer: {
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  balanceLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  balance: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.8,
  },
  date: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
    opacity: 0.8,
  },
});
