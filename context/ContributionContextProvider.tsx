import React, { createContext, useContext, useState, useEffect } from 'react';
import ContributionService, { Contribution } from '@/services/api.contribution.service';
import { useAuth } from './AuthContextProvider';

interface ContributionContextType {
  contributions: Contribution[];
  isLoading: boolean;
  error: string | null;
  refreshContributions: () => Promise<void>;
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
      const data = await ContributionService.getUserContributions();
      setContributions(data);
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

  const value = {
    contributions,
    isLoading,
    error,
    refreshContributions: fetchContributions,
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
