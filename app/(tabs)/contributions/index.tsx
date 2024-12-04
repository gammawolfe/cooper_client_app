import React, { useCallback, useState } from 'react';
import { StyleSheet, View, RefreshControl, FlatList, ActivityIndicator, Text, ListRenderItem } from 'react-native';
import { useRouter } from 'expo-router';
import { useContribution } from '@/context/ContributionContextProvider';
import ContributionItem from '@/components/contributionComponent/ContributionItem';
import CreateContributionModal from '@/components/modalComponent/CreateContributionModal';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { useTheme } from '@/context/ThemeContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Contribution } from '@/services/api.contribution.service';

export default function ContributionsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { contributions, isLoading, refreshContributions, createContribution } = useContribution();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshContributions();
    setRefreshing(false);
  }, [refreshContributions]);

  const handleContributionPress = (id: string) => {
    router.push(`/contributions/${id}`);
  };

  const handleCreateContribution = async (data: {
    name: string;
    description: string;
    currency: string;
    fixedContributionAmount: number;
    totalCycles: number;
    cycleLengthInDays: number;
  }) => {
    try {
      await createContribution(data);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Failed to create contribution:', error);
      // TODO: Show error toast
    }
  };

  const renderItem: ListRenderItem<Contribution> = ({ item }) => (
    <ContributionItem
      key={item._id}
      contribution={item}
    />
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.text }]}>
        No contributions yet. Start contributing to a pot!
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        horizontal
        data={contributions}
        renderItem={renderItem}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.contentContainer}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <FloatingActionButton
        icon={<IconSymbol name="plus" size={24} color="#fff" />}
        onPress={() => setIsModalVisible(true)}
      />

      <CreateContributionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleCreateContribution}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});