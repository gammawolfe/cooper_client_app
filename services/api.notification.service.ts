import apiClient from './authConfig';

// Types
export interface AppNotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  data?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface CreateNotificationDTO {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: Record<string, any>;
}

class NotificationService {
  async getNotifications(): Promise<AppNotification[]> {
    try {
      console.log('Making API call to get notifications');
      const response = await apiClient.get<{ notifications: AppNotification[] }>('/notifications');
      console.log('API response:', response.data);
      return response.data.notifications;
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      console.log('Making API call to get unread count');
      const response = await apiClient.get<{ count: number }>('/notifications/unread/count');
      console.log('API response:', response.data);
      return response.data.count;
    } catch (error) {
      console.error('Get unread count error:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<AppNotification> {
    try {
      console.log('Making API call to mark as read:', notificationId);
      const response = await apiClient.patch<{ notification: AppNotification }>(
        `/notifications/${notificationId}/read`
      );
      console.log('API response:', response.data);
      return response.data.notification;
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      console.log('Making API call to mark all as read');
      await apiClient.patch('/notifications/read-all');
      console.log('API response: success');
    } catch (error) {
      console.error('Mark all as read error:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      console.log('Making API call to delete notification:', notificationId);
      await apiClient.delete(`/notifications/${notificationId}`);
      console.log('API response: success');
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  }

  async clearAllNotifications(): Promise<void> {
    try {
      console.log('Making API call to clear all notifications');
      await apiClient.delete('/notifications');
      console.log('API response: success');
    } catch (error) {
      console.error('Clear all notifications error:', error);
      throw error;
    }
  }

  async registerPushToken(token: string): Promise<void> {
    try {
      console.log('Making API call to register token:', token);
      const response = await apiClient.post('/notifications/push-token', { token });
      console.log('API response:', response.data);
    } catch (error) {
      console.error('Register push token error:', error);
      throw error;
    }
  }

  async unregisterPushToken(token: string): Promise<void> {
    try {
      console.log('Making API call to unregister token:', token);
      await apiClient.delete('/notifications/push-token', { data: { token } });
      console.log('API response: success');
    } catch (error) {
      console.error('Unregister push token error:', error);
      throw error;
    }
  }
}

export default new NotificationService();