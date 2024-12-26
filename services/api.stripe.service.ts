import apiClient from './authConfig';
import axios from 'axios';

export interface BankAccount {
  id: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  last4: string;
  routingNumber: string;
  accountType: "checking" | "savings";
  currency: SupportedCurrency;
  country: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
}

interface PaymentSheetParams {
  amount: number;
  currency: string;
  walletId: string;
}

interface StripeConfig {
  clientSecret: string;
  publishableKey: string;
}

// Type for supported currencies
export type SupportedCurrency = 'USD' | 'EUR' | 'GBP';

// Custom error class for bank account errors
export class BankAccountError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message);
    this.name = 'BankAccountError';
  }
}

export class StripeService {
  // Stripe Connect Account Management
  async getOrCreateConnectAccount() {
    const response = await apiClient.get('/stripe/connect/account');
    return response.data;
  }

  async acceptTermsOfService() {
    const response = await apiClient.post('/stripe/connect/accept-tos');
    return response.data;
  }

  // Bank Account Management
  async registerBankAccount(bankDetails: Omit<BankAccount, 'id' | 'last4'>) {
    try {
      const response = await apiClient.post<BankAccount>('/banks', bankDetails);
      console.log('Bank account registered successfully:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BankAccountError(
          error.response?.data?.message || 'Failed to register bank account',
          'API_ERROR',
          error.response?.status
        );
      }
      throw error;
    }
  }

  async getBankAccounts() {
    try {
      const response = await apiClient.get<BankAccount[]>('/banks');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BankAccountError(
          error.response?.data?.message || 'Failed to get bank accounts',
          'API_ERROR',
          error.response?.status
        );
      }
      throw error;
    }
  }

  async getBankAccountByCurrency(currency: SupportedCurrency): Promise<BankAccount | null> {
    try {
      const bankAccounts = await this.getBankAccounts();
      return bankAccounts.find(account => account.currency === currency) || null;
    } catch (error) {
      if (error instanceof BankAccountError) {
        throw error;
      }
      throw new BankAccountError(
        'An unexpected error occurred while fetching bank account',
        'UNKNOWN_ERROR'
      );
    }
  }

  // Payment Operations
  async createPaymentSheet(params: { amount: number; currency: string; walletId: string }): Promise<StripeConfig> {
    try {
      const response = await apiClient.post<StripeConfig>('/stripe/payment-sheet', params);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create payment sheet');
      }
      throw error;
    }
  }

  async createACHTransfer(params: { 
    amount: number; 
    currency: SupportedCurrency; 
    walletId: string;
    bankId: string;
  }): Promise<StripeConfig> {
    try {
      const response = await apiClient.post<StripeConfig>(`/wallets/${params.walletId}/ach-transfer`, params);
      console.log('the client secret used by stripe for payment sheet', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create ACH transfer');
      }
      throw error;
    }
  }

  async createACHBankWithdrawal(params: { 
    amount: number; 
    currency: SupportedCurrency; 
    walletId: string;
    bankId: string;
  }): Promise<StripeConfig> {
    try {
      const response = await apiClient.post<StripeConfig>(`/wallets/${params.walletId}/ach-bank-withdrawal`, params);
      console.log('the client secret used by stripe for ACH withdrawal sheet', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create ACH bank withdrawal');
      }
      throw error;
    }
  }

  // Withdrawal Operations
  async withdrawToBank(params: { walletId: string; amount: number; currency: string; bankId: string }) {
    try {
      await apiClient.post('/stripe/withdraw/bank', params);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to withdraw to bank');
      }
      throw error;
    }
  }

  async withdrawToCard(walletId: string, amount: number, destinationCard: string) {
    try {
      await apiClient.post('/stripe/withdraw/card', {
        walletId,
        amount,
        destinationCard,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to withdraw to card');
      }
      throw error;
    }
  }

  // Financial Connections
  async createFinancialConnectionsSession(): Promise<{ client_secret: string; publishableKey: string }> {
    try {
      const response = await apiClient.post<{ client_secret: string; publishableKey: string }>(
        '/stripe/connect/financial-connections'
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create financial connections session');
      }
      throw error;
    }
  }
}

export default new StripeService();
