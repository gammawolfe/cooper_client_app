import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStripe } from '@/context/StripeContextProvider';
import { Alert } from 'react-native';

// Mock bank list - in production, this would come from your backend
const popularBanks = [
  { id: '1', name: 'Chase', icon: 'bank' },
  { id: '2', name: 'Bank of America', icon: 'bank' },
  { id: '3', name: 'Wells Fargo', icon: 'bank' },
  { id: '4', name: 'Citibank', icon: 'bank' },
];

const otherBanks = [
  { id: '5', name: 'Capital One', icon: 'bank' },
  { id: '6', name: 'TD Bank', icon: 'bank' },
  { id: '7', name: 'US Bank', icon: 'bank' },
  { id: '8', name: 'PNC Bank', icon: 'bank' },
];

export default function BankScreen() {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const { addCard } = useStripe();

  const handleBankSelect = async (bankId: string, bankName: string) => {
    setIsLoading(true);
    try {
      // TODO: Implement Plaid Link or your preferred bank connection method
      //console.log('Selected bank:', bankId, bankName);
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to bank connection success screen
      router.push('/bank/success');
    } catch (error) {
      console.error('Error connecting bank:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCard = async () => {
    try {
      setIsLoading(true);
      await addCard();
      router.replace('/bank/success');
    } catch (error) {
      console.error('Error adding card:', error);
      Alert.alert('Error', 'Failed to add card. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderBankOption = (bank: typeof popularBanks[0]) => (
    <TouchableOpacity
      key={bank.id}
      style={[styles.bankOption, { borderColor: colors.border }]}
      onPress={() => handleBankSelect(bank.id, bank.name)}
      disabled={isLoading}
    >
      <View style={[styles.bankIconContainer, { backgroundColor: colors.primary + '20' }]}>
        <MaterialCommunityIcons name={bank.icon as any} size={24} color={colors.primary} />
      </View>
      <Text style={[styles.bankName, { color: colors.text }]}>{bank.name}</Text>
      <MaterialCommunityIcons name="chevron-right" size={24} color={colors.gray} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Connecting to bank...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerTitle: 'Connect Bank',
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Card style={styles.infoCard}>
            <MaterialCommunityIcons
              name="shield-lock-outline"
              size={32}
              color={colors.primary}
            />
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Secure Bank Connection
            </Text>
            <Text style={[styles.infoText, { color: colors.gray }]}>
              We use bank-level security to protect your information. Your credentials
              are never stored on our servers.
            </Text>
          </Card>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Popular Banks
            </Text>
            {popularBanks.map(renderBankOption)}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Other Banks
            </Text>
            {otherBanks.map(renderBankOption)}
          </View>

          <TouchableOpacity
            style={[styles.bankOption, { backgroundColor: colors.card }]}
            onPress={handleAddCard}
          >
            <MaterialCommunityIcons
              name="credit-card-plus-outline"
              size={24}
              color={colors.text}
            />
            <View style={styles.bankTextContainer}>
              <Text style={[styles.bankTitle, { color: colors.text }]}>
                Add a Card
              </Text>
              <Text style={[styles.bankDescription, { color: colors.textSecondary }]}>
                Add a debit or credit card
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.searchButton, { borderColor: colors.border }]}
            onPress={() => {
              // TODO: Implement bank search
              console.log('Search banks');
            }}
          >
            <MaterialCommunityIcons name="magnify" size={24} color={colors.primary} />
            <Text style={[styles.searchButtonText, { color: colors.text }]}>
              Search for your bank
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  infoCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginLeft: 4,
  },
  bankOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  bankIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  bankName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  bankTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  bankTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  bankDescription: {
    fontSize: 14,
    color: '#666',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 8,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
});
