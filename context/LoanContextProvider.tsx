import React, { createContext, useContext, useState, useEffect } from 'react';
import LoanService, { LoanRequest, CreateLoanRequestDTO } from '@/services/api.loan.service';
import { useAuth } from './AuthContextProvider';

interface LoanContextType {
  incomingRequests: LoanRequest[];
  outgoingRequests: LoanRequest[];
  isLoading: boolean;
  error: string | null;
  refreshLoanRequests: () => Promise<void>;
  createLoanRequest: (data: CreateLoanRequestDTO) => Promise<void>;
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export function LoanProvider({ children }: { children: React.ReactNode }) {
  const [incomingRequests, setIncomingRequests] = useState<LoanRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<LoanRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchLoanRequests = async () => {
    if (!user) {
      setIncomingRequests([]);
      setOutgoingRequests([]);
      setIsLoading(false);
      return;
    }

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

  const createLoanRequest = async (data: CreateLoanRequestDTO) => {
    try {
      setIsLoading(true);
      setError(null);
      await LoanService.createLoanRequest(data);
      await fetchLoanRequests(); // Refresh the list after creation
    } catch (err) {
      setError('Failed to create loan request');
      console.error('Error creating loan request:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state when user changes
  useEffect(() => {
    if (!user) {
      setIncomingRequests([]);
      setOutgoingRequests([]);
      setIsLoading(false);
      setError(null);
    } else {
      fetchLoanRequests();
    }
  }, [user]);

  const value = {
    incomingRequests,
    outgoingRequests,
    isLoading,
    error,
    refreshLoanRequests: fetchLoanRequests,
    createLoanRequest,
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
