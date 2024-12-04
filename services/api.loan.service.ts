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
  requests: LoanRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Loan {
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
  totalRepaymentAmount: number;
  durationInMonths: number;
  repaymentSchedule: Array<{
    dueDate: string;
    amount: number;
    isPaid: boolean;
    _id: string;
  }>;
  status: 'active' | 'paid' | 'defaulted';
  startDate: string;
  createdAt: string;
  updatedAt: string;
}

interface LoanResponse {
  success: boolean;
  count: number;
  loans: Loan[];
}

interface UpdateLoanRequestStatusDTO {
  status: 'approved' | 'rejected' | 'cancelled';
  reviewerNotes?: string;
}

class LoanService {
  async getUserLoanRequestsFromUser(): Promise<LoanRequest[]> {
    try {
      const response = await apiClient.get<LoanRequestResponse>('/loan-requests/outgoing');
      // Filter out requests where the user is both borrower and lender
      return (response.data.requests || []).filter(
        request => request.borrowerId._id !== request.lenderId._id
      );
    } catch (error) {
      console.error('Get user loan requests error:', error);
      throw error;
    }
  }

  async getUserLoanRequestsToUser(): Promise<LoanRequest[]> {
    try {
      const response = await apiClient.get<LoanRequestResponse>('/loan-requests/incoming');
      // Filter out requests where the user is both borrower and lender
      return (response.data.requests || []).filter(
        request => request.borrowerId._id !== request.lenderId._id
      );
    } catch (error) {
      console.error('Get user loan requests error:', error);
      throw error;
    }
  }

  async getLoanRequestById(id: string): Promise<LoanRequest> {
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

  async updateLoanRequestStatus(requestId: string, data: UpdateLoanRequestStatusDTO): Promise<LoanRequest> {
    try {
      const response = await apiClient.put<{ success: boolean; loanRequest: LoanRequest }>(
        `/loan-requests/${requestId}`,
        data
      );
      return response.data.loanRequest;
    } catch (error) {
      console.error('Update loan request status error:', error);
      throw error;
    }
  }

  // Removed createLoanFromRequest since it's handled by the backend during approval

  async getLoansReceivedByUser(): Promise<Loan[]> {
    try {
      const response = await apiClient.get<LoanResponse>('/loans/received');
      return response.data.loans;
    } catch (error) {
      console.error('Get received loans error:', error);
      throw error;
    }
  }

  async getLoansGivenByUser(): Promise<Loan[]> {
    try {
      const response = await apiClient.get<LoanResponse>('/loans/issued');
      return response.data.loans;
    } catch (error) {
      console.error('Get given loans error:', error);
      throw error;
    }
  }

  async getLoan(id: string): Promise<Loan> {
    try {
      const response = await apiClient.get<{ success: boolean; loan: Loan }>(`/loans/${id}`);
      if (!response.data.success || !response.data.loan) {
        throw new Error('Loan not found');
      }
      return response.data.loan;
    } catch (error) {
      console.error('Get loan error:', error);
      throw error;
    }
  }
}

export default new LoanService();
