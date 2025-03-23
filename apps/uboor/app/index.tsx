// app/index.tsx
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from './auth/firebaseConfig';
import SplashScreen from './screens/SplashScreen';

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const user = auth.currentUser;
      if (user) {
        router.replace('/(tabs)/home'); // Navigate to home if authenticated
      } else {
      router.replace('/(auth)/login'); // Navigate to login if not authenticated
      }
      setLoading(false);
    };

    const timer = setTimeout(() => {
      checkUser();
    }, 2000); // Show splash screen for 2 seconds

    return () => clearTimeout(timer); // Ensure cleanup
  }, [router]);

  if (loading) {
    return <SplashScreen />;
  }

  return <View />; // Ensures a valid return statement if no navigation occurs
}