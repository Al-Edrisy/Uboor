// app/screens/PackagesScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PackagesScreen() {
  return (
    <View style={styles.container}>
      <Text>Packages Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});