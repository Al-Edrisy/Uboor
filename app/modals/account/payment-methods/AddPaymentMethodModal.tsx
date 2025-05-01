import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/components/Themed';
import { validateCardNumber } from '../../FlightBooking/utils/validationHelpers';

const validateExpiry = (expiry: string): boolean => {
  const [month, year] = expiry.split('/').map(Number);
  if (!month || !year || month < 1 || month > 12) return false;
  
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  
  return true;
};

const validateCVC = (cvc: string): boolean => {
  return /^\d{3,4}$/.test(cvc);
};

const formatCardNumber = (input: string): string => {
  const v = input.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const parts = [];
  
  for (let i = 0, len = v.length; i < len; i += 4) {
    parts.push(v.substring(i, i + 4));
  }
  
  return parts.length ? parts.join(' ') : input;
};

const formatExpiry = (input: string): string => {
  const expiry = input.replace(/\D/g, '');
  if (expiry.length >= 3) {
    return `${expiry.slice(0, 2)}/${expiry.slice(2)}`;
  }
  return input;
};

const getCardBrand = (number: string): string => {
  const num = number.replace(/\D/g, '');
  if (/^4/.test(num)) return 'Visa';
  if (/^5[1-5]/.test(num)) return 'Mastercard';
  if (/^3[47]/.test(num)) return 'American Express';
  if (/^6(?:011|5)/.test(num)) return 'Discover';
  return 'Card';
};

export default function AddPaymentMethodModal({
  visible,
  onClose,
  onSubmit,
  processing
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (method: any) => void;
  processing: boolean;
}) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const highlightColor = useThemeColor({}, 'highlight');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const inputBackgroundColor = useThemeColor({}, 'inputBackground');
  const errorBackgroundColor = useThemeColor({}, 'errorBackground');

  useEffect(() => {
    const validateForm = () => {
      const newErrors: Record<string, string> = {};
      const cleanedCard = cardNumber.replace(/\s+/g, '');

      if (!cleanedCard.startsWith('558')) {
        newErrors.cardNumber = 'For testing, use cards starting with 558';
      } else if (!validateCardNumber(cleanedCard)) {
        newErrors.cardNumber = 'Invalid card number';
      }

      const formattedExpiry = formatExpiry(expiry);
      if (!validateExpiry(formattedExpiry)) {
        newErrors.expiry = 'Invalid expiry date (MM/YY)';
      }

      if (!validateCVC(cvc)) {
        newErrors.cvc = 'Invalid security code';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    setIsFormValid(validateForm());
  }, [cardNumber, expiry, cvc]);

  const handleSubmit = async () => {
    if (!isFormValid) return;

    try {
      const [month, year] = formatExpiry(expiry).split('/').map(Number);
      const cardDetails = {
        number: cardNumber.replace(/\s+/g, ''),
        exp_month: month,
        exp_year: 2000 + year,
        cvc,
        brand: getCardBrand(cardNumber),
        lastFour: cardNumber.replace(/\s+/g, '').slice(-4)
      };

      onSubmit({
        type: 'card',
        isDefault: false,
        cardDetails
      });
      
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to add payment method');
    }
  };

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    container: {
      backgroundColor: surfaceColor,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: '90%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: textColor,
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: textColor,
      marginBottom: 8,
    },
    input: {
      backgroundColor: inputBackgroundColor,
      borderWidth: 1,
      borderColor: borderColor,
      borderRadius: 8,
      padding: 14,
      fontSize: 16,
      color: textColor,
    },
    inputError: {
      borderColor: 'red',
      backgroundColor: errorBackgroundColor,
    },
    errorText: {
      color: 'red',
      fontSize: 12,
      marginTop: 4,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    button: {
      backgroundColor: highlightColor,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 16,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <TouchableOpacity 
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Add Card</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Card Number</Text>
              <TextInput
                style={[styles.input, errors.cardNumber && styles.inputError]}
                placeholder="5588 2222 3333 4444"
                placeholderTextColor={placeholderColor}
                value={formatCardNumber(cardNumber)}
                onChangeText={text => {
                  const cleaned = text.replace(/\D/g, '').slice(0, 19);
                  setCardNumber(cleaned);
                }}
                keyboardType="number-pad"
                maxLength={23}
                editable={!processing}
              />
              {errors.cardNumber && (
                <Text style={styles.errorText}>{errors.cardNumber}</Text>
              )}
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Expiration Date</Text>
                <TextInput
                  style={[styles.input, errors.expiry && styles.inputError]}
                  placeholder="MM/YY"
                  placeholderTextColor={placeholderColor}
                  value={formatExpiry(expiry)}
                  onChangeText={text => setExpiry(text.replace(/\D/g, ''))}
                  keyboardType="number-pad"
                  maxLength={5}
                  editable={!processing}
                />
                {errors.expiry && (
                  <Text style={styles.errorText}>{errors.expiry}</Text>
                )}
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Security Code</Text>
                <TextInput
                  style={[styles.input, errors.cvc && styles.inputError]}
                  placeholder="CVC"
                  placeholderTextColor={placeholderColor}
                  value={cvc}
                  onChangeText={text => setCvc(text.replace(/\D/g, ''))}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  editable={!processing}
                />
                {errors.cvc && (
                  <Text style={styles.errorText}>{errors.cvc}</Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, (!isFormValid || processing) && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!isFormValid || processing}
              activeOpacity={0.8}
            >
              {processing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Add Card</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}