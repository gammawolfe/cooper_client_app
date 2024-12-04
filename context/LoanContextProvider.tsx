import React, { createContext, useContext, useState, useEffect } from 'react';
import LoanService, { LoanRequest, CreateLoanRequestDTO, Loan } from '@/services/api.loan.service';
import { useAuth } from './AuthContextProvider';

interface LoanContextType {
  incomingRequests: LoanRequest[];
  outgoingRequests: LoanRequest[];
  receivedLoans: Loan[];
  givenLoans: Loan[];
  isLoading: boolean;
  error: string | null;
  refreshLoanRequests: () => Promise<void>;
  refreshLoans: () => Promise<void>;
  createLoanRequest: (data: CreateLoanRequestDTO) => Promise<any>;
  approveLoanRequest: (requestId: string, reviewerNotes?: string) => Promise<void>;
  declineLoanRequest: (requestId: string, reviewerNotes: string) => Promise<void>;
  cancelLoanRequest: (requestId: string, reason: string) => Promise<void>;
  fetchLoanRequestById: (requestId: string) => Promise<LoanRequest>;
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export function LoanProvider({ children }: { children: React.ReactNode }) {
  const [incomingRequests, setIncomingRequests] = useState<LoanRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<LoanRequest[]>([]);
  const [receivedLoans, setReceivedLoans] = useState<Loan[]>([]);
  const [givenLoans, setGivenLoans] = useState<Loan[]>([]);
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

  const fetchLoanRequestById = async (requestId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const loanRequest = await LoanService.getLoanRequestById(requestId);
      return loanRequest;
    } catch (err) {
      setError('Failed to fetch loan request');
      console.error('Error fetching loan request:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLoans = async () => {
    if (!user) {
      setReceivedLoans([]);
      setGivenLoans([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const [received, given] = await Promise.all([
        LoanService.getLoansReceivedByUser(),
        LoanService.getLoansGivenByUser()
      ]);
      setReceivedLoans(received);
      setGivenLoans(given);
    } catch (err) {
      setError('Failed to fetch loans');
      console.error('Error fetching loans:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createLoanRequest = async (data: CreateLoanRequestDTO) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await LoanService.createLoanRequest(data);
      if (!response?.success) {
        throw new Error(response?.error || 'Failed to create loan request');
      }
      await fetchLoanRequests(); // Refresh the list
      return response;
    } catch (err: any) {
      setError(err?.message || 'Failed to create loan request');
      console.error('Error creating loan request:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const approveLoanRequest = async (requestId: string, reviewerNotes?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Update the loan request status to approved
      // The backend will handle creating the loan automatically
      await LoanService.updateLoanRequestStatus(requestId, {
        status: 'approved',
        reviewerNotes
      });
      
      // Refresh both loan requests and loans since a new loan was created
      await Promise.all([
        fetchLoanRequests(),
        fetchLoans()
      ]);
    } catch (err) {
      setError('Failed to approve loan request');
      console.error('Error approving loan request:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const declineLoanRequest = async (requestId: string, reviewerNotes: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await LoanService.updateLoanRequestStatus(requestId, {
        status: 'rejected',
        reviewerNotes
      });
      await fetchLoanRequests();
    } catch (err) {
      setError('Failed to decline loan request');
      console.error('Error declining loan request:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelLoanRequest = async (requestId: string, reason: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await LoanService.updateLoanRequestStatus(requestId, {
        status: 'cancelled',
        reviewerNotes: reason
      });
      await fetchLoanRequests();
    } catch (err) {
      setError('Failed to cancel loan request');
      console.error('Error cancelling loan request:', err);
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
      setReceivedLoans([]);
      setGivenLoans([]);
      setIsLoading(false);
      setError(null);
    } else {
      Promise.all([
        fetchLoanRequests(),
        fetchLoans()
      ]);
    }
  }, [user]);

  const value = {
    incomingRequests,
    outgoingRequests,
    receivedLoans,
    givenLoans,
    isLoading,
    error,
    refreshLoanRequests: fetchLoanRequests,
    refreshLoans: fetchLoans,
    createLoanRequest,
    approveLoanRequest,
    declineLoanRequest,
    cancelLoanRequest,
    fetchLoanRequestById,
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
