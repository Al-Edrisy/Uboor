import React, { useState } from 'react';
import { Modal, View, StyleSheet, TextInput, TouchableOpacity, Text, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const FlyingToModal = ({ visible, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const pastSearches = [
    { location: 'Istanbul (IST - Istanbul)', country: 'Türkiye' },
    { location: 'Nicosia, Cyprus' },
    { location: 'Wilmington (ILM - Wilmington Intl.)', country: 'North Carolina, United States' },
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5 name="times" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Flying From</Text>
            <View style={{ width: 24 }} /> {/* Placeholder for alignment */}
          </View>

          {/* Search Input */}
          <View style={styles.inputContainer}>
            <FontAwesome5 name="map-marker-alt" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="City or airport"
              placeholderTextColor="#9CA3AF"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          {/* Past Searches */}
          <Text style={styles.pastSearchesTitle}>Past searches</Text>
          <ScrollView style={styles.pastSearchesContainer}>
            {pastSearches.map((search, index) => (
              <View key={index} style={styles.pastSearchItem}>
                <FontAwesome5 name="history" size={20} color="#FFFFFF" style={styles.historyIcon} />
                <View>
                  <Text style={styles.pastSearchLocation}>{search.location}</Text>
                  {search.country && <Text style={styles.pastSearchCountry}>{search.country}</Text>}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1F2937', // Dark gray background
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    backgroundColor: '#2D3748', // Darker gray for input
    color: '#FFFFFF',
    paddingVertical: 12,
    paddingLeft: 40,
    paddingRight: 16,
    borderRadius: 8,
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  pastSearchesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  pastSearchesContainer: {
    maxHeight: 200,
  },
  pastSearchItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2D3748', // Darker gray for past search items
    borderRadius: 8,
    marginBottom: 8,
  },
  historyIcon: {
    marginRight: 12,
  },
  pastSearchLocation: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  pastSearchCountry: {
    color: '#9CA3AF', // Light gray for country text
    fontSize: 12,
  },
});

export default FlyingToModal;