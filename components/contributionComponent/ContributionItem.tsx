import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Contribution } from '@/services/api.contribution.service';
import { formatCurrency } from '@/utilities/format';
import { router } from 'expo-router';
import { Entypo } from '@expo/vector-icons';

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
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {contribution.name}
            </Text>
            <Text style={[styles.description, { color: colors.text + '99' }]} numberOfLines={2}>
              {contribution.description || 'No description'}
            </Text>
          </View>
          <View style={styles.cycleContainer}>
            <Entypo 
              name="circular-graph" 
              size={65} 
              color={colors.primary + '30'} 
              style={styles.cycleIcon} 
            />
            <View style={styles.cycleContent}>
              <Text style={[styles.cycleNumber, { color: colors.primary }]}>
                {contribution.currentCycle}
              </Text>
              <View style={styles.cycleTextContainer}>
                <Text style={[styles.cycleDivider, { color: colors.text + '60' }]}>/</Text>
                <Text style={[styles.totalCycles, { color: colors.text + '80' }]}>
                  {contribution.totalCycles}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={[styles.amount, { color: colors.primary }]}>
          {formatCurrency(contribution.fixedContributionAmount, contribution.currency)}
          <Text style={styles.cycleLength}> / {contribution.cycleLengthInDays} days</Text>
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.text + '80' }]}>Status</Text>
            <Text style={[styles.infoValue, { color: contribution.status === 'active' ? colors.primary : colors.text }]}>
              {contribution.status.toUpperCase()}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.text + '80' }]}>Members</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{contribution.members.length}</Text>
          </View>
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
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  cycleContainer: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cycleIcon: {
    position: 'absolute',
  },
  cycleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  cycleTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginLeft: 2,
  },
  cycleNumber: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: -2,
  },
  cycleDivider: {
    fontSize: 13,
    fontWeight: '400',
    marginHorizontal: 2,
  },
  totalCycles: {
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cycleLength: {
    fontSize: 12,
    fontWeight: 'normal',
    opacity: 0.7,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
