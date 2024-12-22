import apiClient from './authConfig';

export interface Transaction {
  _id: string;
  walletId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'transfer';
  currency: string;
  description?: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  __v: number;
  metadata?: {
    fromWalletId?: string;
    toWalletId?: string;
    transferType?: 'in' | 'out';
    description?: string;
    contributionId?: string;
    contributionName?: string;
    cycleNumber?: number;
    memberId?: string;
  };
  fromWalletId?: {
    _id: string;
    name: string;
    balance: number;
    currency: string;
    source: string;
    isActive: boolean;
    contributionId: string | null;
    userId: string;
  };
  toWalletId?: {
    _id: string;
    name: string;
    balance: number;
    currency: string;
    source: string;
    isActive: boolean;
    contributionId: string | null;
    userId: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionDTO {
  walletId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'transfer';
  currency: string;
  description?: string;
}

class TransactionService {
  // Get all transactions for a user
  async getUserTransactions(
    userId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Transaction[]> {
    try {
      const response = await apiClient.get<{ 
        success: boolean; 
        docs: Transaction[];
        totalDocs: number;
        limit: number;
        totalPages: number;
        page: number;
        pagingCounter: number;
        hasPrevPage: boolean;
        hasNextPage: boolean;
        prevPage: number | null;
        nextPage: number | null;
      }>(
        `/users/${userId}/transactions`,
        {
          params: {
            limit,
            offset,
          },
        }
      );

      console.log('Fetched transactions:', response.data.docs);
      return response.data.docs;
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
      const response = await apiClient.get<{ 
        transactions: Transaction[];
        total: number;
        page: number;
        limit: number;
      }>(
        `/wallets/${walletId}/transactions`,
        {
          params: {
            limit,
            page: Math.floor(offset / limit) + 1,
          },
        }
      );
      return response.data.transactions;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get a single transaction by ID
  async getTransaction(id: string): Promise<Transaction> {
    try {
      const response = await apiClient.get<{ success: boolean; transaction: Transaction }>(
        `/transactions/${id}`
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
        '/transactions',
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
        `/transactions/${id}`,
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
      await apiClient.delete(`/transactions/${id}`);
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