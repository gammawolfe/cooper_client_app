import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeSwitch() {
  const { theme, setTheme, colors } = useTheme();

  const options = [
    { value: 'light', icon: 'sun-o' },
    { value: 'dark', icon: 'moon-o' },
    { value: 'system', icon: 'mobile' },
  ] as const;

  return (
    <View style={[styles.container, { 
      backgroundColor: colors.card,
      borderColor: colors.border,
    }]}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.option,
            theme === option.value && [
              styles.selectedOption, 
              { 
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
              }
            ],
          ]}
          onPress={() => setTheme(option.value)}
        >
          <FontAwesome
            name={option.icon}
            size={16}
            color={theme === option.value ? '#fff' : colors.text}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginVertical: 4,
    borderWidth: 1,
    width: 310,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  selectedOption: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});
