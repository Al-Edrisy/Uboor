// components/Themed.tsx
import { 
  Text as DefaultText, 
  View as DefaultView, 
  TouchableOpacity, 
  StyleProp, 
  ViewStyle, 
  TextInput as DefaultTextInput,
  TextInputProps as DefaultTextInputProps,
  ScrollView as DefaultScrollView,
  ActivityIndicator as DefaultActivityIndicator,
  Switch as DefaultSwitch,
  Pressable as DefaultPressable,
  StyleSheet
} from 'react-native';
import Colors from '@/constants/Colors';
import { useTheme } from './../app/context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

// Base component types
export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];
export type TextInputProps = ThemeProps & DefaultTextInputProps;
export type ScrollViewProps = ThemeProps & DefaultScrollView['props'];
export type ActivityIndicatorProps = ThemeProps & DefaultActivityIndicator['props'];
export type SwitchProps = ThemeProps & DefaultSwitch['props'] & {
  thumbColorLight?: string;
  thumbColorDark?: string;
  trackColorLight?: string;
  trackColorDark?: string;
};
export type PressableProps = ThemeProps & React.ComponentProps<typeof DefaultPressable>;

// Composite component types
export type ButtonProps = ThemeProps & {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
};

export type CardProps = ThemeProps & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export type ListItemProps = ThemeProps & {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  rightElement?: React.ReactNode;
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const { theme } = useTheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

// Base Components
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

export function TextInput(props: TextInputProps) {
  const { style, lightColor, darkColor, placeholderTextColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');
  const placeholderColor = useThemeColor({}, 'secondary');

  return (
    <DefaultTextInput
      style={[
        {
          color,
          backgroundColor,
          borderColor,
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          fontSize: 16,
        },
        style
      ]}
      placeholderTextColor={placeholderTextColor || placeholderColor}
      {...otherProps}
    />
  );
}

export function ScrollView(props: ScrollViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultScrollView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function ActivityIndicator(props: ActivityIndicatorProps) {
  const { lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'highlight');

  return <DefaultActivityIndicator color={color} {...otherProps} />;
}

export function Switch(props: SwitchProps) {
  const { 
    lightColor, 
    darkColor,
    thumbColorLight,
    thumbColorDark,
    trackColorLight,
    trackColorDark,
    ...otherProps 
  } = props;
  
  const { theme } = useTheme();
  const thumbColor = useThemeColor(
    { light: thumbColorLight, dark: thumbColorDark }, 
    'highlight'
  );
  const trackColor = {
    false: useThemeColor({ light: trackColorLight, dark: trackColorDark }, 'secondary'),
    true: useThemeColor({ light: trackColorLight, dark: trackColorDark }, 'highlight') + '40',
  };

  return <DefaultSwitch thumbColor={thumbColor} trackColor={trackColor} {...otherProps} />;
}

export function Pressable(props: PressableProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultPressable style={[{ backgroundColor }, style]} {...otherProps} />;
}

// Composite Components
export function Button(props: ButtonProps) {
  const { 
    title, 
    onPress, 
    disabled, 
    lightColor, 
    darkColor, 
    style, 
    variant = 'primary',
    icon,
    ...otherProps 
  } = props;
  
  const { theme } = useTheme();
  let backgroundColor, textColor, borderColor, borderWidth = 0;
  
  switch (variant) {
    case 'primary':
      backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'button');
      textColor = useThemeColor({ light: lightColor, dark: darkColor }, 'buttonText');
      break;
    case 'secondary':
      backgroundColor = useThemeColor({}, 'secondary') + '20';
      textColor = useThemeColor({}, 'text');
      break;
    case 'outline':
      backgroundColor = 'transparent';
      textColor = useThemeColor({}, 'text');
      borderColor = useThemeColor({}, 'highlight');
      borderWidth = 1;
      break;
  }

  return (
    <TouchableOpacity 
      style={[
        styles.buttonBase,
        {
          backgroundColor,
          borderColor,
          borderWidth,
          opacity: disabled ? 0.6 : 1,
          elevation: theme === 'light' ? 2 : 0,
          shadowColor: theme === 'light' ? '#000' : 'transparent',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme === 'light' ? 0.1 : 0,
          shadowRadius: theme === 'light' ? 4 : 0,
        },
        style
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      {...otherProps}
    >
      {icon && <View style={styles.buttonIcon}>{icon}</View>}
      <Text
        style={[
          styles.buttonText,
          { color: textColor }
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export function Card(props: CardProps) {
  const { children, style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'surface');
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          shadowColor: theme === 'light' ? '#000' : 'transparent',
          elevation: theme === 'light' ? 2 : 0,
        },
        style
      ]}
      {...otherProps}
    >
      {children}
    </View>
  );
}

export function ListItem(props: ListItemProps) {
  const { 
    title, 
    description, 
    icon, 
    onPress, 
    rightElement,
    lightColor,
    darkColor,
    ...otherProps 
  } = props;
  
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryColor = useThemeColor({}, 'secondary');
  const borderColor = useThemeColor({}, 'border');

  return (
    <Pressable
      style={({ pressed }) => [
        styles.listItem,
        {
          backgroundColor,
          borderBottomColor: borderColor,
          opacity: pressed ? 0.8 : 1,
        }
      ]}
      onPress={onPress}
      {...otherProps}
    >
      {icon && <View style={styles.listItemIcon}>{icon}</View>}
      
      <View style={styles.listItemContent}>
        <Text style={[styles.listItemTitle, { color: textColor }]}>{title}</Text>
        {description && (
          <Text style={[styles.listItemDescription, { color: secondaryColor }]}>
            {description}
          </Text>
        )}
      </View>
      
      {rightElement ? (
        <View style={styles.listItemRight}>
          {rightElement}
        </View>
      ) : (
        <MaterialIcons 
          name="chevron-right" 
          size={24} 
          color={secondaryColor} 
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  listItemIcon: {
    marginRight: 16,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  listItemDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  listItemRight: {
    marginLeft: 8,
  },
});

export { TouchableOpacity };
