import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export default function Keypad({ onKeyPress, onDelete, onSubmit, disabled }: KeypadProps) {
  const { colors } = useTheme();
  
  const renderKey = (key: string | null) => {
    if (key === null) return null;
    
    const isSpecial = key === 'delete' || key === 'enter';
    const isDisabled = disabled && !isSpecial;
    const buttonStyle = [
      styles.keyButton,
      isSpecial && styles.specialKey,
      isDisabled && styles.disabledKey,
      { 
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
      }
    ];
    
    const handlePress = () => {
      if (isDisabled) return;
      if (key === 'delete') onDelete();
      else if (key === 'enter') onSubmit();
      else onKeyPress(key);
    };

    return (
      <TouchableOpacity
        style={buttonStyle}
        onPress={handlePress}
        disabled={isDisabled}
      >
        {key === 'delete' ? (
          <Ionicons 
            name="backspace-outline" 
            size={24} 
            color={isDisabled ? 'rgba(255, 255, 255, 0.3)' : '#fff'} 
          />
        ) : key === 'enter' ? (
          <View style={styles.enterButton}>
            <Ionicons 
              name="checkmark-circle" 
              size={32} 
              color={isDisabled ? 'rgba(255, 255, 255, 0.3)' : '#fff'} 
            />
          </View>
        ) : (
          <Text style={[
            styles.keyText,
            { color: '#fff' },
            isDisabled && { opacity: 0.3 }
          ]}>
            {key}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  // First row: 1, 2, 3
  // Second row: 4, 5, 6
  // Third row: 7, 8, 9
  // Fourth row: null (empty), 0, delete
  // Fifth row: enter
  const keyLayout = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    [null, '0', 'delete'],
    ['enter']
  ];

  return (
    <View style={styles.keypadContainer}>
      {keyLayout.map((row, rowIndex) => (
        <View key={rowIndex} style={[
          styles.keypadRow,
          row.length === 1 && styles.centerRow
        ]}>
          {row.map((key, colIndex) => (
            <View key={colIndex} style={[
              styles.keyWrapper,
              key === 'enter' && styles.enterWrapper
            ]}>
              {renderKey(key)}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  keypadContainer: {
    width: '100%',
    maxWidth: 280,
    alignSelf: 'center',
    paddingHorizontal: 10,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  centerRow: {
    justifyContent: 'center',
    gap: 12,
  },
  keyWrapper: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 70,
  },
  enterWrapper: {
    flex: 1,
    maxWidth: 70,
  },
  keyButton: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  keyText: {
    fontSize: 22,
    fontWeight: '500',
  },
  enterButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialKey: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  disabledKey: {
    opacity: 0.5,
  },
});
