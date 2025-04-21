// app/modal.tsx
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Image, Animated } from 'react-native';
import { Text, View, Button } from '@/components/Themed';
import { useRouter } from 'expo-router';
import React, { useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './context/ThemeContext';

export default function AuthModal() {
  const router = useRouter();
  const { theme } = useTheme();

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

  const navigateToForgotPassword = () => {
    router.push('/modals/auth/ForgotPasswordModal');
  };
  return (
    <View style={styles.container}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Animated.View 
        style={[
          styles.contentContainer, 
          { 
            opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }] 
          }
        ]}
      >
        <View style={styles.logoContainer}>
          <Image 
            source={theme === 'dark' 
              ? require('../assets/images/icon.png') 
              : require('../assets/images/icon.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
        </View>

        <Text style={styles.welcomeText} type="headline">
          Welcome to Travel App
        </Text>
        
        <Text style={styles.subtitleText} type="paragraph">
          Sign in or create an account to continue your journey
        </Text>
        
        <View style={styles.buttonGroup}>
          <Button 
            title="Sign In" 
            onPress={navigateToSignIn} 
            variant="primary"
            icon={<Ionicons name="log-in" size={20} />}
            style={styles.button}
          />
          
          <Button 
            title="Create Account" 
            onPress={navigateToSignUp}
            variant="outline"
            icon={<Ionicons name="person-add" size={20} />}
            style={styles.button}
          />
        </View>
        <Button 
          title="Forgot Password?" 
          onPress={navigateToForgotPassword} 
          variant="secondary" 
          style={styles.button}
        />
        <View style={styles.footer}>
          <Text style={styles.footerText} type="secondary">
            By continuing, you agree to our Terms and Privacy Policy
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
  },
  welcomeText: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    marginBottom: 32,
    textAlign: 'center',
  },
  buttonGroup: {
    width: '100%',
    marginBottom: 24,
  },
  button: {
    marginBottom: 16,
  },
  footer: {
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});