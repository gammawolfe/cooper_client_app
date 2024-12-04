import React, { createContext, useContext, useState, useEffect } from 'react';
import ContributionService, { Contribution } from '@/services/api.contribution.service';
import { useAuth } from './AuthContextProvider';

interface ContributionContextType {
  contributions: Contribution[];
  isLoading: boolean;
  error: string | null;
  refreshContributions: () => Promise<void>;
  createContribution: (data: {
    name: string;
    description: string;
    currency: string;
    fixedContributionAmount: number;
    totalCycles: number;
    cycleLengthInDays: number;
  }) => Promise<Contribution>;
  activateContribution: (contributionId: string) => Promise<void>;
  deactivateContribution: (contributionId: string) => Promise<void>;
}

const ContributionContext = createContext<ContributionContextType | undefined>(undefined);

export function ContributionProvider({ children }: { children: React.ReactNode }) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchContributions = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await ContributionService.getUserContributions();
      
      // The response is already an array of contributions
      const contributionsData = Array.isArray(response) ? response : [];

      setContributions(contributionsData);
    } catch (err) {
      setError('Failed to fetch contributions');
      console.error('Error fetching contributions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, [user]);

  const createContribution = async (data: {
    name: string;
    description: string;
    currency: string;
    fixedContributionAmount: number;
    totalCycles: number;
    cycleLengthInDays: number;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const contribution = await ContributionService.createContribution(data);
      
      // Add a small delay before fetching to ensure backend transaction is complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchContributions();
      
      return contribution;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create contribution';
      setError(errorMessage);
      console.error('Error creating contribution:', err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const activateContribution = async (contributionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await ContributionService.activateContribution(contributionId);
      await fetchContributions(); // Refresh the list after activation
    } catch (err) {
      setError('Failed to activate contribution');
      console.error('Error activating contribution:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deactivateContribution = async (contributionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await ContributionService.deactivateContribution(contributionId);
      await fetchContributions(); // Refresh the list after deactivation
    } catch (err) {
      setError('Failed to deactivate contribution');
      console.error('Error deactivating contribution:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    contributions,
    isLoading,
    error,
    refreshContributions: fetchContributions,
    createContribution,
    activateContribution,
    deactivateContribution,
  };

  return (
    <ContributionContext.Provider value={value}>
      {children}
    </ContributionContext.Provider>
  );
}

export function useContribution() {
  const context = useContext(ContributionContext);
  if (context === undefined) {
    throw new Error('useContribution must be used within a ContributionProvider');
  }
  return context;
}
