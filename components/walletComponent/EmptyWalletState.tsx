import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function EmptyWalletState() {
  const handleCreateWallet = () => {
    router.push('/(tabs)/wallets/new');
  };

  return (
    <View style={styles.container}>
      <MaterialIcons name="account-balance-wallet" size={48} color="#9E9E9E" />
      <Text style={styles.title}>No Wallets Yet</Text>
      <Text style={styles.description}>
        Create your first wallet to start tracking your finances
      </Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={handleCreateWallet}
      >
        <Text style={styles.buttonText}>Create Wallet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#424242',
    marginTop: 16,
  },
  description: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
