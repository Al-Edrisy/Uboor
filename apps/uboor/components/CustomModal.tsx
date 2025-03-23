// components/CustomModal.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';

type CustomModalProps = {
  isVisible: boolean;
  onClose: () => void;
};

export default function CustomModal({ isVisible, onClose }: CustomModalProps) {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose} // Close modal when backdrop is pressed
      onBackButtonPress={onClose} // Close modal on Android back button
      style={styles.modal}
      animationIn="slideInUp" // Slide up from the bottom
      animationOut="slideOutDown" // Slide down to the bottom
    >
      <View style={styles.container}>
        <Text style={styles.title}>This is a Modal</Text>
        <Pressable onPress={onClose} style={styles.button}>
          <Text style={styles.buttonText}>Close</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end', // Align modal to the bottom
    margin: 0, // Remove default margin
  },
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2f95dc',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});