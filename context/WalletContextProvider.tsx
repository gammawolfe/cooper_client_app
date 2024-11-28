import React, { createContext, useContext, useState, useEffect } from 'react';
import { walletService, Wallet, Transaction, CreateWalletDTO } from '@/services/api.wallet.service';
import { useAuth } from './AuthContextProvider';

interface WalletContextType {
  wallets: Wallet[];
  defaultWallet: Wallet | null;
  isLoading: boolean;
  error: string | null;
  refreshWallets: () => Promise<void>;
  createWallet: (data: CreateWalletDTO) => Promise<Wallet>;
  setAsDefaultWallet: (walletId: string) => Promise<void>;
  getTransactions: (walletId: string, limit?: number, offset?: number) => Promise<Transaction[]>;
  addFunds: (walletId: string, amount: number, description: string) => Promise<Transaction>;
  withdrawFunds: (walletId: string, amount: number, description: string) => Promise<Transaction>;
  transferFunds: (fromWalletId: string, toWalletId: string, amount: number, description: string) => Promise<Transaction>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [defaultWallet, setDefaultWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshWallets = async () => {
    if (!user) {
      setWallets([]);
      setDefaultWallet(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const fetchedWallets = await walletService.getUserWallets();
      setWallets(fetchedWallets);
      
      // Set default wallet
      const defaultWallet = fetchedWallets.find(wallet => wallet.isDefault);
      setDefaultWallet(defaultWallet || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallets');
      console.error('Error fetching wallets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createWallet = async (data: CreateWalletDTO): Promise<Wallet> => {
    try {
      const newWallet = await walletService.createWallet(data);
      await refreshWallets(); // Refresh the list to include the new wallet
      return newWallet;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create wallet';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const setAsDefaultWallet = async (walletId: string): Promise<void> => {
    try {
      await walletService.setDefaultWallet(walletId);
      await refreshWallets(); // Refresh to update the default status
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set default wallet';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getTransactions = async (
    walletId: string,
    limit?: number,
    offset?: number
  ): Promise<Transaction[]> => {
    try {
      return await walletService.getTransactionHistory(walletId, limit, offset);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const addFunds = async (
    walletId: string,
    amount: number,
    description: string
  ): Promise<Transaction> => {
    try {
      const transaction = await walletService.addFunds(walletId, amount, description);
      await refreshWallets(); // Refresh to update balances
      return transaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add funds';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const withdrawFunds = async (
    walletId: string,
    amount: number,
    description: string
  ): Promise<Transaction> => {
    try {
      const transaction = await walletService.withdrawFunds(walletId, amount, description);
      await refreshWallets(); // Refresh to update balances
      return transaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to withdraw funds';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const transferFunds = async (
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    description: string
  ): Promise<Transaction> => {
    try {
      const transaction = await walletService.transferFunds(fromWalletId, toWalletId, amount, description);
      await refreshWallets(); // Refresh to update balances
      return transaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to transfer funds';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Initial load and refresh when auth state changes
  useEffect(() => {
    refreshWallets();
  }, [user]);


  const value = {
    wallets,
    defaultWallet,
    isLoading,
    error,
    refreshWallets,
    createWallet,
    setAsDefaultWallet,
    getTransactions,
    addFunds,
    withdrawFunds,
    transferFunds,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
