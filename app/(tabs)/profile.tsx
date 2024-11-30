import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { useAuth } from '@/context/AuthContextProvider';
import { useTheme } from '@/context/ThemeContext';
import { FontAwesome } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import EditProfileModal from '@/components/modalComponent/EditProfileModal';
import ThemeSwitch from '@/components/ThemeSwitch';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.92;

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
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Profile',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { 
            color: colors.text,
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          entering={FadeInDown.duration(500).delay(100)}
          style={[styles.header, { backgroundColor: colors.card }]}
        >
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
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.duration(500).delay(200)}
          style={[styles.card, { backgroundColor: colors.card }]}
        >
          <View style={styles.cardHeader}>
            <FontAwesome name="user" size={20} color={colors.tint} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Personal Information</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Phone</Text>
              <Text style={[styles.value, { color: colors.text }]}>{user?.mobile || 'Not provided'}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Member since</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {new Date(user?.createdAt || '').toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.duration(500).delay(300)}
          style={[styles.card, { backgroundColor: colors.card }]}
        >
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
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.duration(500).delay(400)}
          style={[styles.card, { backgroundColor: colors.card }]}
        >
          <View style={styles.cardHeader}>
            <FontAwesome name="cog" size={20} color={colors.tint} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Settings</Text>
          </View>
          <View style={styles.cardContent}>
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => setIsEditModalVisible(true)}
            >
              <View style={styles.settingLeft}>
                <FontAwesome name="edit" size={20} color={colors.tint} style={styles.settingIcon} />
                <Text style={[styles.settingText, { color: colors.text }]}>Edit Profile</Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <FontAwesome name="moon-o" size={20} color={colors.tint} style={styles.settingIcon} />
                <Text style={[styles.settingText, { color: colors.text }]}>Dark Mode</Text>
              </View>
              <ThemeSwitch />
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <FontAwesome name="bell" size={20} color={colors.tint} style={styles.settingIcon} />
                <Text style={[styles.settingText, { color: colors.text }]}>Notifications</Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <FontAwesome name="lock" size={20} color={colors.tint} style={styles.settingIcon} />
                <Text style={[styles.settingText, { color: colors.text }]}>Privacy & Security</Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <FontAwesome name="question-circle" size={20} color={colors.tint} style={styles.settingIcon} />
                <Text style={[styles.settingText, { color: colors.text }]}>Help & Support</Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={logout}
            >
              <View style={styles.settingLeft}>
                <FontAwesome name="sign-out" size={20} color={colors.error} style={styles.settingIcon} />
                <Text style={[styles.settingText, { color: colors.error }]}>Logout</Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        </Animated.View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    width: CARD_WIDTH,
    alignSelf: 'center',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  card: {
    width: CARD_WIDTH,
    alignSelf: 'center',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    marginVertical: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
    width: 24,
  },
  settingText: {
    fontSize: 16,
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
});
