// app/_layout.tsx
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack, useRouter } from 'expo-router';
import { View } from 'react-native';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/components/useColorScheme';
import AnimatedSplashScreen from './AnimatedSplashScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FlightBookingProvider } from './context/FlightBookingContext';

// Keep the splash screen visible until we're ready to render
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Handle errors during initialization
  useEffect(() => {
    if (fontError) {
      console.error('Error loading fonts:', fontError);
    }
  }, [fontError]);

  // If resources aren't loaded yet, render nothing and keep splash screen
  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <FlightBookingProvider>
        <AppInitializer />
      </FlightBookingProvider>
    </AuthProvider>
  );
}

function AppInitializer() {
  const [showSplash, setShowSplash] = React.useState(true);

  if (showSplash) {
    return (
      <AnimatedSplashScreen
        onAnimationFinish={() => {
          setShowSplash(false);
          SplashScreen.hideAsync();
        }}
        duration={2500}
      />
    );
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const router = useRouter();

  // Handle authentication state changes
  useEffect(() => {
    if (!loading && !user) {
      router.push('/modal');
    }
  }, [user, loading, router]);

  // Show loading state while auth state is being determined
  if (loading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: colorScheme === 'dark' ? '#121212' : '#fff',
        justifyContent: 'center',
        alignItems: 'center'
      }} />
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}