import React from 'react';
import { View, Text, Button } from 'react-native';
import { signOut } from 'firebase/auth';
import auth from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export default function AccountScreen() {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View>
      <Text>Account</Text>
      {user ? (
        <>
          <Text>Email: {user.email}</Text>
          <Button title="Logout" onPress={handleLogout} />
        </>
      ) : (
        <Text>No user signed in</Text>
      )}
    </View>
  );
}