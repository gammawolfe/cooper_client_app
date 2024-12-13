import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@/context/AuthContextProvider';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { WalletProvider } from '@/context/WalletContextProvider';
import { ContactProvider } from '@/context/ContactContextProvider';
import { LoanProvider } from '@/context/LoanContextProvider';
import { TransactionProvider } from '@/context/TransactionContextProvider';
import { StripeProvider } from '@/context/StripeContextProvider';
import { NotificationProvider } from '@/context/NotificationContextProvider';
import { ActivityProvider } from '@/context/ActivityContextProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { ContributionProvider } from '@/context/ContributionContextProvider';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient();

function RootLayoutNav() {
  const { currentTheme } = useTheme();

  return (
    <AuthContextProvider>
      <WalletProvider>
        <ContactProvider>
          <ContributionProvider>
            <LoanProvider>
              <TransactionProvider>
                <StripeProvider>
                  <NotificationProvider>
                    <ActivityProvider>
                      <Stack
                        screenOptions={{
                          headerShown: false,
                          contentStyle: {
                            backgroundColor: currentTheme === 'dark' ? '#151718' : '#fff'
                          }
                        }}
                      >
                        <Stack.Screen name="(auth)" />
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen 
                          name="(modals)/secure-block" 
                          options={{ 
                            presentation: 'modal',
                            animation: 'fade'
                          }} 
                        />
                        <Stack.Screen 
                          name="(modals)/lock-block" 
                          options={{ 
                            presentation: 'modal',
                            animation: 'fade'
                          }} 
                        />
                        <Stack.Screen name="+not-found" />
                      </Stack>
                      <StatusBar style={currentTheme === 'dark' ? 'light' : 'dark'} />
                    </ActivityProvider>
                  </NotificationProvider>
                </StripeProvider>
              </TransactionProvider>
            </LoanProvider>
          </ContributionProvider>
        </ContactProvider>
      </WalletProvider>
    </AuthContextProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <RootLayoutNav />
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
