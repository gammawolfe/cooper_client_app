import React, { createContext, useContext, useState, useEffect } from 'react';
import LoanService, { LoanRequest, CreateLoanRequestDTO, Loan } from '@/services/api.loan.service';
import { useAuth } from './AuthContextProvider';
import apiClient from '@/services/authConfig';

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
  approveLoanRequest: (requestId: string, reviewerNotes?: string) => Promise<{ success: boolean; error?: string }>;
  declineLoanRequest: (requestId: string, reviewerNotes: string) => Promise<void>;
  cancelLoanRequest: (requestId: string, reason: string) => Promise<void>;
  fetchLoanRequestById: (requestId: string) => Promise<LoanRequest>;
  getLoan: (id: string) => Promise<Loan>;
  makePayment: (loanId: string, paymentData: { amount: number; walletId: string; note?: string }) => Promise<void>;
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

  const handleApproveLoanRequest = async (requestId: string, reviewerNotes?: string) => {
    console.log('Approving loan request:', { requestId, reviewerNotes });
    try {
      await LoanService.approveLoanRequest(requestId, reviewerNotes);
      
      // Don't let data refresh errors affect our response
      try {
        await Promise.all([
          fetchLoanRequests(),
          fetchLoans()
        ]);
      } catch (refreshError) {
        console.info('Error refreshing data:', refreshError);
      }

      console.log('Loan request approved successfully');
      return { success: true };
    } catch (error: any) {
      console.info('Error approving loan request:', error);
      
      // Extract error message from API response
      const errorMessage = error.response?.data?.message || 'Failed to approve loan request';
      console.log('Returning error:', errorMessage);
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const declineLoanRequest = async (requestId: string, reviewerNotes: string) => {
    try {
      console.log('Declining loan request:', { requestId, reviewerNotes });
      setIsLoading(true);
      setError(null);
      await LoanService.declineLoanRequest(requestId, reviewerNotes);
      await fetchLoanRequests();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to decline loan request';
      setError(errorMessage);
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

  const makePayment = async (loanId: string, paymentData: { amount: number; walletId: string; note?: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      await LoanService.makePayment(loanId, paymentData);
      await fetchLoans();
    } catch (err) {
      setError('Failed to make payment');
      console.error('Error making payment:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getLoan = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const loan = await LoanService.getLoan(id);
      return loan;
    } catch (err) {
      setError('Failed to fetch loan');
      console.error('Error fetching loan:', err);
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
    approveLoanRequest: handleApproveLoanRequest,
    declineLoanRequest,
    cancelLoanRequest,
    fetchLoanRequestById,
    getLoan,
    makePayment,
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
