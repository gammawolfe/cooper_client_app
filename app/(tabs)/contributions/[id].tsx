import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { DraggableMemberList } from '@/components/contribution/DraggableMemberList';

import contributionService from '@/services/api.contribution.service';
import { useTheme } from '@/context/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import AddContributionMemberModal from '@/components/modalComponent/AddContributionMemberModal';
import { useAuth } from '@/context/AuthContextProvider';
import { useContribution } from '@/context/ContributionContextProvider';
import { useTransaction } from '@/context/TransactionContextProvider';
import { formatCurrency, formatDate } from '@/utilities/format';
import { IContact } from '@/types/contact';

export default function ContributionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { activateContribution, deactivateContribution } = useContribution();
  const { getWalletTransactions, walletTransactions, isLoading: isLoadingTransactions } = useTransaction();
  const queryClient = useQueryClient();
  const [isAddMemberModalVisible, setIsAddMemberModalVisible] = useState(false);

  const { data: contribution, isLoading } = useQuery({
    queryKey: ['contribution', id],
    queryFn: () => contributionService.getContribution(id),
  });

  useEffect(() => {
    if (contribution?.walletId?._id) {
      getWalletTransactions(contribution.walletId._id);
    }
  }, [contribution?.walletId?._id]);

  const addMembersMutation = useMutation({
    mutationFn: (contacts: IContact[]) => {
      const validContacts = contacts.filter(contact => contact.email);
      if (validContacts.length === 0) {
        throw new Error('No valid contacts selected. Each contact must have an email address.');
      }
      return contributionService.addMembers(id, validContacts);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contribution', id] });
    },
  });

  const handleAddMembers = (selectedContacts: IContact[]) => {
    addMembersMutation.mutate(selectedContacts, {
      onError: (error) => {
        console.error('Failed to add members:', error);
        Alert.alert(
          'Error',
          'Failed to add members. Please make sure all selected contacts have valid email addresses.'
        );
      },
      onSuccess: () => {
        setIsAddMemberModalVisible(false);
      }
    });
  };

  const handleActivationToggle = async (value: boolean) => {
    if (!contribution) return;

    try {
      if (value) {
        // Check if we have enough members before activating
        if (!contribution.members.length || contribution.members.length < 2) {
          Alert.alert(
            'Cannot Activate',
            'You need at least 2 members to start a contribution cycle.',
            [{ text: 'OK' }]
          );
          return;
        }
        await activateContribution(contribution._id);
      } else {
        await deactivateContribution(contribution._id);
      }
    } catch (error) {
      console.error('Error toggling contribution activation:', error);
      Alert.alert(
        'Error',
        'Failed to update contribution status. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleMemberReorder = (newOrder: any[]) => {
    // Optimistically update the cached data
    queryClient.setQueryData(['contribution', id], (oldData: any) => ({
      ...oldData,
      members: newOrder,
    }));
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!contribution) {
    return (
      <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>Contribution not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isAdmin = user?._id === contribution.adminId._id;

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 80 } 
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.headerCard}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              {contribution.name}
            </Text>
            <Text style={[styles.subtitle, { color: colors.text + '80' }]}>
              {contribution.description || 'No description'}
            </Text>
          </View>

          <View style={styles.amountContainer}>
            <Text style={[styles.amountLabel, { color: colors.text + '80' }]}>
              Fixed Contribution Amount
            </Text>
            <Text style={[styles.amount, { color: colors.primary }]}>
              {formatCurrency(contribution.fixedContributionAmount, contribution.currency)}
            </Text>
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={[styles.infoItem, styles.infoItemBorder]}>
              <Text style={[styles.infoLabel, { color: colors.text + '80' }]}>Cycle</Text>
              <Text style={[styles.infoValue, { color: colors.primary }]}>
                {contribution.currentCycle} of {contribution.totalCycles}
              </Text>
            </View>
            <View style={[styles.infoItem, styles.infoItemBorder]}>
              <Text style={[styles.infoLabel, { color: colors.text + '80' }]}>Length</Text>
              <Text style={[styles.infoValue, { color: colors.primary }]}>
                {contribution.cycleLengthInDays} days
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.text + '80' }]}>Created</Text>
              <Text style={[styles.infoValue, { color: colors.primary }]}>
                {formatDate(contribution.createdAt)}
              </Text>
            </View>
          </View>
        </Card>

        {isAdmin && (
          <Card style={styles.activationCard}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Contribution Status
              </Text>
            </View>
            <View style={styles.activationContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                {contribution?.status === 'active' ? 'Active' : 'Inactive'}
              </Text>
              <Switch
                value={contribution?.status === 'active'}
                onValueChange={handleActivationToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
            <Text style={[styles.helperText, { color: colors.text + '80' }]}>
              {contribution?.status === 'active'
                ? 'Contribution is active and cycles are running'
                : 'Activate to start the contribution cycles'}
            </Text>
          </Card>
        )}

        <Card style={styles.membersCard}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Members ({contribution.members.length})
            </Text>
            {isAdmin && contribution.status !== 'active' && (
              <Button
                variant="secondary"
                onPress={() => setIsAddMemberModalVisible(true)}
                leftIcon={<Ionicons name="person-add" size={20} color={colors.primary} />}
              >
                Add Members
              </Button>
            )}
          </View>

          {!contribution.status && isAdmin && (
            <Text style={[styles.helperText, { color: colors.text + '80', marginBottom: 12 }]}>
              Drag members to set payout order. This order will be locked once the contribution is activated.
            </Text>
          )}

          <DraggableMemberList
            members={contribution.members}
            contributionId={contribution._id}
            isActive={contribution.status === 'active'}
            isAdmin={isAdmin}
            onReorder={handleMemberReorder}
          />
        </Card>

        <Card style={styles.transactionsCard}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Transactions
            </Text>
          </View>
          
          {isLoadingTransactions ? (
            <ActivityIndicator color={colors.primary} style={styles.transactionsLoader} />
          ) : walletTransactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {walletTransactions.map((transaction, index) => (
                <View 
                  key={transaction._id} 
                  style={[
                    styles.transactionItem,
                    index !== walletTransactions.length - 1 && styles.transactionBorder
                  ]}
                >
                  <View style={styles.transactionLeft}>
                    <Text style={[styles.transactionType, { color: colors.text }]}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </Text>
                    <Text style={[styles.transactionDate, { color: colors.text + '80' }]}>
                      {formatDate(transaction.date)}
                    </Text>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text 
                      style={[
                        styles.transactionAmount,
                        { 
                          color: transaction.type === 'deposit' ? colors.success : colors.error 
                        }
                      ]}
                    >
                      {transaction.type === 'deposit' ? '+' : '-'}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </Text>
                    <Text 
                      style={[
                        styles.transactionStatus,
                        { 
                          color: 
                            transaction.status === 'completed' ? colors.success :
                            transaction.status === 'pending' ? colors.warning :
                            colors.error
                        }
                      ]}
                    >
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.noTransactions, { color: colors.text + '80' }]}>
              No transactions yet
            </Text>
          )}
        </Card>
      </ScrollView>

      <AddContributionMemberModal
        visible={isAddMemberModalVisible}
        onClose={() => setIsAddMemberModalVisible(false)}
        onSubmit={handleAddMembers}
        currentMembers={contribution.members.map(member => member.userId._id)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    marginLeft: 4,
  },
  headerCard: {
    padding: 20,
  },
  titleContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  amountContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  amountLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: '600',
  },
  infoCard: {
    padding: 20,
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoItemBorder: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.1)',
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  activationCard: {
    padding: 20,
    marginBottom: 16,
  },
  activationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 14,
    marginTop: 4,
  },
  membersCard: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    opacity: 0.7,
  },
  transactionsCard: {
    padding: 20,
    marginTop: 16,
  },
  transactionsLoader: {
    padding: 20,
  },
  transactionsList: {
    marginTop: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  transactionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  noTransactions: {
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
  },
});