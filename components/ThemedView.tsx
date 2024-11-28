import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const { colors, theme } = useTheme();
  const backgroundColor = theme === 'dark' ? darkColor : lightColor || colors.background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
