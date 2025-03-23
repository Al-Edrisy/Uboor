// app/(auth)/forgotPassword.tsx
import React, { useState } from 'react';
import { TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../auth/firebaseConfig';
import { authStyles } from './authStyles';
import { useRouter } from 'expo-router';

export default function ForgotPasswordModal() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Success', 'Password reset email sent. Check your inbox.');
      router.back(); // Close the modal on success
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={authStyles.container}>
      <Text style={authStyles.title}>Forgot Password</Text>
      <TextInput
        style={authStyles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Pressable
        style={({ pressed }) => [
          authStyles.button,
          { opacity: pressed || isLoading ? 0.8 : 1 },
        ]}
        onPress={handleResetPassword}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={authStyles.buttonText}>Reset Password</Text>
        )}
      </Pressable>
      <Pressable onPress={() => router.back()}>
        <Text style={authStyles.closeButtonText}>Close</Text>
      </Pressable>
    </View>
  );
}