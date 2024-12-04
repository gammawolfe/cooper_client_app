import { StyleSheet, SectionList, RefreshControl, View, Text, ColorValue, FlatList, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { useWallet } from '@/context/WalletContextProvider';
import { useContribution } from '@/context/ContributionContextProvider';
import { useLoan } from '@/context/LoanContextProvider';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContextProvider';
import { useCallback, useState, useMemo } from 'react';
import { router } from 'expo-router';
import AddButton from '@/components/common/AddButton';
import { RootStackParamList } from '@/types/navigation';
import CreateContributionModal from '@/components/modalComponent/CreateContributionModal';
import CreateWalletModal from '@/components/modalComponent/CreateWalletModal';
import contributionService from '@/services/api.contribution.service';
import { walletService } from '@/services/api.wallet.service';
import WalletItem from '@/components/walletComponent/WalletItem';
import ContributionItem from '@/components/contributionComponent/ContributionItem';
import { LoanRequestItem } from '@/components/loanRequestComponent/LoanRequestItem';
import { LoanItem } from '@/components/loanComponent/LoanItem';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { CreateLoanRequestDTO } from '@/services/api.loan.service';
import loanService from '@/services/api.loan.service';
import CreateLoanRequestModal from '@/components/modalComponent/CreateLoanRequestModal';

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
    receivedLoans,
    givenLoans,
    isLoading: loansLoading,
    approveLoanRequest,
    refreshLoanRequests,
    refreshLoans
  } = useLoan();

  const screenWidth = Dimensions.get('window').width;
  const listContentWidth = screenWidth - 32; // 32 = horizontal padding (16 * 2)

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

  const renderHeader = () => {
    const greeting = useMemo(() => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good Morning';
      if (hour < 18) return 'Good Afternoon';
      return 'Good Evening';
    }, []);

    return (
      <View style={[styles.headerCard, { backgroundColor: Colors.light.card }]}>
        <View style={styles.greetingContainer}>
          <ThemedText style={styles.greeting}>{greeting},</ThemedText>
          <ThemedText style={styles.name}>
            {user?.firstName || 'User'}
          </ThemedText>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/profile')}
        >
          <MaterialIcons 
            name="account-circle" 
            size={32} 
            color={colors.text} 
          />
        </TouchableOpacity>
      </View>
    );
  };

  const handleCreateContribution = async (contributionData: {
    name: string;
    description: string;
    currency: string;
    fixedContributionAmount: number;
    cycleLengthInDays: number;
    totalCycles: number;
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
      throw error;
    }
  };

  const handleCreateLoanRequest = async (loanRequestData: CreateLoanRequestDTO) => {
    try {
      await loanService.createLoanRequest(loanRequestData);
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

  const handleLoanPress = (id: string) => {
    router.push(`/loans/${id}`);
  };

  const handleLoanRequestPress = (id: string) => {
    router.push(`/loanRequests/${id}`);
  };

  const handleAcceptLoanRequest = async (id: string) => {
    try {
      await approveLoanRequest(id);
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

  const renderWalletList = () => {
    if (walletsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }

    if (!wallets.length) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No wallets yet. Create your first wallet!
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        horizontal
        data={wallets}
        renderItem={({ item }) => (
          <WalletItem
            wallet={item}
            width={listContentWidth}
            isActive={false}
          />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsHorizontalScrollIndicator={false}
        snapToInterval={listContentWidth}
        decelerationRate="fast"
        snapToAlignment="start"
        pagingEnabled
      />
    );
  };

  const renderContributionList = () => {
    if (contributionsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }

    if (!contributions?.length) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No contributions yet. Start contributing to a pot!
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        horizontal
        data={contributions}
        renderItem={({ item }) => <ContributionItem contribution={item} />}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      />
    );
  };

  const renderIncomingRequestsList = () => {
    if (loansLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (!incomingRequests || incomingRequests.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No incoming loan requests
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        horizontal
        data={incomingRequests}
        renderItem={({ item }) => (
          <LoanRequestItem
            request={item}
            onAccept={handleAcceptLoanRequest}
            onReject={handleRejectLoanRequest}
            onPress={handleLoanRequestPress}
            isIncoming={true}
            colors={{
              text: colors.text,
              primary: colors.primary,
              surface: colors.card
            }}
          />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      />
    );
  };

  const renderOutgoingRequestsList = () => {
    if (loansLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (!outgoingRequests || outgoingRequests.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No outgoing loan requests
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        horizontal
        data={outgoingRequests}
        renderItem={({ item }) => (
          <LoanRequestItem
            request={item}
            onCancel={handleCancelLoanRequest}
            onPress={handleLoanRequestPress}
            isIncoming={false}
            colors={{
              text: colors.text,
              primary: colors.primary,
              surface: colors.card
            }}
          />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      />
    );
  };

  const renderGivenLoansList = () => {
    if (loansLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (!givenLoans || givenLoans.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No active loans given
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        horizontal
        data={givenLoans}
        renderItem={({ item }) => (
          <LoanItem
            loan={item}
            onPress={handleLoanPress}
            isGiven={true}
            colors={{
              text: colors.text,
              primary: colors.primary,
              surface: colors.card
            }}
          />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsHorizontalScrollIndicator={false}
      />
    );
  };

  const renderReceivedLoansList = () => {
    if (loansLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (!receivedLoans || receivedLoans.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No active loans received
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        horizontal
        data={receivedLoans}
        renderItem={({ item }) => (
          <LoanItem
            loan={item}
            onPress={handleLoanPress}
            isGiven={false}
            colors={{
              text: colors.text,
              primary: colors.primary,
              surface: colors.card
            }}
          />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsHorizontalScrollIndicator={false}
      />
    );
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
          {renderWalletList()}
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
          {renderContributionList()}
        </View>
      )
    },
    {
      title: 'Incoming Loan Requests',
      data: [{ type: 'incomingLoanRequests' }],
      renderItem: () => (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Incoming Loan Requests</Text>
          </View>
          {renderIncomingRequestsList()}
        </View>
      )
    },
    {
      title: 'Outgoing Loan Requests',
      data: [{ type: 'outgoingLoanRequests' }],
      renderItem: () => (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Outgoing Loan Requests</Text>
            <AddButton onPress={() => setIsCreateLoanRequestVisible(true)} />
          </View>
          {renderOutgoingRequestsList()}
        </View>
      )
    },
    {
      title: 'Given Loans',
      data: [{ type: 'givenLoans' }],
      renderItem: () => (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Given Loans</Text>
          </View>
          {renderGivenLoansList()}
        </View>
      )
    },
    {
      title: 'Received Loans',
      data: [{ type: 'receivedLoans' }],
      renderItem: () => (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Received Loans</Text>
          </View>
          {renderReceivedLoansList()}
        </View>
      )
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.type + index}
        renderSectionHeader={() => null}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: Colors.light.tint,
    opacity: 0.7,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.tint,
  },
  profileButton: {
    marginLeft: 16,
  },
  content: {
    paddingBottom: 16,
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  listContent: {
    paddingHorizontal: 16,
  },
});
