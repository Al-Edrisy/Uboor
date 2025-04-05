// app/modals/auth/SignUpModal.tsx
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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import auth from '../../lib/firebase';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpModal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword , setConfirmPassword] = useState('');
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

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Account created successfully!');
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
        <Text style={styles.title}>Create Account</Text>
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
          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSignUp} disabled={loading}>
            <Text style={styles.button}>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/modals/auth/ForgotPasswordModal')}>
            <Text style={styles.linkText}>Already have an account? Sign In</Text>
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
    backgroundColor: '#34A853',
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