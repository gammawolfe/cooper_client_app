import React, { createContext, useContext, useState, useEffect } from 'react';
import LoanService, { LoanRequest } from '@/services/api.loan.service';
import { useAuth } from './AuthContextProvider';

interface LoanContextType {
  incomingRequests: LoanRequest[];
  outgoingRequests: LoanRequest[];
  isLoading: boolean;
  error: string | null;
  refreshLoanRequests: () => Promise<void>;
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export function LoanProvider({ children }: { children: React.ReactNode }) {
  const [incomingRequests, setIncomingRequests] = useState<LoanRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<LoanRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchLoanRequests = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);
      const [incoming, outgoing] = await Promise.all([
        LoanService.getUserLoanRequestsToUser(),
        LoanService.getUserLoanRequestsFromUser()
      ]);
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
    } catch (err) {
      setError('Failed to fetch loan requests');
      console.error('Error fetching loan requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanRequests();
  }, [user]);

  const value = {
    incomingRequests,
    outgoingRequests,
    isLoading,
    error,
    refreshLoanRequests: fetchLoanRequests,
  };

  return (
    <LoanContext.Provider value={value}>
      {children}
    </LoanContext.Provider>
  );
}

export function useLoan() {
  const context = useContext(LoanContext);
  if (context === undefined) {
    throw new Error('useLoan must be used within a LoanProvider');
  }
  return context;
}
