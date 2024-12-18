import { Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

export default function LoanRequestsLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Loan Requests',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Request Details',
          headerShown: false
        }}
      />
    </Stack>
  );
}