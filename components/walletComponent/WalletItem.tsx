import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { Wallet } from '@/services/api.wallet.service';
import { formatCurrency } from '@/utils/currency';

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
          return ['#2ecc71', '#27ae60'] as const;
        case 'EUR':
          return ['#3498db', '#2980b9'] as const;
        case 'GBP':
          return ['#9b59b6', '#8e44ad'] as const;
        case 'AUD':
          return ['#e67e22', '#d35400'] as const;
        default:
          return ['#34495e', '#2c3e50'] as const;
      }
    };
    return getGradientColors(wallet.currency);
  }, [wallet.currency]);

  const handleWalletPress = () => {
    if (!wallet._id) {
      console.error('WalletItem: No wallet ID available');
      return;
    }
    //console.log('WalletItem: handleWalletPress called for wallet:', wallet._id);
    router.push(`/(tabs)/wallets/${wallet._id}`);
  };

  const formattedBalance = useMemo(() => 
    formatCurrency(wallet.balance, wallet.currency),
    [wallet.balance, wallet.currency]
  );

  const formattedDate = useMemo(() => 
    new Date(wallet.createdAt).toLocaleDateString(),
    [wallet.createdAt]
  );

  const sourceIcon = wallet.source === 'user' ? 'account-balance-wallet' : 'group';

  return (
    <TouchableOpacity 
      onPress={handleWalletPress}
      activeOpacity={0.7}
      style={[
        styles.touchable,
        { 
          width: width - 32,
          transform: [{ scale: isActive ? 1 : 0.95 }],
        }
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.sourceIndicator}>
              <MaterialIcons name={sourceIcon} size={16} color="#fff" />
              <Text style={styles.sourceText}>
                {wallet.source === 'user' ? 'Personal' : 'Contribution'}
              </Text>
            </View>
            <Text style={styles.currencyLabel}>
              {wallet.currency.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.name} numberOfLines={1}>
            {wallet.name}
          </Text>

          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balance}>
              {formattedBalance}
            </Text>
          </View>

          <View style={styles.footer}>
            <MaterialIcons name="schedule" size={12} color="rgba(255,255,255,0.6)" />
            <Text style={styles.date}>
              Created {formattedDate}
            </Text>
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
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: 16,
  },
  container: {
    height: 180,
    borderRadius: 16,
    padding: 20,
    width: '100%',
  },
  content: {
    flex: 1,
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
