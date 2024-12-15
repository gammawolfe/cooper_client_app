import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '@/utilities/format';
import { LoanRequest } from '@/services/api.loan.service';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/context/ThemeContext';

interface LoanRequestItemProps {
  request: LoanRequest;
  onAccept?: (id: string, notes?: string) => Promise<{ success: boolean; error?: string }>;
  onReject?: (id: string, notes: string) => Promise<void>;
  onCancel?: (id: string, reason: string) => Promise<void>;
  onPress?: (id: string) => void;
  isIncoming?: boolean;
}

export function LoanRequestItem({ 
  request, 
  onAccept,
  onReject,
  onCancel,
  onPress,
  isIncoming = false,
}: LoanRequestItemProps) {
  const { colors } = useTheme();
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');
  const status = request.status.charAt(0).toUpperCase() + request.status.slice(1);
  const userToShow = isIncoming ? request.borrowerId : request.lenderId;

  const getStatusColor = () => {
    switch (request.status) {
      case 'pending':
        return colors.warning;
      case 'approved':
        return colors.success;
      case 'declined':
        return colors.error;
      case 'cancelled':
        return colors.error;
      default:
        return colors.text;
    }
  };

  const handleAction = async (action: 'accept' | 'reject' | 'cancel') => {
    try {
      switch (action) {
        case 'accept':
          if (onAccept) {
            console.log('Calling onAccept...');
            const result = await onAccept(request._id);
            console.log('onAccept result:', result);
            
            if (!result) {
              throw new Error('No response received from server');
            }
            
            if (!result.success) {
              Alert.alert(
                'Unable to Approve Loan',
                result.error || 'Failed to approve loan request',
                [{ text: 'OK', style: 'default' }]
              );
            }
          }
          break;
        case 'reject':
          if (onReject && note) {
            await onReject(request._id, note);
            setNote('');
            setShowNoteInput(false);
          }
          break;
        case 'cancel':
          if (onCancel && note) {
            await onCancel(request._id, note);
            setNote('');
            setShowNoteInput(false);
          }
          break;
      }
    } catch (error: any) {
      console.error(`Failed to ${action} loan request:`, error);
      Alert.alert(
        'Error Approving Loan',
        error.message || 'An unexpected error occurred while processing your request',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const cardStyle = isIncoming ? {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  } : {
    borderRightWidth: 4,
    borderRightColor: colors.warning,
  };

  // Add cancelled status styles
  if (request.status === 'cancelled') {
    Object.assign(cardStyle, {
      opacity: 0.8,
      borderColor: colors.text + '20',
      borderWidth: 1,
      borderStyle: 'dashed',
      backgroundColor: colors.card + '80',
    });
  }

  const styles = StyleSheet.create({
    requestItem: {
      width: Dimensions.get('window').width - 32,
      borderRadius: 12,
      marginVertical: 10,
      padding: 16,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: colors.card,
      shadowColor: colors.text,
    },
    requestContent: {
      position: 'relative',
    },
    cancelledContent: {
      position: 'relative',
      overflow: 'hidden',
    },
    strikethroughLineLeft: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: colors.error + '30',
      transform: [{ rotate: '-45deg' }, { scale: 1.4 }],
      zIndex: 1,
    },
    strikethroughLineRight: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: colors.error + '30',
      transform: [{ rotate: '45deg' }, { scale: 1.4 }],
      zIndex: 1,
    },
    cancelledBadge: {
      backgroundColor: colors.error + '15',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderWidth: 1,
      borderColor: colors.error + '30',
    },
    cancelledText: {
      fontSize: 12,
      color: colors.error,  
      fontWeight: '600',  
    },
    requestHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    requestAmount: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    requestUser: {
      fontSize: 13,
      opacity: 0.7,
      marginTop: 2,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
    },
    requestDetails: {
      borderTopWidth: 1,
      borderTopColor: 'rgba(0,0,0,0.1)',
      paddingTop: 12,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 4,
    },
    detailLabel: {
      fontSize: 12,
      opacity: 0.7,
    },
    detailValue: {
      fontSize: 12,
      fontWeight: '500',
    },
    detailSeparator: {
      width: 1,
      height: '80%',
      backgroundColor: 'rgba(0,0,0,0.1)',
      marginHorizontal: 8,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: 'rgba(0,0,0,0.1)',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    actionText: {
      fontSize: 12,
      fontWeight: '500',
      color: '#FFF',
    },
    noteInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      gap: 8,
    },
    noteInput: {
      flex: 1,
      height: 40,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
    },
  });

  const Content = () => (
    <View style={[
      styles.requestContent,
      request.status === 'cancelled' && styles.cancelledContent
    ]}>
      <View style={styles.requestHeader}>
        <View style={styles.headerLeft}>
          <View style={[
            styles.iconContainer, 
            { 
              backgroundColor: isIncoming ? colors.success + '20' : colors.warning + '20',
            },
            request.status === 'cancelled' && {
              backgroundColor: colors.error + '10'
            }
          ]}>
            <Ionicons 
              name={request.status === 'cancelled' ? 'close-circle' : (isIncoming ? 'arrow-down' : 'arrow-up')} 
              size={18} 
              color={request.status === 'cancelled' ? colors.error + '80' : (isIncoming ? colors.success : colors.warning)} 
            />
          </View>
          <View>
            <View style={styles.amountRow}>
              <ThemedText style={[
                styles.requestAmount, 
                { 
                  color: isIncoming ? colors.success : colors.warning 
                }
              ]}>
                {formatCurrency(request.amount)}
              </ThemedText>
              {request.status === 'cancelled' ? (
                <View style={styles.cancelledBadge}>
                  <Ionicons name="ban" size={12} color={colors.error} />
                  <ThemedText style={styles.cancelledText}>Cancelled</ThemedText>
                </View>
              ) : (
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
                  <ThemedText style={[styles.statusText, { color: getStatusColor() }]}>
                    {status}
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText style={[styles.requestUser, { color: colors.text + '80' }]}>
              {isIncoming ? 'From: ' : 'To: '}
              {userToShow.firstName} {userToShow.lastName}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.requestDetails}>
        <View style={styles.detailRow}>
          <ThemedText style={[styles.detailLabel, { color: colors.text + '80' }]}>
            Rate: 
          </ThemedText>
          <ThemedText style={[styles.detailValue, { color: colors.text }]}>
            {request.interestRate}%
          </ThemedText>
          <View style={styles.detailSeparator} />
          <ThemedText style={[styles.detailLabel, { color: colors.text + '80' }]}>
            Duration: 
          </ThemedText>
          <ThemedText style={[styles.detailValue, { color: colors.text }]}>
            {request.durationInMonths}mo
          </ThemedText>
        </View>
        <View style={styles.detailRow}>
          <ThemedText style={[styles.detailLabel, { color: colors.text + '80' }]}>
            Total Repayment: 
          </ThemedText>
          <ThemedText style={[styles.detailValue, { color: colors.text }]}>
            {formatCurrency(request.totalRepaymentAmount)}
          </ThemedText>
        </View>
      </View>

      {request.status === 'pending' && (
        <View style={styles.actions}>
          {onAccept && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.success }]} 
              onPress={() => handleAction('accept')}
            >
              <Ionicons name="checkmark" size={14} color="#FFF" />
              <ThemedText style={styles.actionText}>Accept</ThemedText>
            </TouchableOpacity>
          )}
          {onReject && (
            <>
              {showNoteInput ? (
                <View style={styles.noteInputContainer}>
                  <TextInput
                    style={[styles.noteInput, { color: colors.text, borderColor: colors.border }]}
                    value={note}
                    onChangeText={setNote}
                    placeholder="Enter reason for declining..."
                    placeholderTextColor={colors.text + '80'}
                  />
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: colors.error }]}
                    onPress={() => handleAction('reject')}
                    disabled={!note}
                  >
                    <ThemedText style={styles.actionText}>Submit</ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: colors.error }]}
                  onPress={() => setShowNoteInput(true)}
                >
                  <Ionicons name="close" size={14} color="#FFF" />
                  <ThemedText style={styles.actionText}>Decline</ThemedText>
                </TouchableOpacity>
              )}
            </>
          )}
          {onCancel && (
            <>
              {showNoteInput ? (
                <View style={styles.noteInputContainer}>
                  <TextInput
                    style={[styles.noteInput, { color: colors.text, borderColor: colors.border }]}
                    value={note}
                    onChangeText={setNote}
                    placeholder="Enter reason for cancelling..."
                    placeholderTextColor={colors.text + '80'}
                  />
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: colors.warning }]}
                    onPress={() => handleAction('cancel')}
                    disabled={!note}
                  >
                    <ThemedText style={styles.actionText}>Submit</ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: colors.warning }]}
                  onPress={() => setShowNoteInput(true)}
                >
                  <Ionicons name="ban" size={14} color="#FFF" />
                  <ThemedText style={styles.actionText}>Cancel</ThemedText>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );

  // For outgoing requests, wrap content in a View instead of TouchableOpacity
  if (!isIncoming) {
    return (
      <View 
        style={[
          styles.requestItem, 
          cardStyle
        ]}
      >
        {request.status === 'cancelled' && (
          <>
            <View style={styles.strikethroughLineLeft} />
            <View style={styles.strikethroughLineRight} />
          </>
        )}
        <Content />
      </View>
    );
  }

  // For incoming requests, keep it clickable
  return (
    <TouchableOpacity 
      style={[
        styles.requestItem, 
        cardStyle
      ]}
      onPress={() => onPress?.(request._id)}
      activeOpacity={0.7}
    >
      {request.status === 'cancelled' && (
        <>
          <View style={styles.strikethroughLineLeft} />
          <View style={styles.strikethroughLineRight} />
        </>
      )}
      <Content />
    </TouchableOpacity>
  );
}