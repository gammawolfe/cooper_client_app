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
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode?: string;
  country: string;
}

interface ResetPasswordDTO {
  email: string;
}

interface ResetPasswordConfirmDTO {
  email: string;
  token: string;
  password: string;
}

class AuthService {
  async login(credentials: LoginDTO): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/users/login', credentials);
      const { accessToken, refreshToken, user } = response.data;

      // Always store the access token
      await tokenStorage.save(TOKEN_NAME, accessToken);

      // Store refresh token if provided in response body
      if (refreshToken) {
        await tokenStorage.save(REFRESH_TOKEN_NAME, refreshToken);
      }

      // Note: HTTP-only cookie refresh token will be automatically handled by the browser
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Login failed: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async register(data: RegisterDTO): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/users/register', data);
      const { accessToken, refreshToken, user } = response.data;

      // Always store the access token
      await tokenStorage.save(TOKEN_NAME, accessToken);

      // Store refresh token if provided in response body
      if (refreshToken) {
        await tokenStorage.save(REFRESH_TOKEN_NAME, refreshToken);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Registration failed: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Clear tokens before making the logout request
      await tokenStorage.remove(TOKEN_NAME);
      await tokenStorage.remove(REFRESH_TOKEN_NAME);

      // Make logout request - this will clear HTTP-only cookies if they exist
      await apiClient.post('/users/logout');
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      // Still clear tokens even if the request fails
      await tokenStorage.remove(TOKEN_NAME);
      await tokenStorage.remove(REFRESH_TOKEN_NAME);
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await apiClient.post('/users/validate-token', { token });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      // First check if we have a token
      const token = await tokenStorage.get(TOKEN_NAME);
      if (!token) {
        console.log('[Auth] No token found, user is not authenticated');
        return null;
      }

      const response = await apiClient.get<{ user: User }>('/users/me');
      return response.data.user;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.info('[Auth] Get current user error:', {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });
      } else {
        console.info('[Auth] Get current user error:', error instanceof Error ? error.message : 'Unknown error');
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

  async resetPasswordRequest(data: ResetPasswordDTO): Promise<void> {
    try {
      await apiClient.post('/users/reset-password', data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Reset password request failed: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async resetPasswordConfirm(data: ResetPasswordConfirmDTO): Promise<void> {
    try {
      await apiClient.post('/users/reset-password-confirm', data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Reset password confirm failed: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
