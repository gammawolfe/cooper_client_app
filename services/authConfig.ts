import getCurrentSettings from "@/utilities/settings";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

// Constants
export const TOKEN_NAME = "app_user_token";
export const REFRESH_TOKEN_NAME = "refresh_token";
const TIME_OUT = 1200000;

// Types
interface DecodedToken {
  exp: number;
  _id: string;
  iat: number;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// Create axios instance with settings
const settings = getCurrentSettings();
const apiClient = axios.create({
  baseURL: settings.apiUrl,
  timeout: TIME_OUT,
});

// Debug logging utility
const debugLog = {
  token: (action: string, token: string | null) => {
    if (!token) {
      //console.log(`[Token Debug] ${action}: null`);
      return;
    }
    try {
      const decoded = jwtDecode(token);
      console.info(`[Token Debug] ${action}:`, {
        token: token.substring(0, 20) + '...',
        decoded,
      });
    } catch (error) {
      console.info(`[Token Debug] ${action} (invalid token):`, {
        token: token.substring(0, 20) + '...',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
  
  api: (action: string, data: any) => {
    console.info(`[API Debug] ${action}:`, data);
  },
};

// Token storage utilities
export const tokenStorage = {
  async save(key: string, value: string | null): Promise<void> {
    try {
      if (!value) {
        console.error('[Storage] Attempted to save null/undefined value for key:', key);
        return;
      }
      
      debugLog.token('Saving to storage', value);
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('[Storage] Error saving token:', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  },

  async get(key: string): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      debugLog.token('Retrieved from storage', value);
      return value;
    } catch (error) {
      console.error('[Storage] Error getting token:', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      console.info('[Storage] Removing token:', key);
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('[Storage] Error removing token:', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
};

// Token management
const tokenManager = {
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      const isExpired = decoded.exp < currentTime;
      
      /* console.log('[Token] Checking expiration:', {
        exp: new Date(decoded.exp * 1000).toISOString(),
        now: new Date(currentTime * 1000).toISOString(),
        isExpired,
      }); */
      
      return isExpired;
    } catch (error) {
      console.error('[Token] Error checking expiration:', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return true;
    }
  },

  async getValidToken(): Promise<string | null> {
    try {
      console.info('[Token] Getting valid token...');
      const token = await tokenStorage.get(TOKEN_NAME);
      
      if (!token) {
        console.info('[Token] No token found, attempting refresh');
        return await this.refreshToken();
      }

      // Don't attempt refresh if token is invalid format
      try {
        jwtDecode(token);
      } catch (error) {
        console.error('[Token] Invalid token format, clearing tokens');
        await Promise.all([
          tokenStorage.remove(TOKEN_NAME),
          tokenStorage.remove(REFRESH_TOKEN_NAME),
        ]);
        return null;
      }

      if (this.isTokenExpired(token)) {
        console.info('[Token] Token expired, attempting refresh');
        return await this.refreshToken();
      }

      //console.log('[Token] Using existing valid token');
      return token;
    } catch (error) {
      console.error('[Token] Error getting valid token:', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  },

  async refreshToken(): Promise<string | null> {
    try {
      console.info('[Refresh] Starting token refresh...');
      const refreshToken = await tokenStorage.get(REFRESH_TOKEN_NAME);
      
      if (!refreshToken) {
        console.info('[Refresh] No refresh token found');
        return null;
      }

      // Don't attempt refresh if refresh token is invalid format
      try {
        jwtDecode(refreshToken);
      } catch (error) {
        console.error('[Refresh] Invalid refresh token format, clearing tokens');
        await Promise.all([
          tokenStorage.remove(TOKEN_NAME),
          tokenStorage.remove(REFRESH_TOKEN_NAME),
        ]);
        return null;
      }

      debugLog.api('Refresh request', { refresh_token: refreshToken.substring(0, 20) + '...' });
      
      const response = await apiClient.post<RefreshResponse>('/users/refresh-token', {
        refresh_token: refreshToken,
      });

      debugLog.api('Refresh response', response.data);

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      if (!accessToken || !newRefreshToken) {
        console.error('[Refresh] Invalid response: missing tokens', response.data);
        await Promise.all([
          tokenStorage.remove(TOKEN_NAME),
          tokenStorage.remove(REFRESH_TOKEN_NAME),
        ]);
        return null;
      }

      console.info('[Refresh] Saving new tokens...');
      await Promise.all([
        tokenStorage.save(TOKEN_NAME, accessToken),
        tokenStorage.save(REFRESH_TOKEN_NAME, newRefreshToken),
      ]);

      return accessToken;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[Refresh] API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      } else {
        console.error('[Refresh] Error:', error instanceof Error ? error.message : 'Unknown error');
      }

      console.info('[Refresh] Clearing tokens due to refresh failure');
      await Promise.all([
        tokenStorage.remove(TOKEN_NAME),
        tokenStorage.remove(REFRESH_TOKEN_NAME),
      ]);
      
      return null;
    }
  },
};

// Add detailed request logging
apiClient.interceptors.request.use(request => {
  /* console.log('[API Request]', {
    url: request.baseURL + request.url,
    method: request.method?.toUpperCase(),
    headers: request.headers,
    data: request.data,
  }); */
  return request;
});

apiClient.interceptors.response.use(
  response => {
    /* console.log('[API Response]', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
    }); */
    return response;
  },
  error => {
    if (axios.isAxiosError(error)) {
      console.error('[API Error]', {
        url: error.config?.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        data: error.response?.data,
        headers: error.config?.headers,
      });
    }
    return Promise.reject(error);
  }
);

// Add request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    //console.log('[API] Making request to:', config.url);
    const token = await tokenManager.getValidToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.info('[API] Added token to request');
    } else {
      console.info('[API] No token available for request');
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Request interceptor error:', error.message);
    return Promise.reject(error);
  }
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.error('[API] Response error:', {
      url: originalRequest?.url,
      status: error.response?.status,
      message: error.message,
    });

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.info('[API] Attempting to refresh token for failed request');
      originalRequest._retry = true;

      try {
        const token = await tokenManager.refreshToken();
        if (token) {
          //console.log('[API] Retrying request with new token');
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        } else {
          console.info('[API] No new token available, request will fail');
        }
      } catch (refreshError) {
        console.error('[API] Error refreshing token in interceptor:', 
          refreshError instanceof Error ? refreshError.message : 'Unknown error'
        );
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
