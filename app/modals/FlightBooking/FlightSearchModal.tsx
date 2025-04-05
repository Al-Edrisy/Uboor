// app/modals/FlightBooking/FlightSearchModal.tsx
import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useFlightBooking } from '../../context/FlightBookingContext';
import FlightSearchForm from './FlightSearchForm';

const FlightSearchModal = () => {
  const { isFlightModalVisible, setFlightModalVisible } = useFlightBooking();

  return (
    <Modal
      visible={isFlightModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setFlightModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Flight Search</Text>
          <FlightSearchForm />
          <Pressable
            style={styles.closeButton}
            onPress={() => setFlightModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FlightSearchModal;