// app/screens/CarsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CarsScreen() {
  return (
    <View style={styles.container}>
      <Text>Cars Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});