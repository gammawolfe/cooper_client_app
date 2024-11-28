import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import WalletItem from './WalletItem';
import { Wallet } from '@/services/api.wallet.service';
import WalletListSkeleton from './WalletListSkeleton';
import EmptyWalletState from './EmptyWalletState';

interface WalletListProps {
  wallets: Wallet[];
  isLoading: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.98; // Card takes 98% of screen width
const SPACING = 8; // Reduced spacing
const VISIBLE_PEEK = 8; // Reduced peek to accommodate wider cards
const CONTENT_OFFSET = (SCREEN_WIDTH - CARD_WIDTH - VISIBLE_PEEK) / 2; // Center first card with peek

export default function WalletList({ wallets, isLoading }: WalletListProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  if (isLoading) {
    return <WalletListSkeleton />;
  }

  if (!wallets || wallets.length === 0) {
    return <EmptyWalletState />;
  }

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (CARD_WIDTH + SPACING));
    setActiveIndex(index);
  };

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      style={styles.container}
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
              styles.walletContainer,
              index === wallets.length - 1 ? null : { marginRight: SPACING }
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
      {wallets.length > 1 && (
        <View style={styles.pagination}>
          {wallets.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeIndex && styles.paginationDotActive
              ]}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  walletContainer: {
    height: 180,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#2196F3',
    transform: [{ scale: 1.2 }],
  },
});
