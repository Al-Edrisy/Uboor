// app/modals/auth/ForgotPasswordModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Platform, 
  StyleSheet, 
  TextInput, 
  Alert, 
  KeyboardAvoidingView, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Animated
} from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import auth from '../../lib/firebase';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';

export default function ForgotPasswordModal() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const fadeAnim = useRef(new Animated.Value( 0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
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
      router.push('/modals/auth/SignInModal'); // Redirect to sign-in after reset
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
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.title}>Reset Password</Text>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={handleResetPassword} disabled={loading}>
            <Text style={styles.button}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/modals/auth/SignInModal')}>
            <Text style={styles.linkText}>Back to Sign In</Text>
          </TouchableOpacity>
          {loading && <ActivityIndicator size="large" color="#0000ff" />}
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  button: {
    textAlign: 'center',
    backgroundColor: '#4285F4',
    color: 'white',
    padding: 10,
    borderRadius: 5,
  },
  linkText: {
    color: 'blue',
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginTop: 10,
  },
});