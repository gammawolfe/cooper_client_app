/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#701EC2';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#687076',
    background: '#fff',
    card: '#F1F3F5',
    border: '#E6E8EB',
    primary: tintColorLight,
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    success: '#2ecc71',
    error: '#e74c3c',
    warning: '#f1c40f',
    gray: '#95a5a6',
    lightGray: '#ecf0f1',
  },
  dark: {
    text: '#fff',
    textSecondary: '#9BA1A6',
    background: '#151718',
    card: '#1E2022',
    border: '#2B2F31',
    primary: '#4CC2FF',
    tint: tintColorDark,
    icon: '#E1E3E5',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    success: '#27ae60',
    error: '#c0392b',
    warning: '#f39c12',
    gray: '#7f8c8d',
    lightGray: '#2c3e50',
  },
} as const;
