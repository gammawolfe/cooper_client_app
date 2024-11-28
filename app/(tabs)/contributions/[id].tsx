import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import contributionService from '@/services/api.contribution.service';
import { useTheme } from '@/context/ThemeContext';
import { Card } from '@/components/ui/Card';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import AddContributionMemberModal from '@/components/modalComponent/AddContributionMemberModal';
import { useAuth } from '@/context/AuthContextProvider';


export default function ContributionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddMemberModalVisible, setIsAddMemberModalVisible] = useState(false);

  const { data: contribution, isLoading } = useQuery({
    queryKey: ['contribution', id],
    queryFn: () => contributionService.getContribution(id),
  });

  const addMembersMutation = useMutation({
    mutationFn: (memberIds: string[]) => contributionService.addMembers(id, memberIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contribution', id] });
    },
  });

  const handleAddMembers = async (selectedContacts: any[]) => {
    try {
      // Here you would typically match contacts with Cooper app users
      // For now, we'll just pass the contact IDs
      const memberIds = selectedContacts.map(contact => contact.id);
      await addMembersMutation.mutateAsync(memberIds);
    } catch (error) {
      console.error('Failed to add members:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!contribution) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Contribution not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isAdmin = user?._id === contribution.adminId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
                    name={`${member.firstName} ${member.lastName}`}
                    style={styles.memberAvatar}
                  />
                  <View>
                    <Text style={[styles.memberName, { color: colors.text }]}>
                      {member.firstName} {member.lastName}
                    </Text>
                    {member._id === contribution.adminId && (
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
        currentMembers={contribution.members.map(member => member._id)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
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