// app/screens/ThingsToDoScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ThingsToDoScreen() {
  return (
    <View style={styles.container}>
      <Text>Things to Do Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});