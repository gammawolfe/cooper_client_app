import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { Avatar } from '../ui/Avatar';
import { useTheme } from '@/context/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useContribution } from '@/context/ContributionContextProvider';

interface Member {
  _id: string;
  userId: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  role: string;
  payoutOrder: number;
  contributionId: string;
  contributionWalletId: string;
  totalPaid: number;
  contributionDates: string[];
  status: string;
  cycleContributions: any[];
  createdAt: string;
  updatedAt: string;
}

interface DraggableMemberListProps {
  members: Member[];
  contributionId: string;
  isActive: boolean;
  isAdmin: boolean;
  onReorder?: (newOrder: Member[]) => void;
}

const ITEM_HEIGHT = 80;

export function DraggableMemberList({ 
  members: initialMembers = [], 
  contributionId,
  isActive, 
  isAdmin,
  onReorder 
}: DraggableMemberListProps) {
  const theme = useTheme();
  const { updateMemberOrder } = useContribution();
  
  // State hooks
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Animated value hooks
  const draggingIndex = useSharedValue(-1);
  const positions = useSharedValue<number[]>(new Array(initialMembers.length).fill(0));

  // Effect to sync members with props
  useEffect(() => {
    setMembers(initialMembers);
    positions.value = new Array(initialMembers.length).fill(0);
  }, [initialMembers]);

  // Memoized handlers
  const updateOrder = useCallback(async (from: number, to: number) => {
    if (from === to) return;

    if (isActive) {
      Alert.alert(
        'Cannot Reorder Members',
        'Please pause the contribution before reordering members'
      );
      return;
    }

    const newOrder = [...members];
    const item = newOrder[from];
    newOrder.splice(from, 1);
    newOrder.splice(to, 0, item);

    setMembers(newOrder);
    onReorder?.(newOrder);
    setIsUpdating(true);

    try {
      const memberOrders = newOrder.map((member, index) => ({
        memberId: member._id,
        payoutOrder: index + 1
      }));

      await updateMemberOrder(memberOrders);
    } catch (error) {
      setMembers(initialMembers);
      onReorder?.(initialMembers);
      console.error('Failed to update member order:', error);
      Alert.alert(
        'Error',
        'Failed to update member order. Please try again.'
      );
    } finally {
      setIsUpdating(false);
    }
  }, [members, isActive, initialMembers, onReorder, updateMemberOrder]);

  const renderMemberItem = useCallback(({ item, index }: { item: Member; index: number }) => {
    const isAdminMember = item.role === 'admin';

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: positions.value[index] || 0 }],
      zIndex: draggingIndex.value === index ? 1 : 0,
      shadowOpacity: withSpring(draggingIndex.value === index ? 0.2 : 0),
    }));

    const gesture = Gesture.Pan()
      .enabled(!isActive && isAdmin && !isAdminMember && !isUpdating)
      .onStart(() => {
        draggingIndex.value = index;
      })
      .onUpdate((e) => {
        const newPositions = [...positions.value];
        newPositions[index] = e.translationY;
        
        const newPosition = index + Math.round(e.translationY / ITEM_HEIGHT);
        
        if (newPosition >= 0 && newPosition < members.length) {
          members.forEach((_, idx) => {
            if (idx !== index) {
              const direction = idx > index && idx <= newPosition ? -1 : 
                              idx < index && idx >= newPosition ? 1 : 0;
              newPositions[idx] = direction * ITEM_HEIGHT;
            }
          });
        }
        
        positions.value = newPositions;
      })
      .onEnd(() => {
        const finalPosition = index + Math.round(positions.value[index] / ITEM_HEIGHT);
        if (finalPosition >= 0 && finalPosition < members.length && finalPosition !== index) {
          runOnJS(updateOrder)(index, finalPosition);
        }
        
        positions.value = new Array(members.length).fill(0);
        draggingIndex.value = -1;
      });

    return (
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.memberItem, animatedStyle]}>
          <View style={styles.memberContent}>
            {!isActive && isAdmin && !isAdminMember && (
              <Pressable style={styles.dragHandle}>
                <Text style={[styles.dragIcon, { color: theme.colors.text + '80' }]}>☰</Text>
              </Pressable>
            )}
            
            <View style={styles.memberInfo}>
              <Avatar
                size={40}
                name={`${item.userId.firstName} ${item.userId.lastName}`}
                style={styles.memberAvatar}
              />
              <View>
                <Text style={[styles.memberName, { color: theme.colors.text }]}>
                  {`${item.userId.firstName} ${item.userId.lastName}`}
                </Text>
                {isAdminMember && (
                  <Text style={[styles.adminBadge, { color: theme.colors.primary }]}>
                    Admin
                  </Text>
                )}
              </View>
            </View>
            
            <View style={styles.orderInfo}>
              <Text style={[styles.orderText, { color: theme.colors.text + '80' }]}>
                {isActive ? `Payout #${item.payoutOrder}` : '#' + (index + 1)}
              </Text>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    );
  }, [isActive, isAdmin, isUpdating, members.length, theme.colors, updateOrder]);

  if (!members || members.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.colors.text + '80' }]}>
          No members yet
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {members.map((item, index) => (
        <View key={item._id}>
          {renderMemberItem({ item, index })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  memberItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    height: ITEM_HEIGHT,
  },
  memberContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    marginRight: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
  },
  adminBadge: {
    fontSize: 12,
    marginTop: 2,
  },
  dragHandle: {
    padding: 8,
    marginRight: 8,
  },
  dragIcon: {
    fontSize: 20,
  },
  orderInfo: {
    marginLeft: 8,
    paddingLeft: 8,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: 'rgba(0,0,0,0.1)',
  },
  orderText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
