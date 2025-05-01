import React, { useState, useCallback, memo, useMemo } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Traveler } from "../types/bookingTypes";
import InputWithValidation from './InputWithValidation';
import GenderToggle from './GenderToggle';
import { useTheme } from '@/app/context/ThemeContext';
import { useThemeColor } from '@/components/Themed';

interface TravelerModalProps {
  traveler: Traveler;
  index: number;
  onSave: (traveler: Traveler) => void;
  onClose: () => void;
  visible: boolean;
}

const TravelerModal: React.FC<TravelerModalProps> = ({
  traveler,
  index,
  onSave,
  onClose,
  visible,
}) => {
  const { theme } = useTheme();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const highlightColor = useThemeColor({}, 'highlight');
  const borderColor = useThemeColor({}, 'border');
  const secondaryColor = useThemeColor({}, 'secondary');
  const dangerColor = useThemeColor({}, 'error');
  const placeholderColor = useThemeColor({}, 'placeholder');

  const [localTraveler, setLocalTraveler] = useState(traveler);
  const [localDatePickerVisible, setLocalDatePickerVisible] = useState(false);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const validateTraveler = (traveler: Traveler) => {
    const newErrors: Record<string, string> = {};
    
    if (!traveler.name.firstName) {
      newErrors['firstName'] = 'First name is required';
    }
    
    if (!traveler.dateOfBirth) {
      newErrors['dateOfBirth'] = 'Date of birth is required';
    }
    
    return newErrors;
  };

  const handleChange = useCallback((field: string, value: string | boolean) => {
    setLocalTraveler(prev => {
      const fieldPath = field.split('.');
      if (fieldPath[0] === 'name') {
        return {
          ...prev,
          name: { ...prev.name, [fieldPath[1]]: value as string }
        };
      }
      return { ...prev, [field]: value };
    });

    if (localErrors[field]) {
      const newErrors = { ...localErrors };
      delete newErrors[field];
      setLocalErrors(newErrors);
    }
  }, [localErrors]);

  const handleSave = useCallback(() => {
    const validationErrors = validateTraveler(localTraveler);
    if (Object.keys(validationErrors).length > 0) {
      setLocalErrors(validationErrors);
      Alert.alert('Validation Error', 'Please fill all required fields correctly');
      return;
    }

    onSave(localTraveler);
    onClose();
  }, [localTraveler, onSave, onClose]);

  const formattedDate = useMemo(() => {
    if (!localTraveler.dateOfBirth) return '';
    const [year, month, day] = localTraveler.dateOfBirth.split('-');
    return `${day}/${month}/${year}`;
  }, [localTraveler.dateOfBirth]);

  const inputStyle = [
    styles.input,
    { 
      borderColor: borderColor,
      backgroundColor: surfaceColor
    }
  ];

  const dateInputStyle = [
    styles.dateInput,
    { 
      borderColor: localErrors.dateOfBirth ? dangerColor : borderColor,
      backgroundColor: surfaceColor
    }
  ];

  const primaryButtonStyle = [
    styles.primaryButton,
    { 
      backgroundColor: highlightColor,
      shadowColor: theme === 'light' ? '#000' : 'transparent',
      elevation: theme === 'light' ? 2 : 0,
    }
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={false}
    >
      <View style={[styles.modalContainer, { backgroundColor }]}>
        <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
          <MaterialIcons 
            name="arrow-back" 
            size={24} 
            color={highlightColor} 
            onPress={onClose}
          />
          <Text style={[styles.modalTitle, { color: textColor }]}>
            {traveler.name.firstName ? `Edit Traveler ${index + 1}` : `Add Traveler ${index + 1}`}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: highlightColor }}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.modalContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Personal Information
          </Text>
          
          <InputWithValidation
            placeholder="First Name *"
            value={localTraveler.name.firstName}
            onChangeText={(text: string) => handleChange('name.firstName', text)}
            autoCapitalize="words"
            returnKeyType="next"
            error={localErrors['firstName']}
            highlightColor={highlightColor}
            textColor={textColor}
            borderColor={borderColor}
            surfaceColor={surfaceColor}
            dangerColor={dangerColor}
            placeholderColor={placeholderColor}
          />

          <InputWithValidation
            placeholder="Last Name"
            value={localTraveler.name.lastName}
            onChangeText={(text: string) => handleChange('name.lastName', text)}
            autoCapitalize="words"
            returnKeyType="next"
            highlightColor={highlightColor}
            textColor={textColor}
            borderColor={borderColor}
            surfaceColor={surfaceColor}
            dangerColor={dangerColor}
            placeholderColor={placeholderColor}
          />

          <Text style={[styles.label, { color: textColor }]}>Gender</Text>
          <GenderToggle
            value={localTraveler.gender}
            onChange={(gender) => handleChange('gender', gender)}
          />

          <Text style={[styles.label, { color: textColor }]}>Date of Birth *</Text>
          <TouchableOpacity
            style={dateInputStyle}
            onPress={() => setLocalDatePickerVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={{ color: localTraveler.dateOfBirth ? textColor : placeholderColor }}>
              {formattedDate || 'Select date'}
            </Text>
          </TouchableOpacity>
          {localErrors['dateOfBirth'] && (
            <Text style={[styles.errorText, { color: dangerColor }]}>{localErrors['dateOfBirth']}</Text>
          )}

          <DateTimePickerModal
            isVisible={localDatePickerVisible}
            mode="date"
            maximumDate={new Date()}
            onConfirm={(date) => {
              handleChange('dateOfBirth', date.toISOString().split('T')[0]);
              setLocalDatePickerVisible(false);
            }}
            onCancel={() => setLocalDatePickerVisible(false)}
          />

          <TouchableOpacity
            style={primaryButtonStyle}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {traveler.name.firstName ? 'Update Traveler' : 'Add Traveler'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    paddingTop: 50,
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  modalContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 8,
  },
  primaryButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default memo(TravelerModal);