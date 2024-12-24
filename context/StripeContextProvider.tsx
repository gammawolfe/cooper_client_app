import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  initStripe, 
  StripeProvider as NativeStripeProvider, 
  confirmSetupIntent, 
  createPaymentMethod,
  useStripe as useNativeStripe,
  CardFieldInput
} from '@stripe/stripe-react-native';
import { Alert } from 'react-native';
import apiClient from '@/services/authConfig';
import getCurrentSettings from '@/utilities/settings';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_NAME } from '@/services/authConfig';
import stripeService from '@/services/api.stripe.service';

interface StripeContextType {
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  addCard: () => Promise<boolean>;
  removeCard: (cardId: string) => Promise<boolean>;
  setDefaultCard: (cardId: string) => Promise<boolean>;
  cards: PaymentMethod[];
  fetchCards: () => Promise<void>;
  addBankAccount: (bankDetails: BankDetails) => Promise<boolean>;
  removeBankAccount: (bankAccountId: string) => Promise<boolean>;
  setDefaultBankAccount: (bankAccountId: string) => Promise<boolean>;
  bankAccounts: BankAccount[];
  fetchBankAccounts: () => Promise<void>;
  initiateDeposit: (request: DepositRequest) => Promise<TransferResponse>;
  initiateWithdrawal: (request: WithdrawalRequest) => Promise<TransferResponse>;
  getTransferStatus: (transferId: string) => Promise<TransferResponse>;
  getTransfers: (type?: 'deposit' | 'withdrawal', status?: TransferStatus) => Promise<TransferResponse[]>;
  transfers: TransferResponse[];
  fetchTransfers: () => Promise<void>;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault?: boolean;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountHolderName: string;
  last4: string;
  sortCode: string;
  isDefault?: boolean;
}

interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  sortCode: string;
  bankName: string;
  accountType: 'personal' | 'business';
  currency: string;
  country: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
  dateOfBirth?: string;
  companyName?: string;
  companyNumber?: string;
}

interface DepositRequest {
  bankAccountId: string;
  amount: number;
  currency: string;
  description?: string;
}

interface WithdrawalRequest {
  bankAccountId: string;
  amount: number;
  currency: string;
  description?: string;
}

interface TransferResponse {
  id: string;
  amount: number;
  currency: string;
  status: TransferStatus;
  created: number;
  description?: string;
  failureReason?: string;
  estimatedArrivalDate?: number;
}

type TransferStatus = 'pending' | 'processing' | 'succeeded' | 'failed';

const StripeContext = createContext<StripeContextType | undefined>(undefined);

// Get API settings
const settings = getCurrentSettings();

