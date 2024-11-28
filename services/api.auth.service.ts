import axios from 'axios';
import apiClient, { TOKEN_NAME, REFRESH_TOKEN_NAME, tokenStorage } from './authConfig';
import { Wallet } from './api.wallet.service';

// Types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  image?: string;
  mobile?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postcode?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface ApiErrorResponse {
  message: string;
  status: number;
}

interface LoginDTO {
  email: string;
  password: string;
}

interface RegisterDTO {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
}

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('[Auth] Attempting login:', { email });
      const response = await apiClient.post<AuthResponse>('/users/login', {
        email,
        password,
      });

      console.log('[Auth] Login response:', {
        status: response.status,
        hasUser: !!response.data.user,
        hasToken: !!response.data.accessToken,
        hasRefreshToken: !!response.data.refreshToken,
      });
      
      if (!response.data.accessToken) {
        throw new Error('No access token received from server');
      }

      if (!response.data.refreshToken) {
        throw new Error('No refresh token received from server');
      }

      // Store tokens
      console.log('[Auth] Storing tokens...');
      await Promise.all([
        tokenStorage.save(TOKEN_NAME, response.data.accessToken),
        tokenStorage.save(REFRESH_TOKEN_NAME, response.data.refreshToken)
      ]);

      return response.data;
    } catch (error) {
      console.error('[Auth] Login error:', error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack,
      } : error);
      
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiErrorResponse;
        throw new Error(apiError.message);
      }
      throw error;
    }
  }

  async register(firstName: string, lastName: string, email: string, mobile: string, password: string): Promise<AuthResponse> {
    try {
      console.log('[Auth] Attempting registration:', { email });
      const response = await apiClient.post<AuthResponse>('/users/register', {
        firstName,
        lastName,
        email,
        mobile,
        password,
      });

      console.log('[Auth] Register response:', {
        status: response.status,
        hasUser: !!response.data.user,
        hasToken: !!response.data.accessToken,
        hasRefreshToken: !!response.data.refreshToken,
      });
      
      if (!response.data.accessToken) {
        throw new Error('No access token received from server');
      }

      if (!response.data.refreshToken) {
        throw new Error('No refresh token received from server');
      }

      // Store tokens
      console.log('[Auth] Storing tokens...');
      await Promise.all([
        tokenStorage.save(TOKEN_NAME, response.data.accessToken),
        tokenStorage.save(REFRESH_TOKEN_NAME, response.data.refreshToken)
      ]);

      return response.data;
    } catch (error) {
      console.error('[Auth] Register error:', error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack,
      } : error);
      
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiErrorResponse;
        throw new Error(apiError.message);
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('[Auth] Logging out...');
      // Remove both tokens
      await Promise.all([
        tokenStorage.remove(TOKEN_NAME),
        tokenStorage.remove(REFRESH_TOKEN_NAME)
      ]);
      console.log('[Auth] Logout successful');
    } catch (error) {
      console.error('[Auth] Logout error:', error instanceof Error ? {
        message: error.message,
        name: error.name,
      } : error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      //console.log('[Auth] Getting current user...');
      const response = await apiClient.get<{ user: User }>('/users/me');
      /* console.log('[Auth] Current user retrieved:', {
        userId: response.data.user._id,
        email: response.data.user.email,
      }); */
      return response.data.user;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[Auth] Get current user error:', {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });
      } else {
        console.error('[Auth] Get current user error:', error instanceof Error ? error.message : 'Unknown error');
      }
      return null;
    }
  }

  async getAllAppUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get<{ users: User[] }>('/users');
      //console.log('[Auth] Fetched registered users:', response.data.users.length);
      return response.data.users;
    } catch (error) {
      console.error('Error fetching registered users:', error);
      throw error;
    }
  }

  async updateProfile(data: { 
    firstName: string; 
    lastName: string; 
    email: string; 
    image?: string | null 
  }): Promise<User> {
    try {
      console.log('[Auth] Updating profile:', { email: data.email });
      
      let formData;
      if (data.image) {
        // Create form data for image upload
        formData = new FormData();
        formData.append('firstName', data.firstName);
        formData.append('lastName', data.lastName);
        formData.append('email', data.email);
        
        // Get file extension from URI
        const uriParts = data.image.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('image', {
          uri: data.image,
          name: `profile.${fileType}`,
          type: `image/${fileType}`
        } as any);

        console.log('[Auth] Updating profile with image...');
        const response = await apiClient.put<{ user: User }>(
          '/users/me',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        console.log('[Auth] Profile updated with image');
        return response.data.user;
      } else {
        // Regular JSON request without image
        console.log('[Auth] Updating profile without image...');
        const response = await apiClient.put<{ user: User }>(
          '/users/me',
          data
        );
        console.log('[Auth] Profile updated');
        return response.data.user;
      }
    } catch (error) {
      console.error('[Auth] Update profile error:', error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack,
      } : error);
      throw error;
    }
  }
}

export const authService = new AuthService();
