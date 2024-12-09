import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import NotificationService, { AppNotification } from '@/services/api.notification.service';
import { useAuth } from './AuthContextProvider';

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Re-export the AppNotification type from the service
export type { AppNotification } from '@/services/api.notification.service';

interface NotificationContextType {
  notification?: Notifications.Notification;
  expoPushToken?: string;
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
  const [expoPushToken, setExpoPushToken] = useState<string>();
  const [notification, setNotification] = useState<Notifications.Notification>();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const { user } = useAuth();

  async function registerForPushNotificationsAsync() {
    let token;

    if (!Device.isDevice) {
      console.log('Push notifications require a physical device or iOS simulator');
      return;
    }

    // Request specific permissions for iOS
    if (Platform.OS === 'ios') {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        // Request iOS specific permissions
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get iOS push notification permissions');
        return;
      }
    } else if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    try {
      console.log('Getting Expo push token...');
      const expoPushTokenResponse = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      token = expoPushTokenResponse.data;
      console.log('Received Expo push token:', token);
      
      // Register token with backend
      if (token) {
        try {
          console.log('Attempting to register push token:', token);
          await NotificationService.registerPushToken(token);
          console.log('Successfully registered push token with backend');
          setExpoPushToken(token);
        } catch (err) {
          console.error('Error registering push token:', err);
        }
      }
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  }

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
    registerForPushNotificationsAsync();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      fetchNotifications();
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
      // Handle notification response (e.g., navigation)
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
      // Unregister push token when component unmounts
      if (expoPushToken) {
        NotificationService.unregisterPushToken(expoPushToken).catch(console.error);
      }
    };
  }, []);

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
    notification,
    expoPushToken,
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
