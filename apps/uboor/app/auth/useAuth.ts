import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../auth/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await AsyncStorage.setItem('user', JSON.stringify(user)); // Save user data
      } else {
        await AsyncStorage.removeItem('user'); // Remove user data
      }
      setUser(user);
      setLoading(false);
    });
    return unsubscribe; // Cleanup subscription
  }, []);

  return { user, loading };
};