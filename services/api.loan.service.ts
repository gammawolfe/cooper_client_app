import apiClient from './authConfig';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoanRequest {
  _id: string;
  borrowerId: User;
  lenderId: User;
  amount: number;
  currency: string;
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
  status: 'pending' | 'approved' | 'declined' | 'cancelled';
  requestDate: string;
  reviewDate?: string;
  reviewerNotes?: string;
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

export interface RepaymentScheduleItem {
  _id: string;
  dueDate: string;
  amount: number;
  isPaid: boolean;
  paymentDate?: string;
  transactionId?: string;
}

export interface Loan {
  _id: string;
  borrowerId: User;
  lenderId: User;
  lenderWalletId: string;
  amount: number;
  currency: string;
  interestRate: number;
  outstandingBalance: number;
  durationInMonths: number;
  repaymentSchedule: RepaymentScheduleItem[];
  status: 'active' | 'paid' | 'defaulted' | 'late';
  nextPaymentDue?: string;
  totalPaid: number;
  lastPaymentDate?: string;
  completedPayments: number;
  remainingBalance: number;
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
  status: 'approved' | 'declined' | 'cancelled';
  reviewerNotes?: string;
}

interface ApiSuccessResponse {
  status: 'success';
  message: string;
}

class LoanService {
  async getUserLoanRequestsFromUser(): Promise<LoanRequest[]> {
    try {
      const response = await apiClient.get<LoanRequestResponse>('/loan-requests/outgoing');

      console.log('Get user loan requests response:', response.data);
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

      console.log('Create loan request response:', response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async approveLoanRequest(requestId: string, reviewerNotes?: string): Promise<ApiSuccessResponse> {
    try {
      console.log('Approving loan request:', { requestId, reviewerNotes });
      const response = await apiClient.put<ApiSuccessResponse>(
        `/loan-requests/${requestId}/approve`,
        { reviewerNotes }
      );
      console.log('Approve loan request response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Approve loan request error:', error);
      this.logApiError(error);
      throw error;
    }
  }

  async declineLoanRequest(requestId: string, reviewerNotes: string): Promise<ApiSuccessResponse> {
    try {
      console.log('Declining loan request:', { requestId, reviewerNotes });
      const response = await apiClient.put<ApiSuccessResponse>(
        `/loan-requests/${requestId}/decline`,
        { reviewerNotes }
      );
      console.log('Decline loan request response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Decline loan request error:', error);
      this.logApiError(error);
      throw error;
    }
  }

  async updateLoanRequestStatus(requestId: string, data: UpdateLoanRequestStatusDTO): Promise<ApiSuccessResponse> {
    try {
      console.log('Updating loan request status:', { requestId, data });
      const response = await apiClient.put<ApiSuccessResponse>(
        `/loan-requests/${requestId}/status`,
        data
      );
      console.log('Update loan request response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update loan request status error:', error);
      this.logApiError(error);
      throw error;
    }
  }

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
    } catch (error: any) {
      this.logApiError(error);
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

  async makePayment(loanId: string, paymentData: { amount: number; walletId: string; note?: string }): Promise<void> {
    try {
      const response = await apiClient.post(`/loans/${loanId}/pay`, paymentData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  private logApiError(error: any) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data: any; status: number } };
      if (axiosError.response) {
        console.info('Error response data:', axiosError.response.data);
      }
    }
  }
}

export default new LoanService();
