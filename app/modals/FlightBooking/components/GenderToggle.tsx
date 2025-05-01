// app/modals/FlightBooking/components/GenderToggle.tsx
import React, { useRef, memo, useContext } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useTheme } from '@/app/context/ThemeContext';
import { useThemeColor } from '@/components/Themed';

interface GenderToggleProps {
  value: 'MALE' | 'FEMALE';
  onChange: (value: 'MALE' | 'FEMALE') => void;
}

const GenderToggle: React.FC<GenderToggleProps> = ({ value, onChange }) => {
  const { theme } = useTheme();
  const highlightColor = useThemeColor({}, 'highlight');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  
  const toggleValue = useRef(new Animated.Value(value === 'MALE' ? 0 : 1)).current;

  const handleToggle = () => {
    const newValue = value === 'MALE' ? 'FEMALE' : 'MALE';
    onChange(newValue);
    
    Animated.spring(toggleValue, {
      toValue: newValue === 'MALE' ? 0 : 1,
      useNativeDriver: false,
      bounciness: 0,
      speed: 12
    }).start();
  };

  const translateX = toggleValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 36],
  });

  const backgroundColor = toggleValue.interpolate({
    inputRange: [0, 1],
    outputRange: [highlightColor, highlightColor],
  });

  return (
    <TouchableOpacity 
      onPress={handleToggle}
      activeOpacity={0.8}
      style={styles.container}
    >
      <Animated.View style={[
        styles.track, 
        { backgroundColor }
      ]}>
        <Animated.View 
          style={[
            styles.thumb, 
            { 
              transform: [{ translateX }],
              backgroundColor: surfaceColor,
              shadowColor: theme === 'light' ? '#000' : 'transparent',
              elevation: theme === 'light' ? 2 : 0,
            }
          ]} 
        />
      </Animated.View>
      <View style={styles.labels}>
        <Text style={[
          styles.label,
          value === 'MALE' ? styles.activeLabel : { color: textColor }
        ]}>
          M
        </Text>
        <Text style={[
          styles.label,
          value === 'FEMALE' ? styles.activeLabel : { color: textColor }
        ]}>
          F
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  track: {
    width: 72,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  labels: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 8,
  },
  activeLabel: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default memo(GenderToggle);