import { Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

export default function LoansLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShown: false,
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Loans',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Loan Details',
          presentation: 'card',
        }}
      />
    </Stack>
  );
}