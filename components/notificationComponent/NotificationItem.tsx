import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { useNotification, AppNotification } from '@/context/NotificationContextProvider';

interface NotificationItemProps {
  notification: AppNotification;
  onPress?: () => void;
  onDelete?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onDelete,
}) => {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'information-circle';
    }
  };

  const getNotificationColor = () => {
    switch (notification.type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FFC107';
      case 'info':
      default:
        return '#2196F3';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          opacity: notification.read ? 0.7 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={getNotificationIcon()}
          size={24}
          color={getNotificationColor()}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text
          style={[
            styles.title,
            { color: isDark ? '#FFFFFF' : '#000000' },
          ]}
        >
          {notification.title}
        </Text>
        <Text
          style={[
            styles.message,
            { color: isDark ? '#B0B0B0' : '#666666' },
          ]}
        >
          {notification.message}
        </Text>
        <Text
          style={[
            styles.time,
            { color: isDark ? '#808080' : '#999999' },
          ]}
        >
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </Text>
      </View>
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
        >
          <Ionicons
            name="close-circle"
            size={20}
            color={isDark ? '#808080' : '#999999'}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
  },
  deleteButton: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
});