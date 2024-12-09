import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import NotificationService, { AppNotification } from '@/services/api.notification.service';
import { useAuth } from './AuthContextProvider';

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import { Platform } from 'react-native';

// Re-export the AppNotification type from the service
export type { AppNotification } from '@/services/api.notification.service';

interface NotificationContextType {
  notification?: Notifications.Notification;
  expoPushToken?: Notifications.ExpoPushToken;
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await NotificationService.getNotifications();
      setNotifications(response);
      
      // Update unread count
      const count = await NotificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await NotificationService.markAsRead(notificationId);
      await fetchNotifications(); // Refresh to get updated state
    } catch (err) {
      setError('Failed to mark notification as read');
      console.error('Error marking notification as read:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await NotificationService.markAllAsRead();
      await fetchNotifications(); // Refresh to get updated state
    } catch (err) {
      setError('Failed to mark all notifications as read');
      console.error('Error marking all notifications as read:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await NotificationService.deleteNotification(notificationId);
      await fetchNotifications(); // Refresh the list after deletion
    } catch (err) {
      setError('Failed to delete notification');
      console.error('Error deleting notification:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await NotificationService.clearAllNotifications();
      await fetchNotifications(); // Refresh to get updated state
    } catch (err) {
      setError('Failed to clear all notifications');
      console.error('Error clearing all notifications:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    error,
    refreshNotifications: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
