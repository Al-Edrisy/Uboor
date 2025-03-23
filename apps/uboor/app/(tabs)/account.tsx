// app/(tabs)/AccountScreen.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, Pressable, Alert, View, Text } from 'react-native';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../auth/firebaseConfig';
import { useRouter } from 'expo-router';

export default function AccountScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Listen for changes in the user's authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return unsubscribe; // Cleanup the listener on unmount
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      Alert.alert('Success', 'You have been logged out.');
      router.replace('/(auth)/login'); // Redirect to the login screen
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>You need to sign in to view this screen.</Text>
        <Pressable
          onPress={() => router.push('/(auth)/login')}
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.button,
          { opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Text style={styles.buttonText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2f95dc',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});