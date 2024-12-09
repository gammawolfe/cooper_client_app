import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';

import contributionService from '@/services/api.contribution.service';
import { useTheme } from '@/context/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import AddContributionMemberModal from '@/components/modalComponent/AddContributionMemberModal';
import { useAuth } from '@/context/AuthContextProvider';
import { useContribution } from '@/context/ContributionContextProvider';
import { formatCurrency, formatDate } from '@/utilities/format';
import { IContact } from '@/types/contact';

export default function ContributionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { activateContribution, deactivateContribution } = useContribution();
  const queryClient = useQueryClient();
  const [isAddMemberModalVisible, setIsAddMemberModalVisible] = useState(false);

  const { data: contribution, isLoading } = useQuery({
    queryKey: ['contribution', id],
    queryFn: () => contributionService.getContribution(id),
  });

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
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.headerCard}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {contribution.name}
            </Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>
              {contribution.description || 'No description'}
            </Text>
          </View>

          <View style={styles.amountContainer}>
            <Text style={[styles.amountLabel, { color: colors.text + '80' }]}>
              Fixed Contribution Amount
            </Text>
            <Text style={[styles.amount, { color: colors.text }]}>
              {formatCurrency(contribution.fixedContributionAmount, contribution.currency)}
            </Text>
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.text + '80' }]}>Cycle</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {contribution.currentCycle} of {contribution.totalCycles}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.text + '80' }]}>Length</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {contribution.cycleLengthInDays} days
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.text + '80' }]}>Created</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
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
                {contribution?.isActive ? 'Active' : 'Inactive'}
              </Text>
              <Switch
                value={contribution?.isActive || false}
                onValueChange={handleActivationToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
            <Text style={[styles.helperText, { color: colors.text + '80' }]}>
              {contribution?.isActive
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
            {isAdmin && (
              <Button
                variant="secondary"
                onPress={() => setIsAddMemberModalVisible(true)}
                leftIcon={<Ionicons name="person-add" size={20} color={colors.primary} />}
              >
                Add Members
              </Button>
            )}
          </View>

          <View style={styles.membersList}>
            {contribution.members.map((member, index) => (
              <View 
                key={member._id} 
                style={[
                  styles.memberItem,
                  index !== contribution.members.length - 1 && styles.memberItemBorder
                ]}
              >
                <View style={styles.memberInfo}>
                  <Avatar
                    size={40}
                    name={member.role === 'admin' ? 
                      `${contribution.adminId.firstName} ${contribution.adminId.lastName}` : 
                      member.userId.firstName && member.userId.lastName ?
                      `${member.userId.firstName} ${member.userId.lastName}` :
                      'Unknown User'
                    }
                    style={styles.memberAvatar}
                  />
                  <View>
                    <Text style={[styles.memberName, { color: colors.text }]}>
                      {member.role === 'admin' ? 
                        `${contribution.adminId.firstName} ${contribution.adminId.lastName}` :
                        member.userId.firstName && member.userId.lastName ?
                        `${member.userId.firstName} ${member.userId.lastName}` :
                        'Unknown User'
                      }
                    </Text>
                    {member.role === 'admin' && (
                      <Text style={[styles.adminBadge, { color: colors.primary }]}>
                        Admin
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>

      <AddContributionMemberModal
        visible={isAddMemberModalVisible}
        onClose={() => setIsAddMemberModalVisible(false)}
        onSubmit={handleAddMembers}
        currentMembers={contribution.members.map(member => member.userId)}
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
    paddingBottom: 24,
  },
  headerCard: {
    padding: 20,
    marginBottom: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  amountContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  amountLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
  },
  infoCard: {
    padding: 20,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
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
  membersList: {
    marginTop: 8,
  },
  memberItem: {
    paddingVertical: 12,
  },
  memberItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    marginRight: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  adminBadge: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
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
});