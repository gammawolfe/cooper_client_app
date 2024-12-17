import { AxiosError } from 'axios';
import apiClient from './authConfig';
import { IContact } from '@/types/contact';

export interface ContributionWallet {
  _id: string;
  name: string;
  balance: number;
  currency: string;
  source: string;
  transactions: any[]; 
  userId: string;
  contributionId: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ContributionMember {
  _id: string;
  userId: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  role: string;
  payoutOrder: number;
  contributionId: string;
  contributionWalletId: string;
  totalPaid: number;
  contributionDates: string[];
  status: string;
  cycleContributions: any[];
  createdAt: string;
  updatedAt: string;
}

export interface PayoutScheduleItem {
  cycle: number;
  memberId: {
    _id: string;
    userId: string;
    role: string;
    payoutOrder: number;
    contributionId: string;
    contributionWalletId: string;
    totalPaid: number;
    contributionDates: string[];
    status: string;
    cycleContributions: any[];
    createdAt: string;
    updatedAt: string;
    __v: number;
    id: string;
  };
  payoutDate: string;
  amount: number;
  status: string;
  _id: string;
  id: string;
}

export interface Contribution {
  _id: string;
  name: string;
  description: string;
  adminId: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  currency: string;
  fixedContributionAmount: number;
  totalCycles: number;
  cycleLengthInDays: number;
  members: ContributionMember[];
  currentCycle: number;
  completedCycles: number;
  status: string;
  payoutSchedule: PayoutScheduleItem[];
  walletId: ContributionWallet;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateContributionDTO {
  name: string;
  description: string;
  currency: string;
  fixedContributionAmount: number;
  totalCycles: number;
  cycleLengthInDays: number;
}

class ContributionService {
  async getUserContributions(): Promise<Contribution[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        docs: Contribution[];
        totalDocs: number;
        limit: number;
        totalPages: number;
        page: number;
        pagingCounter: number;
        hasPrevPage: boolean;
        hasNextPage: boolean;
        prevPage: number | null;
        nextPage: number | null;
      }>('/pots', {
        params: {
          populate: [
            'members.userId',
            'walletId',
            'adminId'
          ].join(' '),
          includeMember: true, // Make sure we get contributions where user is a member
          limit: 100 // Get more contributions per page
        }
      });
      
      if (!response.data || !response.data.docs) {
        console.log('No contributions data in response:', response.data);
        return [];
      }
      
      return response.data.docs;
    } catch (error) {
      console.error('Get user contributions error:', error);
      throw error;
    }
  }

  async getContribution(id: string): Promise<Contribution> {
    try {
      // Add populate parameter to get user information and wallet transactions
      const response = await apiClient.get<{ contribution: Contribution, success: boolean }>(
        `/pots/${id}?populate=members.userId walletId.transactions`
      );
      if (!response.data.contribution) {
        throw new Error('Contribution not found');
      }
      return response.data.contribution;
    } catch (error) {
      console.error('Get contribution error:', error);
      throw error;
    }
  }

  async createContribution(data: CreateContributionDTO): Promise<Contribution> {
    try {
      const response = await apiClient.post<Contribution>('/pots', data);
      return response.data;
    } catch (error) {
      console.error('Create contribution error:', error);
      throw error;
    }
  }

  async addMembers(id: string, contacts: IContact[]): Promise<Contribution> {
    try {
      console.log('Adding members:', { id, contacts });
      
      // Add members one by one since backend expects single member addition
      for (const contact of contacts) {
        if (!contact.email) {
          console.warn('Skipping contact without email:', contact.name);
          continue;
        }

        await apiClient.post<{ success: boolean; message: string; memberCount: number }>(
          `/pots/${encodeURIComponent(id)}/members`, 
          { 
            email: contact.email,
            firstName: contact.name.split(' ')[0], // Best effort name splitting
            lastName: contact.name.split(' ').slice(1).join(' '),
            phoneNumber: contact.phoneNumber || ''
          }
        );
      }
      
      // Fetch the updated contribution after adding all members
      const updatedContribution = await this.getContribution(id);
      return updatedContribution;
    } catch (error) {
      console.error('Add members error:', error);
      throw error;
    }
  }

  async activateContribution(id: string): Promise<Contribution> {
    const response = await apiClient.put<{ contribution: Contribution, success: boolean }>(
      `/pots/${id}/activate`
    );
    return response.data.contribution;
  }

  async deactivateContribution(id: string): Promise<Contribution> {
    const response = await apiClient.put<{ contribution: Contribution, success: boolean }>(
      `/pots/${id}/deactivate`
    );
    return response.data.contribution;
  }

  async updateMemberOrder(contributionId: string, memberOrders: Array<{ memberId: string; payoutOrder: number; }>) {
    try {
      console.log('Sending member orders:', { contributionId, memberOrders });
      const { data } = await apiClient.put(`/pots/${contributionId}/member-order`, { memberOrders });
      console.log('Response:', data);
      return data.contribution;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error updating member order:', error.response?.data);
      }
      throw error;
    }
  }

  async makePayment(contributionId: string, paymentData: { amount: number; walletId: string }): Promise<Contribution> {
    try {
      const response = await apiClient.post<{ contribution: Contribution, success: boolean }>(
        `/pots/${contributionId}/contribute`,
        paymentData
      );
      return response.data.contribution;
    } catch (error) {
      console.error('Make payment error:', error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }
}

export default new ContributionService();
