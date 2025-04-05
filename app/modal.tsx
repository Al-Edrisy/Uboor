// app/modal.tsx
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Image, Animated, TouchableOpacity } from 'react-native';
import { Text, View, Button } from '@/components/Themed';
import { useRouter } from 'expo-router';
import React, { useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function AuthModal() {
  const router = useRouter();
  
  // Animation for entrance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const navigateToSignIn = () => {
    router.push('/modals/auth/SignInModal');
  };

  const navigateToSignUp = () => {
    router.push('/modals/auth/SignUpModal');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Animated.View 
        style={[
          styles.contentContainer,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }] 
          }
        ]}
      >
        <Image 
          source={require('../assets/images/icon.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        
        <Text style={styles.welcomeText}>Welcome to the App</Text>
        <Text style={styles.subtitleText}>Sign in or create an account to continue</Text>
        
        <Button 
          title="Sign In" 
          onPress={navigateToSignIn} 
          lightColor="#4285F4"
          darkColor="#4285F4"
        />
        
        <View style={styles.spacer} />
        
        <Button 
          title="Create Account" 
          onPress={navigateToSignUp}
          lightColor="#34A853" 
          darkColor="#34A853"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.7,
  },
  spacer: {
    height: 16,
  },
});