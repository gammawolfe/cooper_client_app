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

  async getLoansReceivedByUser(): Promise<Loan[]> {
    try {
      const response = await apiClient.get<LoanResponse>('/loans/received');
      console.log('Received loansXXXXXXXXXXXX:', response.data);
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
}

export default new LoanService();
