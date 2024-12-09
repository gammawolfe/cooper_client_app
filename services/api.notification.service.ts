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
      const response = await apiClient.get<{ notifications: AppNotification[] }>('/notifications');
      return response.data.notifications;
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<{ count: number }>('/notifications/unread/count');
      return response.data.count;
    } catch (error) {
      console.error('Get unread count error:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<AppNotification> {
    try {
      const response = await apiClient.patch<{ notification: AppNotification }>(
        `/notifications/${notificationId}/read`
      );
      return response.data.notification;
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.patch('/notifications/read-all');
    } catch (error) {
      console.error('Mark all as read error:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  }

  async clearAllNotifications(): Promise<void> {
    try {
      await apiClient.delete('/notifications');
    } catch (error) {
      console.error('Clear all notifications error:', error);
      throw error;
    }
  }
}

export default new NotificationService();