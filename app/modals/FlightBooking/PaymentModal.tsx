import React from 'react';
import { Modal, View, Text, Button } from 'react-native';

const PaymentModal = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide">
      <View>
        <Text>Payment Details</Text>
        <Button title="Close" onPress={onClose} />
      </View>
    </Modal>
  );
};

export default PaymentModal;