import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  style?: ViewStyle;
  size?: number;
}

export function Checkbox({ checked, onChange, style, size = 24 }: CheckboxProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onChange}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 4,
          backgroundColor: checked ? colors.primary : 'transparent',
          borderColor: checked ? colors.primary : colors.gray,
        },
        style,
      ]}
    >
      {checked && (
        <Ionicons
          name="checkmark"
          size={size * 0.7}
          color="#fff"
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
});
