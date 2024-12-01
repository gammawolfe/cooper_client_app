import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@/context/AuthContextProvider';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { WalletProvider } from '@/context/WalletContextProvider';
import { ContributionProvider } from '@/context/ContributionContextProvider';
import { LoanProvider } from '@/context/LoanContextProvider';
import { StripeProvider } from '@/context/StripeContextProvider';
import { ContactProvider } from '@/context/ContactContextProvider';
import { TransactionProvider } from '@/context/TransactionContextProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient();

function RootLayoutNav() {
  const { currentTheme } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthContextProvider>
          <WalletProvider>
            <ContactProvider>
              <ContributionProvider>
                <LoanProvider>
                  <TransactionProvider>
                    <StripeProvider>
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
                        <Stack.Screen name="+not-found" />
                      </Stack>
                      <StatusBar style={currentTheme === 'dark' ? 'light' : 'dark'} />
                    </StripeProvider>
                  </TransactionProvider>
                </LoanProvider>
              </ContributionProvider>
            </ContactProvider>
          </WalletProvider>
        </AuthContextProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
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
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}
