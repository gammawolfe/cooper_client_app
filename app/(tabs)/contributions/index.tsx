import React, { useCallback, useState } from 'react';
import { StyleSheet, View, RefreshControl } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useContribution } from '@/context/ContributionContextProvider';
import ContributionList from '@/components/contributionComponent/ContributionList';
import CreateContributionModal from '@/components/modalComponent/CreateContributionModal';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { useTheme } from '@/context/ThemeContext';
import { IconSymbol } from '@/components/ui/IconSymbol';

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

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ContributionList
          contributions={contributions}
          onContributionPress={handleContributionPress}
          isLoading={isLoading}
        />
      </ScrollView>

      <FloatingActionButton
        onPress={() => setIsModalVisible(true)}
        icon={<IconSymbol name="plus" color={colors.text} size={24} />}
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
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
});