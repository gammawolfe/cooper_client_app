import React, { useCallback, useState } from 'react';
import { StyleSheet, View, RefreshControl } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import LoanRequestList from '@/components/loan-requestComponent/LoanRequestList';
import CreateLoanRequestModal from '@/components/modalComponent/CreateLoanRequestModal';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { useTheme } from '@/context/ThemeContext';
import loanService from '@/services/api.loan.service';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function LoansScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: incomingRequests = [], refetch: refetchIncoming, isLoading: isLoadingIncoming } = useQuery({
    queryKey: ['incomingLoanRequests'],
    queryFn: () => loanService.getUserLoanRequestsToUser(),
  });

  const { data: outgoingRequests = [], refetch: refetchOutgoing, isLoading: isLoadingOutgoing } = useQuery({
    queryKey: ['outgoingLoanRequests'],
    queryFn: () => loanService.getUserLoanRequestsFromUser(),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchIncoming(), refetchOutgoing()]);
    setRefreshing(false);
  }, [refetchIncoming, refetchOutgoing]);

  const handleLoanRequestPress = (id: string) => {
    router.push(`/loans/${id}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <LoanRequestList
          incomingRequests={incomingRequests}
          outgoingRequests={outgoingRequests}
          onLoanRequestPress={handleLoanRequestPress}
          isLoading={isLoadingIncoming || isLoadingOutgoing}
        />
      </ScrollView>

      <FloatingActionButton
        onPress={() => setIsModalVisible(true)}
        icon={<IconSymbol name="plus" color={colors.text} size={24} />}
      />

      <CreateLoanRequestModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={async (loanRequestData) => {
          setIsModalVisible(false);
          await refetchOutgoing();
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