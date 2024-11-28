import apiClient from './authConfig';

export interface LoanRequest {
  _id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedBy: string;
  requestedFrom: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

class LoanService {
  async getUserLoanRequestsFromUser(): Promise<LoanRequest[]> {
    try {
      const response = await apiClient.get<LoanRequest[]>('/loan-requests/outgoing');
      //console.log(" outgoingloan requests", response.data);
      return response.data;
    } catch (error) {
      console.error('Get user loan requests error:', error);
      throw error;
    }
  }

  async getUserLoanRequestsToUser(): Promise<LoanRequest[]> {
    try {
      const response = await apiClient.get<LoanRequest[]>('/loan-requests/incoming');
      //console.log(" incominingloan requests", response.data);
      return response.data;
    } catch (error) {
      console.error('Get user loan requests error:', error);
      throw error;
    }
  }

  async getLoanRequest(id: string): Promise<LoanRequest> {
    try {
      const response = await apiClient.get<LoanRequest>(`/loan-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get loan request error:', error);
      throw error;
    }
  }
}

export default new LoanService();
