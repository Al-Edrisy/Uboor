import React, { useState, useRef, useEffect } from 'react';
import { Platform, StyleSheet, Alert, KeyboardAvoidingView, ActivityIndicator, Animated } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import auth from '../../lib/firebase';
import { Text, View, TextInput, Button } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './../../context/ThemeContext';

export default function SignInModal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
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
      <View style={styles.formContainer}>
        <View style={styles.header}>
          <Text style={styles.title} type="headline">
            Welcome Back
          </Text>
          <Text style={styles.subtitle} type="paragraph">
            Sign in to continue your journey
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

        <View style={styles.inputGroup}>
          <Text style={styles.label} type="secondary">
            Password
          </Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.input}
              editable={!loading}
            />
            <Button 
              variant="icon"
              onPress={() => setShowPassword(!showPassword)}
              icon={
                <Ionicons 
                  name={showPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                />
              }
              style={styles.eyeButton}
            />
          </View>
        </View>

        <Button
          title={loading ? 'Signing In...' : 'Sign In'}
          onPress={handleSignIn}
          disabled={loading}
          variant="primary"
          icon={loading ? null : <Ionicons name="log-in" size={20} />}
          style={styles.signInButton}
        />

        {loading && (
          <ActivityIndicator 
            size="large" 
            style={styles.loader}
          />
        )}

        <Button
          title="Forgot Password?"
          onPress={() => router.push('/modals/auth/ForgotPasswordModal')}
          variant="text"
          style={styles.forgotPasswordButton}
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText} type="secondary">
            or
          </Text>
          <View style={styles.dividerLine} />
        </View>

        <Button
          title="Create Account"
          onPress={() => router.push('/modals/auth/SignUpModal')}
          variant="outline"
          icon={<Ionicons name="person-add" size={20} />}
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
  title: {
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    width: '100%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeButton: {
    marginLeft: 8,
    width: 50,
  },
  signInButton: {
    marginTop: 8,
  },
  loader: {
    marginTop: 16,
  },
  forgotPasswordButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d1d1e9',
  },
  dividerText: {
    marginHorizontal: 8,
    fontSize: 12,
  },
  icon: {
    marginBottom: 16,
    backgroundColor: 'transparent',
    borderRadius: 24,
    padding: 16,
  },
});