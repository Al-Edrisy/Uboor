// app/(auth)/signup.tsx
import React, { useState } from 'react';
import { TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../auth/firebaseConfig';
import { authStyles } from './authStyles';

export default function SignUpModal() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.back(); // Close the modal on successful signup
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={authStyles.container}>
      <Text style={authStyles.title}>Sign Up</Text>
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
        onPress={handleSignUp}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={authStyles.buttonText}>Sign Up</Text>
        )}
      </Pressable>
      <Pressable onPress={() => router.back()}>
        <Text style={authStyles.closeButtonText}>Close</Text>
      </Pressable>
    </View>
  );
}