import React from 'react';
import { Modal, View, Text, Button } from 'react-native';

const FlightDetailsModal = ({ visible, onClose, flight }) => {
  return (
    <Modal visible={visible} animationType="slide">
      <View>
        <Text>{flight.title}</Text>
        <Button title="Close" onPress={onClose} />
      </View>
    </Modal>
  );
};

export default FlightDetailsModal;