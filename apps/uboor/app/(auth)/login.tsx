// app/(auth)/login.tsx
import React, { useState } from 'react';
import { TextInput, Pressable, Alert, ActivityIndicator, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../auth/firebaseConfig';
import { authStyles } from './authStyles';

export default function LoginModal() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.back(); // Close the modal on successful login
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={authStyles.container} >
      <Text style={authStyles.title}>Login</Text>
      <TextInput
        style={authStyles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={authStyles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Pressable
        style={({ pressed }) => [
          authStyles.button,
          { opacity: pressed || isLoading ? 0.8 : 1 },
        ]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={authStyles.buttonText}>Login</Text>
        )}
      </Pressable>
      <Pressable onPress={() => router.push('/(auth)/signup')}>
        <Text style={authStyles.linkText}>Don't have an account? Sign Up</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/(auth)/forgotPassword')}>
        <Text style={authStyles.linkText}>Forgot Password?</Text>
      </Pressable>
      <Pressable onPress={() => router.back()}>
        <Text style={authStyles.closeButtonText}>Close</Text>
      </Pressable>
    </View>
  );
}