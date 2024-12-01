import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useWallet } from '@/context/WalletContextProvider';
import { useContribution } from '@/context/ContributionContextProvider';
import { Card } from '@/components/ui/Card';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatCurrency } from '@/utils/currency';
import { Transaction } from '@/services/api.wallet.service';

type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y';

interface TimeRangeConfig {
  days: number;
  label: string;
}

const TIME_RANGE_CONFIG: Record<TimeRange, TimeRangeConfig> = {
  '1W': { days: 7, label: '1 Week' },
  '1M': { days: 30, label: '1 Month' },
  '3M': { days: 90, label: '3 Months' },
  '6M': { days: 180, label: '6 Months' },
  '1Y': { days: 365, label: '1 Year' },
};

export default function TrendsScreen() {
  const { colors } = useTheme();
  const { wallets } = useWallet();
  const { contributions } = useContribution();
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('1M');

  const timeRanges: TimeRange[] = ['1W', '1M', '3M', '6M', '1Y'];

  // Calculate the start date based on selected time range
  const startDate = useMemo(() => {
    const now = new Date();
    const days = TIME_RANGE_CONFIG[selectedTimeRange].days;
    return new Date(now.setDate(now.getDate() - days));
  }, [selectedTimeRange]);

  // Filter and calculate contribution stats
  const contributionStats = useMemo(() => {
    const filteredContributions = contributions.filter(
      (contribution) => new Date(contribution.createdAt) >= startDate
    );

    const completedContributions = filteredContributions.filter(
      (contribution) => contribution.completedCycles === contribution.totalCycles
    );

    const completionRate = filteredContributions.length > 0
      ? (completedContributions.length / filteredContributions.length) * 100
      : 0;

    const activeContributions = filteredContributions.filter(
      (contribution) => contribution.completedCycles < contribution.totalCycles
    );

    return {
      total: activeContributions.length,
      completionRate: Math.round(completionRate),
    };
  }, [contributions, startDate]);

  // Calculate spending stats
  const spendingStats = useMemo(() => {
    let totalSpent = 0;
    
    // Sum up all negative transactions from wallets within the time range
    wallets.forEach(wallet => {
      const recentTransactions = (wallet.transactions as Transaction[])?.filter(
        (tx) => new Date(tx.timestamp) >= startDate && tx.type === 'debit'
      ) || [];

      const spent = recentTransactions.reduce((sum, tx) => {
        return sum + Math.abs(tx.amount);
      }, 0);

      totalSpent += spent;
    });

    const monthlyAverage = totalSpent / (TIME_RANGE_CONFIG[selectedTimeRange].days / 30);

    return {
      totalSpent,
      monthlyAverage: Math.round(monthlyAverage * 100) / 100,
    };
  }, [wallets, selectedTimeRange, startDate]);

  // Calculate wallet distribution
  const walletDistribution = useMemo(() => {
    const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
    
    return wallets.map(wallet => ({
      ...wallet,
      percentage: totalBalance > 0 ? (wallet.balance / totalBalance) * 100 : 0,
    }));
  }, [wallets]);

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      {timeRanges.map((range) => (
        <TouchableOpacity
          key={range}
          onPress={() => setSelectedTimeRange(range)}
          style={[
            styles.timeRangeButton,
            {
              backgroundColor:
                selectedTimeRange === range ? colors.primary : colors.card,
            },
          ]}
        >
          <Text
            style={[
              styles.timeRangeText,
              {
                color: selectedTimeRange === range ? colors.card : colors.text,
              },
            ]}
          >
            {range}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSpendingOverview = () => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Spending Overview
        </Text>
        <MaterialCommunityIcons
          name="chart-timeline-variant"
          size={24}
          color={colors.primary}
        />
      </View>
      <View style={styles.spendingStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total Spent
          </Text>
          <Text style={[styles.statAmount, { color: colors.error }]}>
            {formatCurrency(-spendingStats.totalSpent, 'GBP')}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Average/Month
          </Text>
          <Text style={[styles.statAmount, { color: colors.text }]}>
            {formatCurrency(spendingStats.monthlyAverage, 'GBP')}
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderContributionStats = () => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Contribution Stats
        </Text>
        <MaterialCommunityIcons
          name="chart-arc"
          size={24}
          color={colors.primary}
        />
      </View>
      <View style={styles.spendingStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Completion Rate
          </Text>
          <Text style={[styles.statAmount, { color: colors.success }]}>
            {contributionStats.completionRate}%
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Active Contributions
          </Text>
          <Text style={[styles.statAmount, { color: colors.text }]}>
            {contributionStats.total}
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderCurrencyDistribution = () => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Currency Distribution
        </Text>
        <MaterialCommunityIcons
          name="chart-pie"
          size={24}
          color={colors.primary}
        />
      </View>
      <View style={styles.currencyList}>
        {walletDistribution.map((wallet) => (
          <View key={wallet._id} style={styles.currencyItem}>
            <View style={styles.currencyInfo}>
              <Text style={[styles.currencyCode, { color: colors.text }]}>
                {wallet.currency}
              </Text>
              <Text
                style={[styles.currencyBalance, { color: colors.textSecondary }]}
              >
                {formatCurrency(wallet.balance, wallet.currency)}
              </Text>
            </View>
            <View
              style={[
                styles.distributionBar,
                { backgroundColor: colors.card },
              ]}
            >
              <View
                style={[
                  styles.distributionFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${wallet.percentage}%`,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </Card>
  );

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerTitle: 'Trends',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderTimeRangeSelector()}
        {renderSpendingOverview()}
        {renderContributionStats()}
        {renderCurrencyDistribution()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  spendingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statAmount: {
    fontSize: 20,
    fontWeight: '600',
  },
  currencyList: {
    gap: 16,
  },
  currencyItem: {
    gap: 8,
  },
  currencyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '500',
  },
  currencyBalance: {
    fontSize: 14,
  },
  distributionBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    borderRadius: 4,
  },
});