import React, { useCallback, useState } from 'react';
import { StyleSheet, View, RefreshControl, ScrollView, Dimensions, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

import WalletItem from '@/components/walletComponent/WalletItem';
import CreateWalletModal from '@/components/modalComponent/CreateWalletModal';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { useTheme } from '@/context/ThemeContext';
import { useWallet } from '@/context/WalletContextProvider';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { CreateWalletDTO } from '@/services/api.wallet.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.98;
const SPACING = 8;
const VISIBLE_PEEK = 8;
const CONTENT_OFFSET = (SCREEN_WIDTH - CARD_WIDTH - VISIBLE_PEEK) / 2;

export default function WalletsScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { wallets, isLoading, refreshWallets, createWallet } = useWallet();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshWallets();
        setRefreshing(false);
    }, [refreshWallets]);

    const handleCreateWallet = async (walletData: CreateWalletDTO) => {
        try {
            await createWallet(walletData);
            await refreshWallets();
            return true;
        } catch (error) {
            throw error;
        }
    };

    const handleScroll = (event: any) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffset / (CARD_WIDTH + SPACING));
        setActiveIndex(index);
    };

    const renderWalletList = () => {
        if (isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <Text style={[styles.emptyText, { color: colors.text }]}>Loading...</Text>
                </View>
            );
        }

        if (!wallets || wallets.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: colors.text }]}>
                        No wallets found. Create one to get started!
                    </Text>
                </View>
            );
        }

        return (
            <Animated.View
                entering={FadeIn.duration(500)}
                style={styles.walletListContainer}
            >
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    decelerationRate="fast"
                    snapToInterval={CARD_WIDTH + SPACING}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingHorizontal: CONTENT_OFFSET }
                    ]}
                >
                    {wallets.map((wallet, index) => (
                        <View
                            key={wallet._id}
                            style={[
                                styles.cardContainer,
                                { marginRight: index === wallets.length - 1 ? 0 : SPACING }
                            ]}
                        >
                            <WalletItem
                                wallet={wallet}
                                width={CARD_WIDTH}
                                isActive={index === activeIndex}
                            />
                        </View>
                    ))}
                </ScrollView>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.mainScrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {renderWalletList()}
            </ScrollView>

            <FloatingActionButton
                icon={<IconSymbol name="plus" size={24} color="#fff" />}
                onPress={() => setIsModalVisible(true)}
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
    mainScrollContent: {
        flexGrow: 1,
    },
    walletListContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 16,
    },
    cardContainer: {
        width: CARD_WIDTH,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 16,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.7,
    },
});