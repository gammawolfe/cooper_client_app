import apiClient from './authConfig';

// Types
export interface Wallet {
  _id: string;
  userId: string;
  name: string;
  balance: number;
  currency: string;
  source: 'user' | 'contribution';
  contributionId: string | null;
  transactions: any[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateWalletDTO {
  name: string;
  currency: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  timestamp: Date;
}

interface ApiErrorResponse {
  message: string;
  status: number;
}

class WalletService {
  async getUserWallets(): Promise<Wallet[]> {
    try {
      const response = await apiClient.get<Wallet[]>('/wallets');
      return response.data;
    } catch (error) {
      console.error('Get user wallets error:', error);
      throw this.handleError(error);
    }
  }

  async getWallet(id: string): Promise<Wallet> {
    try {
      const response = await apiClient.get<Wallet>(`/wallets/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get wallet error:', error);
      throw this.handleError(error);
    }
  }

  async createWallet(walletData: CreateWalletDTO): Promise<Wallet> {
    try {
      const response = await apiClient.post<{ wallet: Wallet }>('/wallets', walletData);
      return response.data.wallet;
    } catch (error) {
      console.error('Create wallet error:', error);
      throw this.handleError(error);
    }
  }

  async getWalletBalance(walletId: string): Promise<Wallet> {
    try {
      const response = await apiClient.get<{ wallet: Wallet }>(`/wallets/${walletId}/balance`);
      return response.data.wallet;
    } catch (error) {
      console.error('Get wallet balance error:', error);
      throw this.handleError(error);
    }
  }

  async getTransactionHistory(walletId: string, limit: number = 10, offset: number = 0): Promise<Transaction[]> {
    try {
      const response = await apiClient.get<{ transactions: Transaction[] }>(
        `/wallets/${walletId}/transactions?limit=${limit}&offset=${offset}`
      );
      return response.data.transactions;
    } catch (error) {
      console.error('Get transaction history error:', error);
      throw this.handleError(error);
    }
  }

  async addFunds(walletId: string, amount: number, description: string): Promise<Transaction> {
    try {
      const response = await apiClient.post<{ transaction: Transaction }>(`/wallets/${walletId}/add-funds`, {
        amount,
        description
      });
      return response.data.transaction;
    } catch (error) {
      console.error('Add funds error:', error);
      throw this.handleError(error);
    }
  }

  async withdrawFunds(walletId: string, amount: number, description: string): Promise<Transaction> {
    try {
      const response = await apiClient.post<{ transaction: Transaction }>(`/wallets/${walletId}/withdraw`, {
        amount,
        description
      });
      return response.data.transaction;
    } catch (error) {
      console.error('Withdraw funds error:', error);
      throw this.handleError(error);
    }
  }

  async setDefaultWallet(walletId: string): Promise<Wallet> {
    try {
      const response = await apiClient.put<{ wallet: Wallet }>(`/wallets/${walletId}/set-default`);
      return response.data.wallet;
    } catch (error) {
      console.error('Set default wallet error:', error);
      throw this.handleError(error);
    }
  }

  async transferFunds(
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    description: string
  ): Promise<Transaction> {
    try {
      // Get the source wallet to get its currency
      const sourceWallet = await this.getWallet(fromWalletId);
      if (!sourceWallet) {
        throw new Error('Source wallet not found');
      }
      
      const response = await apiClient.post<{ transaction: Transaction }>(
        `/wallets/transfer`,
        {
          fromWalletId,
          toWalletId,
          amount,
          description,
          currency: sourceWallet.currency.toLowerCase() // Ensure currency is lowercase
        }
      );
      return response.data.transaction;
    } catch (error) {
      console.error('Transfer funds error:', error);
      throw this.handleError(error);
    }
  }

  async getContactWallets(userId: string): Promise<Wallet[]> {
    try {
      const response = await apiClient.get<{ wallets: Wallet[] }>(`/users/${userId}/wallets`);
      return response.data.wallets;
    } catch (error) {
      console.error('Get contact wallets error:', error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response?.data) {
      const apiError = error.response.data as ApiErrorResponse;
      return new Error(apiError.message);
    }
    return new Error('An unexpected error occurred');
  }
}

export const walletService = new WalletService();
