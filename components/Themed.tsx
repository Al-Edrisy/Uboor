// components/Themed.tsx
import { Text as DefaultText, View as DefaultView, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];
export type ButtonProps = ThemeProps & {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function Button(props: ButtonProps) {
  const { title, onPress, disabled, lightColor, darkColor } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'tint');
  const theme = useColorScheme() ?? 'light';
  
  return (
    <TouchableOpacity 
      style={{
        backgroundColor,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
        opacity: disabled ? 0.5 : 1,
      }}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={{
          color: 'white',
          fontWeight: 'bold',
          fontSize: 16,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}