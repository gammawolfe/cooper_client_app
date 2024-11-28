import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

interface AddButtonProps {
  onPress: () => void;
  size?: number;
}

export default function AddButton({ onPress, size = 24 }: AddButtonProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons 
        name="add-circle-outline" 
        size={size} 
        color={colors.primary} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
});
