import React, { useCallback, useState } from 'react';
import { StyleSheet, View, RefreshControl } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import ContributionList from '@/components/contributionComponent/ContributionList';
import CreateContributionModal from '@/components/modalComponent/CreateContributionModal';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { useTheme } from '@/context/ThemeContext';
import contributionService from '@/services/api.contribution.service';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ContributionsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: contributions = [], refetch, isLoading } = useQuery({
    queryKey: ['contributions'],
    queryFn: () => contributionService.getUserContributions(),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleContributionPress = (id: string) => {
    router.push(`/contributions/${id}`);
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
        onSubmit={async (contributionData) => {
          setIsModalVisible(false);
          await refetch();
        }}
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