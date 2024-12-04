import apiClient from './authConfig';

export interface Transaction {
  _id: string;
  walletId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'transfer';
  currency: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  __v: number;
}

export interface CreateTransactionDTO {
  walletId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'transfer';
  currency: string;
}

class TransactionService {
  // Get all transactions for a user
  async getUserTransactions(
    userId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Transaction[]> {
    try {
      const response = await apiClient.get<{ success: boolean; count: number; transactions: Transaction[] }>(
        `/users/${userId}/transactions`,
        {
          params: {
            limit,
            offset,
          },
        }
      );
      console.log('Fetched user transactions:', response.data);
      return response.data.transactions;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get transactions for a specific wallet
  async getWalletTransactions(
    walletId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Transaction[]> {
    try {
      const response = await apiClient.get<{ success: boolean; count: number; transactions: Transaction[] }>(
        `/api/v1/wallets/${walletId}/transactions`,
        {
          params: {
            limit,
            offset,
          },
        }
      );
      console.log('Fetched wallet transactions:', response.data.transactions);
      return response.data.transactions;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get a single transaction by ID
  async getTransaction(id: string): Promise<Transaction> {
    try {
      const response = await apiClient.get<{ success: boolean; transaction: Transaction }>(
        `/api/v1/transactions/${id}`
      );
      return response.data.transaction;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create a new transaction
  async createTransaction(transactionData: CreateTransactionDTO): Promise<Transaction> {
    try {
      const response = await apiClient.post<{ success: boolean; transaction: Transaction }>(
        '/api/v1/transactions',
        transactionData
      );
      return response.data.transaction;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update an existing transaction
  async updateTransaction(
    id: string,
    updates: Partial<CreateTransactionDTO>
  ): Promise<Transaction> {
    try {
      const response = await apiClient.patch<{ success: boolean; transaction: Transaction }>(
        `/api/v1/transactions/${id}`,
        updates
      );
      return response.data.transaction;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete a transaction
  async deleteTransaction(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/v1/transactions/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    console.error('Transaction service error:', error);
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return new Error('An error occurred while processing the transaction');
  }
}

export const transactionService = new TransactionService();