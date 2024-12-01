import apiClient from './authConfig';

export interface LoanRequest {
  _id: string;
  borrowerId: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  lenderId: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  amount: number;
  interestRate: number;
  borrowerNotes: string;
  totalRepaymentAmount: number;
  durationInMonths: number;
  repaymentSchedule: Array<{
    dueDate: string;
    amount: number;
    isPaid: boolean;
    _id: string;
  }>;
  recipientWalletId: {
    _id: string;
    name: string;
    balance: number;
  };
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoanRequestDTO {
  amount: number;
  currency: string;
  lenderId: string;
  borrowerNotes?: string;
  interestRate: number;
  durationInMonths: number;
  repaymentScheduleInDays: number;
  recipientWalletId?: string;
}

interface LoanRequestResponse {
  success: boolean;
  count: number;
  loanRequests: LoanRequest[];
}

class LoanService {
  async getUserLoanRequestsFromUser(): Promise<LoanRequest[]> {
    try {
      const response = await apiClient.get<LoanRequestResponse>('/loan-requests/outgoing');
      return response.data.loanRequests;
    } catch (error) {
      console.error('Get user loan requests error:', error);
      throw error;
    }
  }

  async getUserLoanRequestsToUser(): Promise<LoanRequest[]> {
    try {
      const response = await apiClient.get<LoanRequestResponse>('/loan-requests/incoming');
      return response.data.loanRequests;
    } catch (error) {
      console.error('Get user loan requests error:', error);
      throw error;
    }
  }

  async getLoanRequest(id: string): Promise<LoanRequest> {
    try {
      console.log('Fetching loan request with ID:', id);
      const response = await apiClient.get<{ success: boolean; loanRequest: LoanRequest }>(`/loan-requests/${id}`);
      console.log('Loan request response:', response.data);
      if (!response.data.success || !response.data.loanRequest) {
        throw new Error('Loan request not found');
      }
      return response.data.loanRequest;
    } catch (error) {
      console.error('Get loan request error:', error);
      throw error;
    }
  }

  async createLoanRequest(data: CreateLoanRequestDTO): Promise<any> {
    try {
      const response = await apiClient.post(`${apiClient.defaults.baseURL}/loan-requests`, {
        ...data,
        borrowerNotes: data.borrowerNotes || ''
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new LoanService();
