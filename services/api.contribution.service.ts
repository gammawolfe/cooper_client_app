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
      // Add populate parameter to get user information
      const response = await apiClient.get<{ contribution: Contribution, success: boolean }>(
        `/pots/${id}?populate=members.userId`
      );
      console.log('Got contribution response:', JSON.stringify(response.data, null, 2));
      console.log('Members:', response.data.contribution.members.map(member => ({
        id: member._id,
        userId: member.userId,
        role: member.role
      })));
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

  async activateContribution(contributionId: string): Promise<Contribution> {
    const response = await apiClient.patch<{ contribution: Contribution, success: boolean }>(
      `/pots/${contributionId}/activate`
    );
    return response.data.contribution;
  }

  async deactivateContribution(contributionId: string): Promise<Contribution> {
    const response = await apiClient.patch<{ contribution: Contribution, success: boolean }>(
      `/pots/${contributionId}/deactivate`
    );
    return response.data.contribution;
  }
}

export default new ContributionService();
