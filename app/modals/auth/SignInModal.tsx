import React, { useState, useRef, useEffect } from 'react';
import { Platform, StyleSheet, Alert, KeyboardAvoidingView, ActivityIndicator, Animated } from 'react-native';
import { signInWithEmailAndPassword, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import {auth} from '../../lib/firebase';
import { Text, View, TextInput, Button } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './../../context/ThemeContext';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

// Let Expo handle the redirect
WebBrowser.maybeCompleteAuthSession();

export default function SignInModal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    expoClientId: '640873751207-uch8u1cvtpn21r9dmp0b0mspkd64da60.apps.googleusercontent.com',
    iosClientId: '640873751207-hm5k0ne86ned9i3ge56alsc8rn54jpgm.apps.googleusercontent.com',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    webClientId: '640873751207-7jofjtijr35tumu6sl8i1pjsa9ulh4ia.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
  });

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

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { id_token } = googleResponse.authentication;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(userCred => {
          const user = userCred.user;
          Alert.alert('Welcome', `Signed in as ${user.email}`);
          router.replace('/');
        })
        .catch(error => {
          Alert.alert('Login Error', error.message);
        });
    }
  }, [googleResponse]);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/');
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
          title="Sign in with Google"
          onPress={() => googlePromptAsync()}
          disabled={!googleRequest}
          variant="outline"
          icon={<Ionicons name="logo-google" size={20} />}
          style={styles.socialButton}
        />

        <Button
          title="Create Account"
          onPress={() => router.push('/modals/auth/SignUpModal')}
          variant="text"
          icon={<Ionicons name="person-add" size={20} />}
          style={styles.createAccountButton}
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
  socialButton: {
    marginBottom: 16,
  },
  createAccountButton: {
    marginTop: 8,
  },
});