export function StripeProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<PaymentMethod[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transfers, setTransfers] = useState<TransferResponse[]>([]);
  const { createPaymentMethod: stripeCreatePaymentMethod } = useNativeStripe();

  // Initialize Stripe
  useEffect(() => {
    async function initialize() {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_NAME);
        if (!token) {
          setIsInitialized(false);
          return;
        }

        // Get Stripe configuration from backend
        const response = await apiClient.get('/stripe/config');
        const { publishableKey, merchantIdentifier } = response.data;

        await initStripe({
          publishableKey,
          merchantIdentifier,
          urlScheme: 'cooper',
        });

        setIsInitialized(true);
        setError(null);
      } catch (error) {
        //console.debug('Stripe initialization skipped:', error);
        setIsInitialized(false);
        setError('Failed to initialize payment system');
      }
    }
    initialize();
  }, []);

  const fetchCards = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_NAME);
      if (!token || !isInitialized) {
        setCards([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      const response = await apiClient.get('/stripe/payment-methods');
      setCards(response.data.paymentMethods);
    } catch (error) {
      console.debug('Error fetching cards:', error);
      setCards([]);
      setError('Unable to load payment methods');
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const addCard = useCallback(async () => {
    try {
      if (!isInitialized) {
        setError('Payment system not initialized');
        return false;
      }

      setIsLoading(true);
      setError(null);

      // Create a SetupIntent
      const { data: { clientSecret } } = await apiClient.post('/stripe/setup-intent');

      // Create a payment method
      const { paymentMethod, error: pmError } = await stripeCreatePaymentMethod({
        paymentMethodType: 'Card',
      });

      if (pmError) {
        throw new Error(pmError.message);
      }

      if (!paymentMethod) {
        throw new Error('Failed to create payment method');
      }

      // Confirm the SetupIntent
      const { setupIntent, error: setupError } = await confirmSetupIntent(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          paymentMethodId: paymentMethod.id,
          billingDetails: {}
        }
      });

      if (setupError) {
        throw new Error(setupError.message);
      }

      if (!setupIntent) {
        throw new Error('Failed to setup payment method');
      }

      await fetchCards();
      return true;
    } catch (error) {
      console.error('Error adding card:', error);
      setError(error instanceof Error ? error.message : 'Failed to add card');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchCards, isInitialized, stripeCreatePaymentMethod]);

  const removeCard = useCallback(async (cardId: string) => {
    try {
      if (!isInitialized) {
        setError('Payment system not initialized');
        return false;
      }

      setIsLoading(true);
      setError(null);
      await apiClient.delete(`/stripe/payment-methods/${cardId}`);
      await fetchCards();
      return true;
    } catch (error) {
      console.error('Error removing card:', error);
      setError('Failed to remove card');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchCards, isInitialized]);

  const setDefaultCard = useCallback(async (cardId: string) => {
    try {
      if (!isInitialized) {
        setError('Payment system not initialized');
        return false;
      }

      setIsLoading(true);
      setError(null);
      await apiClient.post(`/stripe/payment-methods/${cardId}/default`);
      await fetchCards();
      return true;
    } catch (error) {
      console.error('Error setting default card:', error);
      setError('Failed to set default card');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchCards, isInitialized]);

  const fetchBankAccounts = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_NAME);
      if (!token || !isInitialized) {
        setBankAccounts([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      const response = await stripeService.getBankAccounts();
      setBankAccounts(response.bankAccounts);
    } catch (error) {
      console.debug('Error fetching bank accounts:', error);
      setBankAccounts([]);
      setError('Unable to load bank accounts');
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const addBankAccount = useCallback(async (bankDetails: BankDetails) => {
    try {
      setIsLoading(true);
      setError(null);
      await stripeService.addBankAccount(bankDetails);
      await fetchBankAccounts();
      return true;
    } catch (error) {
      console.error('Error adding bank account:', error);
      setError('Failed to add bank account');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchBankAccounts]);

  const removeBankAccount = useCallback(async (bankAccountId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await stripeService.removeBankAccount(bankAccountId);
      await fetchBankAccounts();
      return true;
    } catch (error) {
      console.error('Error removing bank account:', error);
      setError('Failed to remove bank account');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchBankAccounts]);

  const setDefaultBankAccount = useCallback(async (bankAccountId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await stripeService.setDefaultBankAccount(bankAccountId);
      await fetchBankAccounts();
      return true;
    } catch (error) {
      console.error('Error setting default bank account:', error);
      setError('Failed to set default bank account');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchBankAccounts]);

  const initiateDeposit = useCallback(async (request: DepositRequest) => {
    setIsLoading(true);
    try {
      const response = await stripeService.initiateDeposit(request);
      await fetchTransfers(); // Refresh transfers list
      return response;
    } catch (err) {
      console.error('Failed to initiate deposit:', err);
      Alert.alert('Error', 'Failed to initiate deposit. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initiateWithdrawal = useCallback(async (request: WithdrawalRequest) => {
    setIsLoading(true);
    try {
      const response = await stripeService.initiateWithdrawal(request);
      await fetchTransfers(); // Refresh transfers list
      return response;
    } catch (err) {
      console.error('Failed to initiate withdrawal:', err);
      Alert.alert('Error', 'Failed to initiate withdrawal. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTransferStatus = useCallback(async (transferId: string) => {
    try {
      return await stripeService.getTransferStatus(transferId);
    } catch (err) {
      console.error('Failed to get transfer status:', err);
      throw err;
    }
  }, []);

  const getTransfers = useCallback(async (type?: 'deposit' | 'withdrawal', status?: TransferStatus) => {
    try {
      return await stripeService.getTransfers(type, status);
    } catch (err) {
      console.error('Failed to get transfers:', err);
      throw err;
    }
  }, []);

  const fetchTransfers = useCallback(async () => {
    try {
      const fetchedTransfers = await stripeService.getTransfers();
      setTransfers(fetchedTransfers);
    } catch (err) {
      console.error('Failed to fetch transfers:', err);
      Alert.alert('Error', 'Failed to fetch transfer history');
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      fetchCards();
      fetchBankAccounts();
      fetchTransfers();
    }
  }, [isInitialized, fetchCards, fetchBankAccounts, fetchTransfers]);

  const value = {
    isLoading,
    isInitialized,
    error,
    addCard,
    removeCard,
    setDefaultCard,
    cards,
    fetchCards,
    addBankAccount,
    removeBankAccount,
    setDefaultBankAccount,
    bankAccounts,
    fetchBankAccounts,
    initiateDeposit,
    initiateWithdrawal,
    getTransferStatus,
    getTransfers,
    transfers,
    fetchTransfers,
  };

  return (
    <NativeStripeProvider 
      publishableKey={settings.stripePublishableKey || 'dummy_key_for_development'}
    >
      <StripeContext.Provider value={value}>{children}</StripeContext.Provider>
    </NativeStripeProvider>
  );
}

export function useStripe() {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
}
