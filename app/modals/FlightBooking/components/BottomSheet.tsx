// app/modals/FlightBooking/components/BottomSheet.tsx
import React, { useEffect, useRef, useContext } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, TouchableOpacity, Platform, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/app/context/ThemeContext';
import { useThemeColor } from '@/components/Themed';
const { height } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ visible, onClose, children }) => {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(height)).current;
  const surfaceColor = useThemeColor({}, 'surface');

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : height,
      duration: 300,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={onClose}
        accessible={false}
      >
        <BlurView
          intensity={Platform.OS === 'ios' ? 50 : 20}
          tint={theme === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      </TouchableOpacity>
      
      <Animated.View 
        style={[
          styles.container,
          { 
            backgroundColor: surfaceColor,
            shadowColor: theme === 'light' ? '#000' : 'transparent',
            elevation: theme === 'light' ? 8 : 0,
            transform: [{ translateY: slideAnim }]
          }
        ]}
        accessibilityViewIsModal={true}
      >
        <View style={styles.handleContainer}>
          <View style={[styles.handleBar, { backgroundColor: useThemeColor({}, 'secondary') }]} />
        </View>
        {children}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  handleBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
});

export default BottomSheet;