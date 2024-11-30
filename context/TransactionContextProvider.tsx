import React, { createContext, useContext, useState } from 'react';
import { Transaction, transactionService, CreateTransactionDTO } from '@/services/api.transaction.service';
import { useAuth } from './AuthContextProvider';

interface TransactionContextType {
  userTransactions: Transaction[];
  walletTransactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  getUserTransactions: (walletId: string, limit?: number, offset?: number) => Promise<void>;
  getWalletTransactions: (walletId: string, limit?: number, offset?: number) => Promise<void>;
  createTransaction: (transactionData: CreateTransactionDTO) => Promise<Transaction>;
  updateTransaction: (id: string, updates: Partial<CreateTransactionDTO>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function useTransaction() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
}

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [walletTransactions, setWalletTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserTransactions = async (walletId: string, limit: number = 10, offset: number = 0) => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      const fetchedTransactions = await transactionService.getUserTransactions(walletId, limit, offset);
      console.log('Fetched user transactions:', fetchedTransactions);
      setUserTransactions(fetchedTransactions);
    } catch (error) {
      console.error('Get user transactions error:', error);
      setError('Failed to fetch user transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const getWalletTransactions = async (walletId: string, limit: number = 10, offset: number = 0) => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      const fetchedTransactions = await transactionService.getWalletTransactions(walletId, limit, offset);
      console.log('Fetched wallet transactions:', fetchedTransactions);
      setWalletTransactions(fetchedTransactions);
    } catch (error) {
      console.error('Get wallet transactions error:', error);
      setError('Failed to fetch wallet transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const createTransaction = async (transactionData: CreateTransactionDTO) => {
    try {
      setIsLoading(true);
      setError(null);
      const transaction = await transactionService.createTransaction(transactionData);
      // Update both transaction lists since it could be relevant to either
      setUserTransactions(prev => [transaction, ...prev]);
      setWalletTransactions(prev => [transaction, ...prev]);
      return transaction;
    } catch (error) {
      console.error('Create transaction error:', error);
      setError('Failed to create transaction');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<CreateTransactionDTO>) => {
    try {
      setIsLoading(true);
      setError(null);
      const transaction = await transactionService.updateTransaction(id, updates);
      // Update both transaction lists
      setUserTransactions(prev => 
        prev.map(t => t._id === transaction._id ? transaction : t)
      );
      setWalletTransactions(prev => 
        prev.map(t => t._id === transaction._id ? transaction : t)
      );
      return transaction;
    } catch (error) {
      console.error('Update transaction error:', error);
      setError('Failed to update transaction');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await transactionService.deleteTransaction(id);
      // Remove from both transaction lists
      setUserTransactions(prev => prev.filter(t => t._id !== id));
      setWalletTransactions(prev => prev.filter(t => t._id !== id));
    } catch (error) {
      console.error('Delete transaction error:', error);
      setError('Failed to delete transaction');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    userTransactions,
    walletTransactions,
    isLoading,
    error,
    getUserTransactions,
    getWalletTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}