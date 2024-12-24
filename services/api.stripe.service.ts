import apiClient from './authConfig';

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
  dateOfBirth?: string;  // For personal accounts
  companyName?: string; // For business accounts
  companyNumber?: string; // For business accounts
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
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  created: number;
  description?: string;
  failureReason?: string;
  estimatedArrivalDate?: number;
}

class StripeService {
  async getConfig() {
    const response = await apiClient.get('/stripe/config');
    return response.data;
  }

  async addBankAccount(bankDetails: BankDetails) {
    const response = await apiClient.post('/stripe/bank-accounts', bankDetails);
    return response.data;
  }

  async getBankAccounts() {
    const response = await apiClient.get('/stripe/bank-accounts');
    return response.data;
  }

  async removeBankAccount(bankAccountId: string) {
    const response = await apiClient.delete(`/stripe/bank-accounts/${bankAccountId}`);
    return response.data;
  }

  async setDefaultBankAccount(bankAccountId: string) {
    const response = await apiClient.post(`/stripe/bank-accounts/${bankAccountId}/default`);
    return response.data;
  }

  /**
   * Initiate a deposit from a bank account to the Cooper wallet
   * @param depositRequest Details of the deposit request
   * @returns Transfer response with status and tracking information
   */
  async initiateDeposit(depositRequest: DepositRequest): Promise<TransferResponse> {
    const response = await apiClient.post('/stripe/deposits', depositRequest);
    return response.data;
  }

  /**
   * Initiate a withdrawal from the Cooper wallet to a bank account
   * @param withdrawalRequest Details of the withdrawal request
   * @returns Transfer response with status and tracking information
   */
  async initiateWithdrawal(withdrawalRequest: WithdrawalRequest): Promise<TransferResponse> {
    const response = await apiClient.post('/stripe/withdrawals', withdrawalRequest);
    return response.data;
  }

  /**
   * Get the status of a transfer (deposit or withdrawal)
   * @param transferId ID of the transfer to check
   * @returns Current status of the transfer
   */
  async getTransferStatus(transferId: string): Promise<TransferResponse> {
    const response = await apiClient.get(`/stripe/transfers/${transferId}`);
    return response.data;
  }

  /**
   * Get all transfers (deposits and withdrawals) for the user
   * @param type Optional filter by type ('deposit' or 'withdrawal')
   * @param status Optional filter by status
   * @returns List of transfers
   */
  async getTransfers(type?: 'deposit' | 'withdrawal', status?: TransferResponse['status']) {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    
    const response = await apiClient.get(`/stripe/transfers?${params.toString()}`);
    return response.data;
  }
}

export default new StripeService();
