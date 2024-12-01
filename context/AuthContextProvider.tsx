import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { authService, User } from '@/services/api.auth.service';

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
      console.error('Check user error:', error);
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
      console.error('[AuthContext] Registration error:', error);
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
      setIsLoading(true);
      // First clear the user state to prevent any authenticated requests
      setUser(null);
      
      // Then perform the logout
      await authService.logout();

      // Force immediate navigation to prevent any authenticated routes from loading
      router.push('/');
      
      // Reset any error state
      setError(null);
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      // Even if logout fails, ensure we're on the login screen
      router.push('/');
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
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Profile update failed');
      throw error;
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