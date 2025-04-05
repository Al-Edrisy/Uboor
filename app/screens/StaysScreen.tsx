import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SlideInView from '@/components/SlideInView'; // Import the SlideInView component

export default function StaysScreen() {
  return (
    <SlideInView style={styles.container}>
      <Text style={styles.title}>Stays Screen</Text>
    </SlideInView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
  },
});