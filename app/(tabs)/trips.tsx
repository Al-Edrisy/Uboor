import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useThemeColor } from '@/components/Themed';
import { useTheme } from './../context/ThemeContext';

export default function TripsScreen() {
  const { theme } = useTheme();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const highlightColor = useThemeColor({}, 'highlight');
  const surfaceColor = useThemeColor({}, 'surface');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: surfaceColor }]}>
        <Text style={[styles.title, { color: highlightColor }]}>Your Trips</Text>
        <Text style={[styles.subtitle, { color: textColor }]}>
          Upcoming, ongoing, and past adventures
        </Text>
      </View>
      
      <Text style={[styles.emptyText, { color: textColor }]}>
        No trips booked yet
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,

    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 48,
    fontSize: 16,
    opacity: 0.6,
  },
});