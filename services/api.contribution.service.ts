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
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  role: string;
  status: string;
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
  adminId: string;
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
      const response = await apiClient.get<{ docs: Contribution[] }>('/pots');
      return response.data.docs || [];
    } catch (error) {
      console.error('Get user contributions error:', error);
      throw error;
    }
  }

  async getContribution(id: string): Promise<Contribution> {
    try {
      const response = await apiClient.get<{ docs: Contribution[] }>(`/pots/${id}`);
      console.log('Got contribution response:', response.data);
      if (!response.data.docs || response.data.docs.length === 0) {
        throw new Error('Contribution not found');
      }
      return response.data.docs[0];
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
