import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useContribution } from '@/context/ContributionContextProvider';
import CreateContributionModal from '@/components/modalComponent/CreateContributionModal';
import contributionService from '@/services/api.contribution.service';

export default function CreateContributionScreen() {
  const router = useRouter();
  const { refreshContributions } = useContribution();

  const handleClose = () => {
    router.back();
  };

  const handleSubmit = async (contributionData: {
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
      handleClose();
    } catch (error) {
      console.error('Failed to create contribution:', error);
      // TODO: Show error toast
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CreateContributionModal
        visible={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </View>
  );
}
