import { StyleSheet, SectionList, RefreshControl, View, Text, ColorValue } from 'react-native';
import { useWallet } from '@/context/WalletContextProvider';
import { useContribution } from '@/context/ContributionContextProvider';
import { useLoan } from '@/context/LoanContextProvider';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContextProvider';
import { useCallback, useState } from 'react';
import { router } from 'expo-router';
import WalletList from '@/components/walletComponent/WalletList';
import ContributionList from '@/components/contributionComponent/ContributionList';
import LoanRequestList from '@/components/loan-requestComponent/LoanRequestList';
import AddButton from '@/components/common/AddButton';
import { RootStackParamList } from '@/types/navigation';
import CreateContributionModal from '@/components/modalComponent/CreateContributionModal';
import CreateWalletModal from '@/components/modalComponent/CreateWalletModal';
import CreateLoanRequestModal from '@/components/modalComponent/CreateLoanRequestModal';
import contributionService from '@/services/api.contribution.service';
import { walletService } from '@/services/api.wallet.service';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateContributionVisible, setIsCreateContributionVisible] = useState(false);
  const [isCreateWalletVisible, setIsCreateWalletVisible] = useState(false);
  const [isCreateLoanRequestVisible, setIsCreateLoanRequestVisible] = useState(false);
  
  const { wallets, isLoading: walletsLoading, refreshWallets } = useWallet();
  const { contributions, isLoading: contributionsLoading, refreshContributions } = useContribution();
  const { 
    incomingRequests, 
    outgoingRequests, 
    isLoading: loansLoading, 
    refreshLoanRequests 
  } = useLoan();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refreshWallets(),
      refreshContributions(),
      refreshLoanRequests()
    ]);
    setRefreshing(false);
  }, []);

  const navigate = (route: keyof RootStackParamList, params?: any) => {
    router.push({ pathname: route as any, params });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleCreateContribution = async (contributionData: {
    name: string;
    description: string;
    currency: string;
    fixedContributionAmount: number;
    totalCycles: number;
    cycleLengthInDays: number;
  }) => {
    try {
      await contributionService.createContribution(contributionData);
      await refreshContributions();
      setIsCreateContributionVisible(false);
    } catch (error) {
      console.error('Failed to create contribution:', error);
      // TODO: Show error toast
    }
  };

  const handleCreateWallet = async (walletData: {
    name: string;
    currency: string;
    isDefault?: boolean;
  }): Promise<boolean> => {
    try {
      await walletService.createWallet(walletData);
      await refreshWallets();
      setIsCreateWalletVisible(false);
      return true;
    } catch (error) {
      console.error('Failed to create wallet:', error);
      throw error; // Let the modal handle the error display
    }
  };

  const handleCreateLoanRequest = async (loanRequestData: {
    amount: number;
    currency: string;
    requestedFrom: string;
    description: string;
  }) => {
    try {
      // TODO: Implement loan request service
      // await loanService.createLoanRequest(loanRequestData);
      await refreshLoanRequests();
      setIsCreateLoanRequestVisible(false);
    } catch (error) {
      console.error('Failed to create loan request:', error);
      // TODO: Show error toast
    }
  };

  const handleContributionPress = (id: string) => {
    router.push(`/contributions/${id}`);
  };

  const handleLoanRequestPress = (id: string) => {
    router.push(`/loans/${id}`);
  };

  const handleAcceptLoanRequest = async (id: string) => {
    try {
      // TODO: Implement accept loan request
      console.info('Accept loan request:', id);
      await refreshLoanRequests();
    } catch (error) {
      console.error('Failed to accept loan request:', error);
      // TODO: Show error toast
    }
  };

  const handleRejectLoanRequest = async (id: string) => {
    try {
      // TODO: Implement reject loan request
      console.info('Reject loan request:', id);
      await refreshLoanRequests();
    } catch (error) {
      console.error('Failed to reject loan request:', error);
      // TODO: Show error toast
    }
  };

  const handleCancelLoanRequest = async (id: string) => {
    try {
      // TODO: Implement cancel loan request
      console.info('Cancel loan request:', id);
      await refreshLoanRequests();
    } catch (error) {
      console.error('Failed to cancel loan request:', error);
      // TODO: Show error toast
    }
  };

  const sections = [
    {
      title: 'Wallets',
      data: [{ type: 'wallets' }],
      renderItem: () => (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>My Wallets</Text>
            <AddButton onPress={() => setIsCreateWalletVisible(true)} />
          </View>
          <WalletList wallets={wallets} isLoading={walletsLoading} />
        </View>
      )
    },
    {
      title: 'Contributions',
      data: [{ type: 'contributions' }],
      renderItem: () => (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>My Contributions</Text>
            <AddButton onPress={() => setIsCreateContributionVisible(true)} />
          </View>
          <ContributionList 
            contributions={contributions} 
            isLoading={contributionsLoading} 
            onContributionPress={handleContributionPress}
          />
        </View>
      )
    },
    {
      title: 'Loan Requests',
      data: [{ type: 'loanRequests' }],
      renderItem: () => (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Loan Requests</Text>
            <AddButton onPress={() => setIsCreateLoanRequestVisible(true)} />
          </View>
          <LoanRequestList
            incomingRequests={incomingRequests}
            outgoingRequests={outgoingRequests}
            isLoading={loansLoading}
            onLoanRequestPress={handleLoanRequestPress}
            onAcceptRequest={handleAcceptLoanRequest}
            onRejectRequest={handleRejectLoanRequest}
            onCancelRequest={handleCancelLoanRequest}
          />
        </View>
      )
    }
  ];

  console.log("Loan requests in home:", {
    incoming: incomingRequests,
    outgoing: outgoingRequests
  });

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <SectionList
        contentContainerStyle={styles.listContent}
        sections={sections}
        keyExtractor={(item, index) => item.type + index}
        renderSectionHeader={() => null}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.text}
            progressViewOffset={0}
          />
        }
        ListHeaderComponent={() => (
          <View style={[styles.header, { backgroundColor: colors.card }]}>
            <Text style={[styles.greeting, { color: colors.text }]}>{getGreeting()}</Text>
            <Text style={[styles.name, { color: colors.text }]}>{user?.firstName || 'User'}</Text>
            <Text style={[styles.welcomeMessage, { color: colors.text + '80' }]}>Welcome back to Cooper</Text>
          </View>
        )}
      />

      <CreateContributionModal
        visible={isCreateContributionVisible}
        onClose={() => setIsCreateContributionVisible(false)}
        onSubmit={handleCreateContribution}
      />

      <CreateWalletModal
        visible={isCreateWalletVisible}
        onClose={() => setIsCreateWalletVisible(false)}
        onSubmit={handleCreateWallet}
      />

      <CreateLoanRequestModal
        visible={isCreateLoanRequestVisible}
        onClose={() => setIsCreateLoanRequestVisible(false)}
        onSubmit={handleCreateLoanRequest}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 100, // Add padding to account for tab bar
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  welcomeMessage: {
    fontSize: 14,
    fontWeight: '400',
  },
  section: {
    marginBottom: 24,
    paddingBottom: 8, // Add some padding between sections
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
});
