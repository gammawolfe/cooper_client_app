import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Image } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface AvatarProps {
  name: string;
  size?: number;
  style?: ViewStyle;
  image?: string;
}

export function Avatar({ name, size = 40, style, image }: AvatarProps) {
  const { colors } = useTheme();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = (name: string) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB',
      '#E67E22', '#2ECC71'
    ];
    
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  if (image) {
    return (
      <Image
        source={{ uri: image }}
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          style
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: getRandomColor(name),
        },
        style
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize: size * 0.4,
            color: colors.text,
          }
        ]}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontWeight: '600',
  },
});
