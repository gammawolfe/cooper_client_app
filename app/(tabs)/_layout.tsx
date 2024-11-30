import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Platform, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useTheme } from '@/context/ThemeContext';
import { FontAwesome } from '@expo/vector-icons';
import TabBar from '@/components/tabBarComponent/TabBar';
import { router } from 'expo-router';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            style={{
              height: 30,
              width: 35,
              borderRadius: 20,
              backgroundColor: colors.card,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16,
            }}
          >
            <Image
              source={require('../../assets/images/cooper_logo.png')}
              style={{ height: 30, width: 30, borderRadius: 20 }} 
            />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <>
            <TouchableOpacity
              onPress={() => { }}
              style={{
                height: 35,
                width: 35,
                borderRadius: 20,
                backgroundColor: colors.card,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16,
              }}
            >
              <MaterialCommunityIcons name="bell" size={24} color={colors.text} />
            </TouchableOpacity>
          </>
        ),
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: 'transparent',
          },
          android: {
            backgroundColor: colors.background,
          },
        }),
        tabBarInactiveTintColor: colors.text,
        tabBarLabelStyle: {
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol name="house" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
