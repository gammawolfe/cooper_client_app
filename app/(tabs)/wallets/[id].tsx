import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useWallet } from '@/context/WalletContextProvider';
import { useTheme } from '@/context/ThemeContext';
import { Transaction } from '@/services/api.transaction.service';
import { formatCurrency } from '@/utilities/format';
import { useTransaction } from '@/context/TransactionContextProvider';
import TransactionItem from '@/components/transactionComponent/TransactionItem';


export default function WalletDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { colors } = useTheme();
    const router = useRouter();
    const { wallets } = useWallet();
    const { getWalletTransactions, walletTransactions, isLoading: isLoadingTransactions } = useTransaction();

    // Memoize wallet to prevent unnecessary recalculations
    const wallet = useMemo(() => wallets?.find(w => w._id === id), [wallets, id]);

    useEffect(() => {
        if (!id || !wallet) {
            console.info('No wallet ID provided or wallet not found');
            router.back();
            return;
        }

        // Load transactions only if we have a valid wallet
        getWalletTransactions(id);
    }, [id, wallet]);

    // Show loading state while wallets are being fetched
    if (!wallets) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    // Show error state if wallet not found
    if (!wallet) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.errorText, { color: colors.error }]}>
                    Wallet not found
                </Text>
            </View>
        );
    }

    const handleTransactionPress = (transaction: Transaction) => {
        // Handle transaction press if needed
        console.log('Transaction pressed:', transaction);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.summary, { backgroundColor: colors.card }]}>
                <Text style={[styles.walletName, { color: colors.text }]}>{wallet.name}</Text>
                <Text style={[styles.walletBalance, { color: colors.text }]}>
                    {formatCurrency(wallet.balance, wallet.currency)}
                </Text>
                <Text style={[styles.walletCurrency, { color: colors.text + '80' }]}>
                    {wallet.currency}
                </Text>
            </View>

            <View style={styles.transactionsContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Transactions
                </Text>
                
                {isLoadingTransactions ? (
                    <ActivityIndicator style={styles.loader} color={colors.primary} />
                ) : walletTransactions && walletTransactions.length > 0 ? (
                    <FlatList
                        data={walletTransactions}
                        renderItem={({ item }) => (
                            <TransactionItem 
                                transaction={item}
                                onPress={handleTransactionPress}
                                viewingWalletId={wallet._id}
                            />
                        )}
                        keyExtractor={(item) => item._id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.transactionsList}
                        ListFooterComponent={<View style={styles.listFooter} />}
                    />
                ) : (
                    <Text style={[styles.noTransactions, { color: colors.text + '80' }]}>
                        No transactions yet
                    </Text>
                )}
            </View>
        </View>
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
    },
    summary: {
        padding: 20,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
    },
    walletName: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 8,
    },
    walletBalance: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 4,
    },
    walletCurrency: {
        fontSize: 16,
    },
    transactionsContainer: {
        flex: 1,
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    loader: {
        marginTop: 20,
    },
    transactionsList: {
        paddingTop: 8,
    },
    listFooter: {
        height: 100, // Add extra padding at the bottom for tab bar
    },
    noTransactions: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
});