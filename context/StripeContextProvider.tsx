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

interface StripeContextType {
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  addCard: () => Promise<boolean>;
  removeCard: (cardId: string) => Promise<boolean>;
  setDefaultCard: (cardId: string) => Promise<boolean>;
  cards: PaymentMethod[];
  fetchCards: () => Promise<void>;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault?: boolean;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

// Get API settings
const settings = getCurrentSettings();

export function StripeProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<PaymentMethod[]>([]);
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
        console.debug('Stripe initialization skipped:', error);
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

  const value = {
    isLoading,
    isInitialized,
    error,
    addCard,
    removeCard,
    setDefaultCard,
    cards,
    fetchCards,
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
