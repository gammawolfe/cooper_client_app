import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContextProvider';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function AuthLayout() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // If user is already authenticated, redirect to tabs
      router.replace('/(tabs)');
    }
  }, [user]);

  return (
    <Stack screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}