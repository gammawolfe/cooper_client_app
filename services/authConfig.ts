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
}

// Create axios instance with settings
const settings = getCurrentSettings();
const apiClient = axios.create({
  baseURL: settings.apiUrl,
  timeout: TIME_OUT,
  withCredentials: true, // Enable credentials (cookies)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Debug logging utility
const debugLog = {
  token: (action: string, token: string | null) => {
    if (!token) {
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
      // Clear the axios Authorization header when removing tokens
      if (key === TOKEN_NAME || key === REFRESH_TOKEN_NAME) {
        delete apiClient.defaults.headers.common['Authorization'];
        console.info('[Storage] Cleared Authorization header');
      }
    } catch (error) {
      console.error('[Storage] Error removing token:', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  },
};

// Token management
const tokenManager = {
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('[Token] Error decoding token:', error);
      return true;
    }
  },

  async getValidToken(): Promise<string | null> {
    try {
      const token = await tokenStorage.get(TOKEN_NAME);
      if (!token) {
        return null;
      }

      if (this.isTokenExpired(token)) {
        return await this.refreshToken();
      }

      return token;
    } catch (error) {
      console.error('[Token] Error getting valid token:', error);
      return null;
    }
  },

  async refreshToken(): Promise<string | null> {
    try {
      const currentToken = await tokenStorage.get(TOKEN_NAME);
      if (!currentToken) {
        return null;
      }

      // Try to refresh using HTTP-only cookie first (if available)
      try {
        const response = await axios.post<RefreshResponse>(
          `${settings.apiUrl}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        if (response.data.accessToken) {
          await tokenStorage.save(TOKEN_NAME, response.data.accessToken);
          return response.data.accessToken;
        }
      } catch (cookieError) {
        console.info('[Token] Cookie refresh failed, trying stored refresh token');
      }

      // Fallback to stored refresh token
      const refreshToken = await tokenStorage.get(REFRESH_TOKEN_NAME);
      if (!refreshToken) {
        console.error('[Token] No refresh token available');
        return null;
      }

      const response = await axios.post<RefreshResponse>(
        `${settings.apiUrl}/auth/refresh`,
        { refreshToken }
      );

      if (response.data.accessToken) {
        await tokenStorage.save(TOKEN_NAME, response.data.accessToken);
        return response.data.accessToken;
      }

      return null;
    } catch (error) {
      console.error('[Token] Error refreshing token:', error);
      await this.clearTokens();
      return null;
    }
  },

  async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        tokenStorage.remove(TOKEN_NAME),
        tokenStorage.remove(REFRESH_TOKEN_NAME),
      ]);
    } catch (error) {
      console.error('[Token] Error clearing tokens:', error);
    }
  }
};

// Add request throttling
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

// Add request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Implement request throttling
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }
    lastRequestTime = Date.now();

    // Skip authentication for auth-related endpoints and public routes
    const publicEndpoints = ['/login', '/refresh-token', '/register', '/public'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));

    if (isPublicEndpoint) {
      return config;
    }

    try {
      const token = await tokenManager.getValidToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // If no token, let the request proceed - the server will handle authorization
      return config;
    } catch (error) {
      console.debug('[API] Auth token not available');
      return config; // Let request proceed without token
    }
  },
  (error) => {
    console.debug('[API] Request interceptor error:', error.message);
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

    // Handle rate limit errors
    if (error.response?.status === 429) {
      console.debug('[API] Rate limit hit, retrying after delay');
      const retryAfter = error.response.headers['retry-after'] || 1;
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return apiClient(originalRequest);
    }

    // Only attempt refresh for 401 errors on authenticated endpoints
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url?.includes('refresh-token') &&
        !originalRequest.url?.includes('login')) {
      
      originalRequest._retry = true;

      try {
        const newToken = await tokenManager.refreshToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Silently clear tokens - no need to show error
        await Promise.all([
          tokenStorage.remove(TOKEN_NAME),
          tokenStorage.remove(REFRESH_TOKEN_NAME)
        ]);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
