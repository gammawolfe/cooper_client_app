import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useWallet } from '@/context/WalletContextProvider';
import { useTheme } from '@/context/ThemeContext';
import { Transaction } from '@/services/api.wallet.service';
import { formatCurrency } from '@/utilities/format';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function WalletDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { colors } = useTheme();
    const router = useRouter();
    const { wallets, getTransactions } = useWallet();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Find the wallet from context
    const wallet = wallets?.find(w => w._id === id);

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
                setTransactions(result || []);
            } catch (err) {
                console.error('Error loading transactions:', err);
                setError(err instanceof Error ? err.message : 'Failed to load transactions');
            } finally {
                setIsLoadingTransactions(false);
            }
        };

        loadTransactions();
    }, [id, wallet, getTransactions, router]);

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

    const renderTransactionItem = ({ item }: { item: Transaction }) => (
        <View style={[styles.transactionItem, { backgroundColor: colors.card }]}>
            <View style={styles.transactionHeader}>
                <View style={styles.transactionType}>
                    <MaterialIcons 
                        name={item.type === 'credit' ? 'arrow-downward' : 'arrow-upward'} 
                        size={20} 
                        color={item.type === 'credit' ? colors.success : colors.error} 
                    />
                    <Text style={[styles.transactionTitle, { color: colors.text }]}>
                        {item.description || (item.type === 'credit' ? 'Received' : 'Sent')}
                    </Text>
                </View>
                <Text 
                    style={[
                        styles.transactionAmount, 
                        { color: item.type === 'credit' ? colors.success : colors.error }
                    ]}
                >
                    {item.type === 'credit' ? '+' : '-'} {formatCurrency(item.amount, wallet.currency)}
                </Text>
            </View>
            <Text style={[styles.transactionDate, { color: colors.text + '80' }]}>
                {new Date(item.timestamp).toLocaleDateString()}
            </Text>
        </View>
    );

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
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
                {isLoadingTransactions ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={colors.primary} />
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                    </View>
                ) : transactions.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: colors.text }]}>
                            No transactions yet
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={transactions}
                        renderItem={renderTransactionItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.transactionsList}
                    />
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
        padding: 16,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
    },
    summary: {
        padding: 24,
        margin: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    walletName: {
        fontSize: 20,
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
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    transactionsList: {
        paddingBottom: 16,
    },
    transactionItem: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    transactionType: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    transactionTitle: {
        fontSize: 16,
        marginLeft: 8,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '600',
    },
    transactionDate: {
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.7,
    },
});