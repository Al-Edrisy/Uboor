import React, { useState } from 'react';
import { Modal, View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const TravelersModal = ({ visible, onClose }) => {
  const [adults, setAdults] = useState(1);
  const [youths, setYouths] = useState(0);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

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
            <Text style={styles.headerText}>Travelers</Text>
            <View style={{ width: 24 }} /> {/* Placeholder for alignment */}
          </View>

          {/* Travelers Selection */}
          <ScrollView style={styles.selectionContainer}>
            <TravelerSelector
              label="Adults"
              count={adults}
              setCount={setAdults}
            />
            <TravelerSelector
              label="Youths"
              count={youths}
              setCount={setYouths}
              ageInfo="(Age 12-17)"
            />
            <TravelerSelector
              label="Children"
              count={children}
              setCount={setChildren}
              ageInfo="(Age 2-11)"
            />
            <TravelerSelector
              label="Infants"
              count={infants}
              setCount={setInfants}
              ageInfo="(Under 2)"
            />
          </ScrollView>

          {/* Done Button */}
          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const TravelerSelector = ({ label, count, setCount, ageInfo }) => {
  return (
    <View style={styles.selectorContainer}>
      <View>
        <Text style={styles.label}>{label}</Text>
        {ageInfo && <Text style={styles.ageInfo}>{ageInfo}</Text>}
      </View>
      <View style={styles.counterContainer}>
        <TouchableOpacity onPress={() => setCount(Math.max(0, count - 1))}>
          <FontAwesome5 name="minus-circle" size={24} color="#9CA3AF" />
        </TouchableOpacity>
        <Text style={styles.count}>{count}</Text>
        <TouchableOpacity onPress={() => setCount(count + 1)}>
          <FontAwesome5 name="plus-circle" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
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
  selectionContainer: {
    flex: 1,
  },
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563', // Border color
  },
  label: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  ageInfo: {
    color: '#9CA3AF', // Light gray for age info
    fontSize: 12,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  count: {
    color: '#FFFFFF',
    fontSize: 18,
    marginHorizontal: 10,
  },
  doneButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default TravelersModal;