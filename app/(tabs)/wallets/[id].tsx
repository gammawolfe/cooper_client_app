import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useWallet } from '@/context/WalletContextProvider';
import { useTheme } from '@/context/ThemeContext';
import { WalletTransactionList } from '@/components/walletComponent/WalletTransactionList';
import { WalletSummary } from '@/components/walletComponent/WalletSummary';
import { Transaction } from '@/services/api.wallet.service';

export default function WalletDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { colors } = useTheme();
    const router = useRouter();
    const { wallets, getTransactions } = useWallet();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Find the wallet from context
    const wallet = wallets.find(w => w._id === id);

    useEffect(() => {

        if (!id || !wallet) {
            console.info('No wallet ID provided or wallet not found');
            router.back();
            return;
        }

        // Load transactions
        const loadTransactions = async () => {
            try {
                setIsLoadingTransactions(true);
                const result = await getTransactions(id);
                setTransactions(result);
            } catch (err) {
                console.error('Error loading transactions:', err);
                setError(err instanceof Error ? err.message : 'Failed to load transactions');
            } finally {
                setIsLoadingTransactions(false);
            }
        };

        loadTransactions();
    }, [id, wallet, getTransactions, router]);

    if (!wallet) {
        return null; // We're redirecting in the useEffect
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <WalletSummary wallet={wallet} />
                <WalletTransactionList
                    transactions={transactions}
                    currency={wallet.currency}
                    isLoading={isLoadingTransactions}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
});