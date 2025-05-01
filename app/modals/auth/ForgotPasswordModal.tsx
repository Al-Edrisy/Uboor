import React, { useState, useRef, useEffect } from 'react';
import { Platform, StyleSheet, Alert, KeyboardAvoidingView, ActivityIndicator, Animated, } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import {auth} from '../../lib/firebase';
import { Text, View, TextInput, Button } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './../../context/ThemeContext';

export default function ForgotPasswordModal() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Success', 'Check your email for a password reset link.');
      router.replace('/'); 
      router.push('/modals/auth/SignInModal');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <View style={styles.header}>
          <Ionicons name="key" size={48} style={styles.icon} />
          <Text style={styles.title} type="headline">
            Reset Password
          </Text>
          <Text style={styles.subtitle} type="paragraph">
            Enter your email to receive a password reset link
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label} type="secondary">
            Email Address
          </Text>
          <TextInput
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            editable={!loading}
          />
        </View>

        <Button
          title={loading ? 'Sending...' : 'Send Reset Link'}
          onPress={handleResetPassword}
          disabled={loading}
          variant="primary"
          icon={loading ? null : <Ionicons name="send" size={20} />}
          style={styles.resetButton}
        />

        {loading && (
          <ActivityIndicator 
            size="large" 
            style={styles.loader}
          />
        )}

        <Button
          title="Back to Sign In"
          onPress={() => router.push('/modals/auth/SignInModal')}
          variant="text"
          icon={<Ionicons name="arrow-back" size={20}/>}
          style={styles.backButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 16,
    backgroundColor: 'transparent',
    
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    width: '100%',
  },
  resetButton: {
    marginTop: 8,
  },
  loader: {
    marginTop: 16,
  },
  backButton: {
    marginTop: 24,
    alignSelf: 'center',
  },
});