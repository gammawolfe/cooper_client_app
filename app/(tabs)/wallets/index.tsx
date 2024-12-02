import React, { useCallback, useState } from 'react';
import { StyleSheet, View, RefreshControl } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

import WalletList from '@/components/walletComponent/WalletList';
import CreateWalletModal from '@/components/modalComponent/CreateWalletModal';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { useTheme } from '@/context/ThemeContext';
import { useWallet } from '@/context/WalletContextProvider';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { CreateWalletDTO } from '@/services/api.wallet.service';

export default function WalletsScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { wallets, isLoading, refreshWallets, createWallet } = useWallet();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshWallets();
        setRefreshing(false);
    }, [refreshWallets]);

    const handleCreateWallet = async (walletData: CreateWalletDTO) => {
        try {
            await createWallet(walletData);
            await refreshWallets();
            return true; // Return true to indicate success
        } catch (error) {
            throw error; // Throw the error to be handled by the modal
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <WalletList
                    wallets={wallets}
                    isLoading={isLoading}
                />
            </ScrollView>

            <FloatingActionButton
                onPress={() => setIsModalVisible(true)}
                icon={<IconSymbol name="plus" color={colors.text} size={24} />}
            />

            <CreateWalletModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSubmit={handleCreateWallet}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 16,
    },
});