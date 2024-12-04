import apiClient from './authConfig';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  success: boolean;
  user: User;
}

class UserService {
  async getUserById(id: string): Promise<User> {
    try {
      const response = await apiClient.get<UserResponse>(`/users/${id}`);
      return response.data.user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async updateUser(data: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.patch<UserResponse>('/users/profile', data);
      return response.data.user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
}

export default new UserService();
