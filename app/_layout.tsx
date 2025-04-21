// app/_layout.tsx
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack, useRouter } from 'expo-router';
import { View } from 'react-native';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/components/useColorScheme';
import AnimatedSplashScreen from './AnimatedSplashScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FlightBookingProvider } from './context/FlightBookingContext';
import { ThemeProvider } from './context/ThemeContext';

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
    <ThemeProvider> {/* Wrap everything with our custom ThemeProvider */}
      <AuthProvider>
        <FlightBookingProvider>
          <AppInitializer />
        </FlightBookingProvider>
      </AuthProvider>
    </ThemeProvider>
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
        backgroundColor: colorScheme === 'dark' ? '#16161a' : '#fffffe', // Updated to use our theme colors
        justifyContent: 'center',
        alignItems: 'center'
      }} />
    );
  }

  // Create custom navigation themes based on our color scheme
  const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#16161a', // Our dark background
      card: '#242629', // Our dark surface
      text: '#fffffe', // Our dark text
      border: '#010101', // Our dark border
      primary: '#7f5af0', // Our dark highlight/button color
    },
  };

  const CustomLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#fffffe', // Our light background
      card: '#f0f0f0', // Our light surface
      text: '#2b2c34', // Our light text
      border: '#d1d1e9', // Our light border
      primary: '#6246ea', // Our light highlight/button color
    },
  };

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme}>
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
    </NavigationThemeProvider>
  );
}