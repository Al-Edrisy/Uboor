import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useThemeColor } from '@/components/Themed';
import { useTheme } from './../context/ThemeContext';

export default function SearchScreen() {
  const { theme } = useTheme();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const highlightColor = useThemeColor({}, 'highlight');
  const surfaceColor = useThemeColor({}, 'surface');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.searchContainer, { backgroundColor: surfaceColor }]}>
        <Text style={[styles.searchTitle, { color: highlightColor }]}>
          Where to?
        </Text>
        <Text style={[styles.searchPrompt, { color: textColor }]}>
          Search destinations, hotels, flights...
        </Text>
      </View>
      
      <Text style={[styles.sectionTitle, { color: highlightColor }]}>
        Popular Destinations
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 70,

    flex: 1,
    padding: 16,
  },
  searchContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  searchPrompt: {
    fontSize: 16,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});