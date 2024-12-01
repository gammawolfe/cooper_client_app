import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface DropdownItemProps<T> {
  data: T[];
  placeholder: string;
  onSelect: (selectedItem: T, index: number) => void;
  buttonTextAfterSelection: (selectedItem: T, index: number) => string;
  rowTextForSelection: (item: T, index: number) => string;
  value?: T;
  disabled?: boolean;
}

function DropdownItemComponent<T>({
  data,
  placeholder,
  onSelect,
  buttonTextAfterSelection,
  rowTextForSelection,
  value,
  disabled = false,
}: DropdownItemProps<T>) {
  const { colors } = useTheme();

  return (
    <SelectDropdown
      data={data}
      defaultValue={value}
      onSelect={onSelect}
      renderButton={(selectedItem, isOpened) => {
        return (
          <View style={[styles.dropdownButton, { 
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: disabled ? 0.5 : 1,
          }]}>
            <Text style={[
              styles.dropdownButtonText,
              { color: selectedItem ? colors.text : `${colors.text}80` }
            ]}>
              {selectedItem ? buttonTextAfterSelection(selectedItem as T, data.indexOf(selectedItem)) : placeholder}
            </Text>
            <MaterialIcons
              name={isOpened ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              color={`${colors.text}80`}
              size={24}
            />
          </View>
        );
      }}
      renderItem={(item, index, isSelected) => {
        return (
          <View style={[
            styles.dropdownItem,
            { borderBottomColor: colors.border },
            isSelected && { backgroundColor: colors.primary }
          ]}>
            <Text style={[
              styles.dropdownItemText,
              { color: isSelected ? colors.card : colors.text }
            ]}>
              {rowTextForSelection(item as T, index)}
            </Text>
          </View>
        );
      }}
      disabled={disabled}
      showsVerticalScrollIndicator={false}
      dropdownStyle={[styles.dropdown, { backgroundColor: colors.card }]}
    />
  );
}

const styles = StyleSheet.create({
  dropdownButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    textAlign: 'left',
  },
  dropdown: {
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
  },
  dropdownItem: {
    height: 48,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  dropdownItemText: {
    fontSize: 16,
    textAlign: 'left',
  },
});

export const DropdownItem = DropdownItemComponent;