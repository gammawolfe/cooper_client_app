import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Contribution } from '@/services/api.contribution.service';
import { formatCurrency } from '@/utilities/format';
import { router } from 'expo-router';

interface ContributionItemProps {
  contribution: Contribution;
}

export default function ContributionItem({ contribution }: ContributionItemProps) {
  const { colors } = useTheme();

  if (!contribution) {
    console.warn('ContributionItem: No contribution data provided');
    return null;
  }

  // Ensure all required fields are present
  if (!contribution._id || !contribution.name || !contribution.currency || 
      typeof contribution.fixedContributionAmount !== 'number' || 
      typeof contribution.currentCycle !== 'number' || 
      typeof contribution.totalCycles !== 'number' ||
      !Array.isArray(contribution.members)) {
    console.error('ContributionItem: Invalid contribution data:', contribution);
    return null;
  }

  const progressPercentage = Math.round((contribution.completedCycles / contribution.totalCycles) * 100);

  const handleContributionPress = () => {
    console.log('ContributionItem: Navigating to contribution:', contribution._id);
    router.push(`/(tabs)/contributions/${contribution._id}`);
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card }]} 
      onPress={handleContributionPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {contribution.name}
        </Text>
        <Text style={[styles.amount, { color: colors.primary }]}>
          {formatCurrency(contribution.fixedContributionAmount, contribution.currency)}
        </Text>
        <View style={styles.footer}>
          <Text style={[styles.progress, { color: colors.text }]}>
            Cycle {contribution.currentCycle}/{contribution.totalCycles}
          </Text>
          <Text style={[styles.members, { color: colors.text }]}>
            {contribution.members.length} members
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: colors.primary,
                width: `${progressPercentage}%`
              }
            ]} 
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    width: 180,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 0,
  },
  content: {
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progress: {
    fontSize: 12,
    fontWeight: '500',
  },
  members: {
    fontSize: 12,
    opacity: 0.7,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
