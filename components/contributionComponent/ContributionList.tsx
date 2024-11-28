import React from 'react';
import { StyleSheet, ActivityIndicator, Text, View, FlatList, ListRenderItem } from 'react-native';
import { useTheme } from '@react-navigation/native';
import ContributionItem from './ContributionItem';
import { Contribution } from '@/services/api.contribution.service';

interface ContributionListProps {
  contributions: Contribution[];
  isLoading: boolean;
  onContributionPress: (id: string) => void;
}

export default function ContributionList({ 
  contributions, 
  isLoading, 
  onContributionPress 
}: ContributionListProps) {
  const { colors } = useTheme();

  const renderItem: ListRenderItem<Contribution> = ({ item }) => (
    <ContributionItem
      key={item._id}
      contribution={item}
      onPress={() => onContributionPress(item._id)}
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
    <FlatList
      horizontal
      data={contributions}
      renderItem={renderItem}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={styles.contentContainer}
      keyExtractor={(item) => item._id}
      ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
      showsHorizontalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  loadingContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 120,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  separator: {
    width: 12,
  },
});
