import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { authService, User } from '@/services/api.auth.service';
import * as SecureStore from 'expo-secure-store';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    mobile: string,
    password: string,
    addressLine1: string,
    addressLine2: string | undefined,
    city: string,
    postcode: string | undefined,
    country: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { 
    firstName: string;
    lastName: string;
    email: string;
    image?: string | null;
  }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        router.replace('/(tabs)');
      } else {
        setUser(null);
      }
    } catch (error) {
      console.info('Check user error:', error);
      setUser(null);
    } finally {
      setInitialCheckDone(true);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.login({ email, password });
      setUser(response.user);
      router.replace('/(tabs)');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    mobile: string,
    password: string,
    addressLine1: string,
    addressLine2: string | undefined,
    city: string,
    postcode: string | undefined,
    country: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.register({
        firstName,
        lastName,
        email,
        mobile,
        password,
        addressLine1,
        addressLine2,
        city,
        postcode,
        country
      });
      setUser(response.user);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('[AuthContext] Register error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      // Re-throw the error so the component can handle it
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // First attempt the API logout while we still have valid credentials
      await authService.logout();

      // After successful API logout, clear all auth-related state
      setUser(null);
      
      // Clear any app-specific storage or state
      await SecureStore.deleteItemAsync('user-session');
      await SecureStore.deleteItemAsync('user-preferences');
      
      // Reset any runtime state/cache
      setInitialCheckDone(false);
      
      // Navigate to auth screen
      router.replace('/(auth)');
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      
      // If API logout fails (e.g., token already expired), 
      // still perform a "force logout" by clearing everything
      setUser(null);
      await SecureStore.deleteItemAsync('user-session');
      await SecureStore.deleteItemAsync('user-preferences');
      setInitialCheckDone(false);
      
      router.replace('/(auth)');
      
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: { 
    firstName: string;
    lastName: string;
    email: string;
    image?: string | null;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.resetPasswordRequest({ email });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset password email');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
}