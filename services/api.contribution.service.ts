import apiClient from './authConfig';

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
}

export interface PayoutScheduleItem {
  memberId: string;
  cycleNumber: number;
  status: string;
  amount?: number;
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
  currentCycle: number;
  totalCycles: number;
  completedCycles: number;
  cycleLengthInDays: number;
  isActive: boolean;
  members: ContributionMember[];
  payoutSchedule: PayoutScheduleItem[];
  walletId: ContributionWallet;
  createdAt: string;
  updatedAt: string;
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
      const response = await apiClient.get<{ docs: Contribution[] }>('/pots');
      
      if (!response.data || !response.data.docs) {
        console.log('No contributions data in response:', response);
        return [];
      }

      // Only log if there are contributions
      /* if (response.data.docs.length > 0) {
        console.log('Got user contributions:', response.data.docs.length);
      } */
      
      return response.data.docs;
    } catch (error) {
      console.error('Get user contributions error:', error);
      throw error;
    }
  }

  async getContribution(id: string): Promise<Contribution> {
    try {
      const response = await apiClient.get<{ contribution: Contribution, success: boolean }>(`/pots/${id}`);
      console.log('Got contribution members:', JSON.stringify(response.data.contribution.members, null, 2));
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

  async addMembers(contributionId: string, memberIds: string[]): Promise<Contribution> {
    try {
      console.log('Adding members:', { contributionId, memberIds });
      const response = await apiClient.post<Contribution>(
        `/pots/${encodeURIComponent(contributionId)}/members`, 
        { memberIds }
      );
      console.log('Add members response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Add members error:', error);
      throw error;
    }
  }

  async activateContribution(contributionId: string): Promise<Contribution> {
    const response = await apiClient.patch(`/contributions/${contributionId}/activate`);
    return response.data;
  }

  async deactivateContribution(contributionId: string): Promise<Contribution> {
    const response = await apiClient.patch(`/contributions/${contributionId}/deactivate`);
    return response.data;
  }
}

export default new ContributionService();
