import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from 'react-native';
import { useAuth } from '@/context/AuthContextProvider';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import EditProfileModal from '@/components/modalComponent/EditProfileModal';
import ThemeSwitch from '@/components/ThemeSwitch';

export default function ProfileScreen() {
  const { user, logout, isLoading } = useAuth();
  const { colors } = useTheme();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Profile',
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text },
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ 
                uri: user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent((user?.firstName || '') + ' ' + (user?.lastName || ''))}` 
              }}
              style={styles.avatar}
            />
          </View>
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
        </View>

        {/* Personal Information Card */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.cardHeader}>
            <FontAwesome name="user" size={20} color={colors.tint} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Personal Information</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Phone</Text>
              <Text style={[styles.value, { color: colors.text }]}>{user?.mobile || 'Not provided'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Member since</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {new Date(user?.createdAt || '').toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Address Card */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.cardHeader}>
            <FontAwesome name="map-marker" size={20} color={colors.tint} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Address</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={[styles.value, { color: colors.text }]}>
                {user?.addressLine1}
                {user?.addressLine2 ? `\n${user.addressLine2}` : ''}
                {`\n${user?.city || ''}, ${user?.postcode || ''}`}
                {`\n${user?.country || ''}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => setIsEditModalVisible(true)}
          >
            <View style={styles.menuIconContainer}>
              <FontAwesome name="edit" size={20} color={colors.tint} />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>Edit Profile</Text>
            <FontAwesome name="angle-right" size={20} color={colors.text} style={styles.menuArrow} />
          </TouchableOpacity>

          <View style={[styles.menuItem, { borderBottomColor: colors.border }]}>
            <View style={[styles.menuIconContainer, { backgroundColor: colors.card }]}>
              <FontAwesome name="moon-o" size={20} color={colors.tint} />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>Dark Mode</Text>
            <ThemeSwitch />
          </View>

          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]}>
            <View style={styles.menuIconContainer}>
              <FontAwesome name="bell" size={20} color={colors.tint} />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>Notifications</Text>
            <FontAwesome name="angle-right" size={20} color={colors.text} style={styles.menuArrow} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]}>
            <View style={styles.menuIconContainer}>
              <FontAwesome name="lock" size={20} color={colors.tint} />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>Privacy & Security</Text>
            <FontAwesome name="angle-right" size={20} color={colors.text} style={styles.menuArrow} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <FontAwesome name="question-circle" size={20} color={colors.tint} />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>Help & Support</Text>
            <FontAwesome name="angle-right" size={20} color={colors.text} style={styles.menuArrow} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.danger }]}
          onPress={logout}
        >
          <FontAwesome name="sign-out" size={20} color="#fff" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <EditProfileModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 8,
  },
  card: {
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  section: {
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
  menuArrow: {
    marginLeft: 'auto',
  },
  logoutButton: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 30,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
