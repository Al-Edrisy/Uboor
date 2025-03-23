// app/(tabs)/home.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../auth/firebaseConfig';

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser ] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser (user);
    });

    return unsubscribe;
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "white"}}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Welcome to the App!</Text>
      {user ? ( // If the user is logged in, show their email
        <Text style={{ fontSize: 16, marginBottom: 20 }}>
          Logged in as: {user.email}
        </Text>
      ) : ( // If the user is not logged in, show the Log In button
        <Pressable
          onPress={() => router.push('/(auth)/login')} // Open the login modal
          style={{ backgroundColor: '#2f95dc', padding: 10, borderRadius: 8 }}
        >
          <Text style={{ color: '#fff', fontSize: 16 }}>Log In</Text>
        </Pressable>
      )}
    </View>
  );
}