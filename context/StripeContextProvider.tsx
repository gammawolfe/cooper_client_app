import React, { createContext, useContext, useState, ReactNode, ReactElement } from 'react';
import { 
  initStripe, 
  StripeProvider as NativeStripeProvider,
  useStripe as useNativeStripe,
  PresentPaymentSheetResult
} from '@stripe/stripe-react-native';
import { Alert } from 'react-native';
import { StripeService, BankAccount, SupportedCurrency, BankAccountError } from '@/services/api.stripe.service';

interface StripeContextType {
  isLoading: boolean;
  error: string | null;
  connectAccount: any;
  initializeConnectAccount: () => Promise<void>;
  acceptTermsOfService: () => Promise<void>;
  bankAccounts: BankAccount[];
  getBankAccounts: () => Promise<void>;
  getBankAccountByCurrency: (currency: SupportedCurrency) => Promise<BankAccount | null>;
  registerBankAccount: (bankDetails: Omit<BankAccount, 'id' | 'last4'>) => Promise<void>;
  createACHTransfer: (params: { amount: number; currency: SupportedCurrency; walletId: string; bankId: string }) => Promise<void>;
  createACHBankWithdrawal: (params: { amount: number; currency: SupportedCurrency; walletId: string; bankId: string }) => Promise<void>;
  createPaymentSheet: (params: { amount: number; currency: string; walletId: string }) => Promise<void>;
  presentPaymentSheet: () => Promise<{ error?: Error }>;
  withdrawToBank: (params: { walletId: string; amount: number; currency: string; bankId: string }) => Promise<void>;
  withdrawToCard: (walletId: string, amount: number, destinationCard: string) => Promise<void>;
  createFinancialConnectionsSession: () => Promise<{ client_secret: string; publishableKey: string }>;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

export function useStripe() {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
}

interface StripeProviderProps {
  children: ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectAccount, setConnectAccount] = useState<any>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const { initPaymentSheet, presentPaymentSheet: nativePresentPaymentSheet } = useNativeStripe();
  const stripeService = new StripeService();

  const handleError = (error: any) => {
    if (error instanceof BankAccountError) {
      setError(error.message);
    } else {
      setError(error?.message || 'An unexpected error occurred');
    }
    setIsLoading(false);
  };

  const initializeConnectAccount = async () => {
    try {
      setIsLoading(true);
      const account = await stripeService.getOrCreateConnectAccount();
      setConnectAccount(account);
      setError(null);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptTermsOfService = async () => {
    try {
      setIsLoading(true);
      await stripeService.acceptTermsOfService();
      await initializeConnectAccount();
      setError(null);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBankAccounts = async () => {
    try {
      setIsLoading(true);
      const accounts = await stripeService.getBankAccounts();
      setBankAccounts(accounts);
      setError(null);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBankAccountByCurrency = async (currency: SupportedCurrency) => {
    try {
      setIsLoading(true);
      const account = await stripeService.getBankAccountByCurrency(currency);
      setError(null);
      return account;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerBankAccount = async (bankDetails: Omit<BankAccount, 'id' | 'last4'>) => {
    try {
      setIsLoading(true);
      await stripeService.registerBankAccount(bankDetails);
      await getBankAccounts();
      setError(null);
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createACHTransfer = async (params: { amount: number; currency: SupportedCurrency; walletId: string; bankId: string }) => {
    try {
      setIsLoading(true);
      const { clientSecret, publishableKey } = await stripeService.createACHTransfer(params);

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Cooper',
      });

      if (initError) {
        throw new Error(initError.message);
      }

      setError(null);
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createACHBankWithdrawal = async (params: { amount: number; currency: SupportedCurrency; walletId: string; bankId: string }) => {
    try {
      setIsLoading(true);
      const { clientSecret, publishableKey } = await stripeService.createACHBankWithdrawal(params);

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Cooper',
      });

      if (initError) {
        throw new Error(initError.message);
      }

      setError(null);
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createPaymentSheet = async (params: { amount: number; currency: string; walletId: string }) => {
    try {
      setIsLoading(true);
      const { clientSecret, publishableKey } = await stripeService.createPaymentSheet(params);

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Cooper',
      });

      if (initError) {
        throw new Error(initError.message);
      }

      setError(null);
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const presentPaymentSheet = async () => {
    try {
      setIsLoading(true);
      const { error } = await nativePresentPaymentSheet();
      if (error) {
        throw error;
      }
      setError(null);
      return { error: undefined };
    } catch (error) {
      handleError(error);
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawToBank = async (params: { walletId: string; amount: number; currency: string; bankId: string }) => {
    try {
      setIsLoading(true);
      await stripeService.withdrawToBank(params);
      setError(null);
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawToCard = async (walletId: string, amount: number, destinationCard: string) => {
    try {
      setIsLoading(true);
      await stripeService.withdrawToCard(walletId, amount, destinationCard);
      setError(null);
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createFinancialConnectionsSession = async () => {
    try {
      setIsLoading(true);
      const result = await stripeService.createFinancialConnectionsSession();
      setError(null);
      return result;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: StripeContextType = {
    isLoading,
    error,
    connectAccount,
    initializeConnectAccount,
    acceptTermsOfService,
    bankAccounts,
    getBankAccounts,
    getBankAccountByCurrency,
    registerBankAccount,
    createACHTransfer,
    createACHBankWithdrawal,
    createPaymentSheet,
    presentPaymentSheet,
    withdrawToBank,
    withdrawToCard,
    createFinancialConnectionsSession,
  };

  return (
    <StripeContext.Provider value={value}>
      <NativeStripeProvider
        publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}
        urlScheme="your-url-scheme" // Required for 3D Secure and bank redirects
      >
        {children as ReactElement}
      </NativeStripeProvider>
    </StripeContext.Provider>
  );
}
