import React, { createContext, useContext, useState, useCallback } from 'react';
import { initStripe, StripeProvider as NativeStripeProvider } from '@stripe/stripe-react-native';
import { Alert } from 'react-native';

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

// In production, move this to your environment variables
const STRIPE_PUBLISHABLE_KEY = 'your_stripe_publishable_key';
const API_URL = 'your_api_url'; // Your backend API URL

export function StripeProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [cards, setCards] = useState<PaymentMethod[]>([]);

  // Initialize Stripe
  React.useEffect(() => {
    async function initialize() {
      try {
        await initStripe({
          publishableKey: STRIPE_PUBLISHABLE_KEY,
          merchantIdentifier: 'your_merchant_identifier', // For Apple Pay
          urlScheme: 'your-app-scheme', // Required for 3D Secure and connecting return_url
        });
      } catch (error) {
        console.error('Failed to initialize Stripe:', error);
        Alert.alert('Error', 'Failed to initialize payment system');
      }
    }
    initialize();
  }, []);

  const fetchCards = useCallback(async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with your actual API call
      const response = await fetch(`${API_URL}/payment-methods`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add your authentication headers here
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }

      const data = await response.json();
      setCards(data.paymentMethods);
    } catch (error) {
      console.error('Error fetching cards:', error);
      Alert.alert('Error', 'Failed to fetch saved cards');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addCard = useCallback(async () => {
    try {
      setIsLoading(true);

      // TODO: Replace with your actual implementation
      // 1. Create a SetupIntent on your backend
      const setupIntentResponse = await fetch(`${API_URL}/create-setup-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add your authentication headers here
        },
      });

      if (!setupIntentResponse.ok) {
        throw new Error('Failed to create setup intent');
      }

      const { clientSecret } = await setupIntentResponse.json();

      // 2. Confirm the SetupIntent with the card details
      // This would typically be handled by the Stripe SDK's UI components
      // For example, using presentPaymentSheet or confirmSetupIntent

      // 3. After successful confirmation, fetch updated cards
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
      // TODO: Replace with your actual API call
      const response = await fetch(`${API_URL}/payment-methods/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Add your authentication headers here
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove card');
      }

      // Update the local state
      setCards(prevCards => prevCards.filter(card => card.id !== cardId));
    } catch (error) {
      console.error('Error removing card:', error);
      Alert.alert('Error', 'Failed to remove card');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch cards when the provider mounts
  React.useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return (
    <NativeStripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <StripeContext.Provider
        value={{
          isLoading,
          addCard,
          removeCard,
          cards,
          fetchCards,
        }}
      >
        {children}
      </StripeContext.Provider>
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
