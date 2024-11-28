import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { withRepeat, withSequence, withTiming, useAnimatedStyle } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WALLET_MARGIN = 16;
const WALLET_WIDTH = SCREEN_WIDTH - (WALLET_MARGIN * 2);

export default function WalletListSkeleton() {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    ),
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.skeletonCard, animatedStyle]} />
      <View style={styles.pagination}>
        {[...Array(3)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === 0 && styles.paginationDotActive
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: WALLET_MARGIN,
  },
  skeletonCard: {
    width: WALLET_WIDTH,
    height: 180,
    backgroundColor: '#E0E0E0',
    borderRadius: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#2196F3',
    transform: [{ scale: 1.2 }],
  },
});
