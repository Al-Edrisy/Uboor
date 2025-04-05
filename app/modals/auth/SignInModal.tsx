// app/modals/auth/SignInModal.tsx
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
import { signInWithEmailAndPassword } from 'firebase/auth';
import auth from '../../lib/firebase';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SignInModal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Signed in successfully!');
      router.back();
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
        <Text style={styles.title}>Sign In</Text>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSignIn} disabled={loading}>
            <Text style={styles.button}>{loading ? 'Signing In...' : 'Sign In'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/modals/auth/ForgotPasswordModal')}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/modals/auth/SignInModal')}>
            <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
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