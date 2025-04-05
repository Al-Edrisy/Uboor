// app/AnimatedSplashScreen.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

type AnimatedSplashScreenProps = {
  onAnimationFinish: () => void;
  duration?: number;
};

export default function AnimatedSplashScreen({ onAnimationFinish, duration = 3000 }: AnimatedSplashScreenProps) {
  // Changed from 10000 to 3000 (3 seconds)
  const animationProgress = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const startAnimation = useCallback(() => {
    Animated.timing(animationProgress, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        // Reduce fade out time too
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300, // Changed from 500 to 300ms
          useNativeDriver: true,
        }).start(() => {
          onAnimationFinish();
        });
      }
    });
  }, [animationProgress, duration, onAnimationFinish, opacity]);

  useEffect(() => {
    startAnimation();
    return () => {
      Animated.timing(animationProgress, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false,
      }).stop();
    };
  }, [startAnimation]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <LottieView
        source={require('../assets/images/splash_icon.json')}
        style={styles.animation}
        autoPlay
        loop={false}
        speed={1.5} // Speed up the animation
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 200,
    height: 200,
  },
});