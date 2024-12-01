import React from 'react';
import { StyleSheet, ActivityIndicator, Text, View, FlatList, ListRenderItem } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { LoanRequest } from '@/services/api.loan.service';
import IncomingLoanRequestItem from './IncomingLoanRequestItem';
import OutgoingLoanRequestItem from './OutgoingLoanRequestItem';

interface LoanRequestListProps {
  incomingRequests: LoanRequest[];
  outgoingRequests: LoanRequest[];
  isLoading: boolean;
  onLoanRequestPress: (id: string) => void;
  onAcceptRequest?: (id: string) => void;
  onRejectRequest?: (id: string) => void;
  onCancelRequest?: (id: string) => void;
}

export default function LoanRequestList({ 
  incomingRequests = [],
  outgoingRequests = [],
  isLoading, 
  onLoanRequestPress,
  onAcceptRequest,
  onRejectRequest,
  onCancelRequest,
}: LoanRequestListProps) {
  const { colors } = useTheme();

  const renderIncomingItem: ListRenderItem<LoanRequest> = ({ item }) => (
    <IncomingLoanRequestItem
      key={item._id}
      loanRequest={item}
      onPress={() => onLoanRequestPress(item._id)}
      onAccept={() => onAcceptRequest?.(item._id)}
      onReject={() => onRejectRequest?.(item._id)}
    />
  );

  const renderOutgoingItem: ListRenderItem<LoanRequest> = ({ item }) => (
    <OutgoingLoanRequestItem
      key={item._id}
      loanRequest={item}
      onPress={() => onLoanRequestPress(item._id)}
      onCancel={() => onCancelRequest?.(item._id)}
    />
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.text }]}>
        No loan requests
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

  const hasIncomingRequests = Array.isArray(incomingRequests) && incomingRequests.length > 0;
  const hasOutgoingRequests = Array.isArray(outgoingRequests) && outgoingRequests.length > 0;
  const hasNoRequests = !hasIncomingRequests && !hasOutgoingRequests;

  return (
    <View>
      {hasIncomingRequests && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Incoming Requests</Text>
          <FlatList
            data={incomingRequests}
            renderItem={renderIncomingItem}
            ListEmptyComponent={null}
            contentContainerStyle={styles.contentContainer}
            keyExtractor={(item) => item._id}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      )}

      {hasOutgoingRequests && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Outgoing Requests</Text>
          <FlatList
            data={outgoingRequests}
            renderItem={renderOutgoingItem}
            ListEmptyComponent={null}
            contentContainerStyle={styles.contentContainer}
            keyExtractor={(item) => item._id}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      )}

      {hasNoRequests && <ListEmptyComponent />}
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  },
  section: {
    marginBottom: 16,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    opacity: 0.8,
  },
  separator: {
    height: 12,
  },
});
