import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useThemeColor } from '@/components/Themed';
import { useTheme } from './../context/ThemeContext';

export default function InboxScreen() {
  const { theme } = useTheme();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const highlightColor = useThemeColor({}, 'highlight');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: highlightColor }]}>Your Inbox</Text>
      <Text style={[styles.subtitle, { color: textColor }]}>
        Messages and notifications will appear here
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
});