import React, { createContext, useContext, useState, useCallback } from 'react';
import { initStripe, StripeProvider as NativeStripeProvider } from '@stripe/stripe-react-native';
import { Alert } from 'react-native';
import apiClient from '@/services/authConfig';
import getCurrentSettings from '@/utilities/settings';

interface StripeContextType {
  isLoading: boolean;
  addCard: () => Promise<void>;
  removeCard: (cardId: string) => Promise<void>;
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
  const [cards, setCards] = useState<PaymentMethod[]>([]);

  // Initialize Stripe
  React.useEffect(() => {
    async function initialize() {
      try {
        // Get Stripe configuration from backend
        const response = await apiClient.get('/stripe/config');
        const { publishableKey, merchantIdentifier } = response.data;

        await initStripe({
          publishableKey,
          merchantIdentifier,
          urlScheme: 'cooper', // Your app's URL scheme
        });
      } catch (error) {
        console.error('Failed to initialize Stripe:', error);
        // Don't show alert as this might happen when user is not logged in
        console.warn('Stripe initialization skipped - user might not be logged in');
      }
    }
    initialize();
  }, []);

  const fetchCards = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/stripe/payment-methods');
      setCards(response.data.paymentMethods);
    } catch (error) {
      console.error('Error fetching cards:', error);
      // Don't show alert as this might happen when user is not logged in
      setCards([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addCard = useCallback(async () => {
    try {
      setIsLoading(true);
      // Create a SetupIntent
      const { data: { clientSecret } } = await apiClient.post('/stripe/setup-intent');

      // TODO: Implement card addition UI using Stripe SDK
      console.log('Setup Intent created:', clientSecret);

      // After successful confirmation, fetch updated cards
      await fetchCards();
    } catch (error) {
      console.error('Error adding card:', error);
      Alert.alert('Error', 'Failed to add card');
    } finally {
      setIsLoading(false);
    }
  }, [fetchCards]);

  const removeCard = useCallback(async (cardId: string) => {
    try {
      setIsLoading(true);
      await apiClient.delete(`/stripe/payment-methods/${cardId}`);
      await fetchCards(); // Refresh the list
    } catch (error) {
      console.error('Error removing card:', error);
      Alert.alert('Error', 'Failed to remove card');
    } finally {
      setIsLoading(false);
    }
  }, [fetchCards]);

  const value = {
    isLoading,
    addCard,
    removeCard,
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
