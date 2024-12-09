import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNotification, AppNotification } from '@/context/NotificationContextProvider';
import { NotificationItem } from './NotificationItem';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export const NotificationList: React.FC = () => {
  const {
    notifications,
    isLoading,
    refreshNotifications,
    markAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotification();
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  const handleNotificationPress = async (notificationId: string) => {
    if (notificationId) {
      await markAsRead(notificationId);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (notificationId) {
      await deleteNotification(notificationId);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="notifications-off-outline"
        size={48}
        color={isDark ? '#808080' : '#999999'}
      />
      <Text
        style={[
          styles.emptyText,
          { color: isDark ? '#808080' : '#999999' },
        ]}
      >
        No notifications yet
      </Text>
    </View>
  );

  const renderHeader = () => (
    notifications.length > 0 ? (
      <View style={styles.headerContainer}>
        <Text
          style={[
            styles.headerTitle,
            { color: isDark ? '#FFFFFF' : '#000000' },
          ]}
        >
          Notifications
        </Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearAllNotifications}
        >
          <Text
            style={[
              styles.clearButtonText,
              { color: isDark ? '#808080' : '#999999' },
            ]}
          >
            Clear All
          </Text>
        </TouchableOpacity>
      </View>
    ) : null
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#F5F5F5' },
      ]}
    >
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => handleNotificationPress(item._id)}
            onDelete={() => handleDeleteNotification(item._id)}
          />
        )}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshNotifications}
            tintColor={isDark ? '#FFFFFF' : '#000000'}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
});
