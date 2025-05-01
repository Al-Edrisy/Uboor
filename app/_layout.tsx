import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { SplashScreen as ExpoSplash, Stack, useRouter } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import AnimatedSplashScreen from '../components/AnimatedSplashScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import 'react-native-reanimated';
import { useColorScheme } from './../components/useColorScheme';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    ExpoSplash.preventAutoHideAsync();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
          <AppInitializer />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppInitializer() {
  const [showSplash, setShowSplash] = React.useState(true);

  const onSplashReady = useCallback(async () => {
    setShowSplash(false);
    await ExpoSplash.hideAsync();
  }, []);

  return showSplash ? (
    <AnimatedSplashScreen onAnimationFinish={onSplashReady} />
  ) : (
    <RootNavigator />
  );
}

function RootNavigator() {
  const colorScheme = useAuthScheme();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Close all auth modals if logged in
        if (router.canGoBack()) {
          router.back();
        }
        router.replace('/');
      } else if (!router.asPath?.startsWith('/modals/auth/AuthModal')) {
        // Show auth modal if not logged in
        router.push('./modal');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingScreen theme={colorScheme} />;
  }

  const navTheme = colorScheme === 'dark' ? customDark : customLight;

  return (
    <NavigationThemeProvider value={navTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="modals/auth/auth-modal"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="modals/auth/sign-in"
          options={{ presentation: 'modal', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="modals/auth/sign-up"
          options={{ presentation: 'modal', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="modals/auth/forgot-password"
          options={{ presentation: 'modal', animation: 'slide_from_right' }}
        />
      </Stack>
    </NavigationThemeProvider>
  );
}

function LoadingScreen({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <View style={[styles.loading, { backgroundColor: theme === 'dark' ? '#16161a' : '#fffffe' }]} />
  );
}

function useAuthScheme(): 'light' | 'dark' {
  const scheme = useColorScheme();
  return scheme === 'dark' ? 'dark' : 'light';
}

const customDark = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#16161a',
    card: '#242629',
    text: '#fffffe',
    border: '#010101',
    primary: '#7f5af0',
  },
};

const customLight = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#fffffe',
    card: '#f0f0f0',
    text: '#2b2c34',
    border: '#d1d1e9',
    primary: '#6246ea',
  },
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});