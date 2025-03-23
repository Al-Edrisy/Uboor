// app/screens/SplashScreen.tsx
import React, { useEffect } from 'react';
import { View, Image, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../auth/firebaseConfig';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export default function SplashScreen() {
  const router = useRouter();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
    scale.value = withTiming(1, { duration: 1000 });

    const checkUser = async () => {
      const user = auth.currentUser;
      if (user) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(tabs)/home');
      }
    };

    const timer = setTimeout(() => {
      checkUser();
    }, 2000);

    return () => clearTimeout(timer);
  }, [router, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View style={styles.container} >
      <Animated.View style={animatedStyle}>
        <Image
          source={require('@/assets/images/icon.png')} // Replace with your logo path
          style={styles.logo}
        />
      </Animated.View>
      <ActivityIndicator size="large" color="#2f95dc" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2f95dc',
  },
});