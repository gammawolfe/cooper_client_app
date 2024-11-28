import apiClient from './authConfig';

interface InviteResponse {
  success: boolean;
  message: string;
}

class InviteService {
  async inviteUser(email: string, mobile?: string): Promise<InviteResponse> {
    try {
      const response = await apiClient.post<InviteResponse>('/users/invite', {
        email,
        mobile,
      });
      console.log('[Invite] Sent invitation:', { email, mobile });
      return response.data;
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw error;
    }
  }
}

export const inviteService = new InviteService();
