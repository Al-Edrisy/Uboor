import React, { useState, useCallback, memo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/app/context/ThemeContext';
import { useThemeColor } from '@/components/Themed';
import { validateEmail, validateCardNumber, validatePaymentExpiry, validateCVC, getCardNumberForBackend } from '../utils/validationHelpers';
import { formatCardNumber, formatExpiry } from '../utils/formatters';
import { auth } from '../../../lib/firebase';
import { BASE_URL } from '@env';
import { Stack, useRouter } from 'expo-router';


interface PaymentModalProps {
  visible: boolean;
  amount: string;
  currency: string;
  onPaymentSuccess: (email: string, paymentId: string) => void;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = memo(({
  visible,
  amount,
  currency,
  onPaymentSuccess,
  onClose,
}) => {
  const { theme } = useTheme();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const highlightColor = useThemeColor({}, 'highlight');
  const dangerColor = useThemeColor({}, 'error');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const inputBackgroundColor = useThemeColor({}, 'inputBackground');
  const errorBackgroundColor = useThemeColor({}, 'errorBackground');
  const router = useRouter();

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [email, setEmail] = useState(auth.currentUser?.email || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  useEffect(() => {
    const isValid = validateForm();
    setIsFormValid(isValid);
  }, [cardNumber, expiry, cvc, email]);

  const resetForm = useCallback(() => {
    setCardNumber('');
    setExpiry('');
    setCvc('');
    setEmail(auth.currentUser?.email || '');
    setErrors({});
    setLoading(false);
    setIsFormValid(false);
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const cleanedCard = cardNumber.replace(/\s+/g, '');
    const formattedExpiry = formatExpiry(expiry);

    if (!cleanedCard.startsWith('558')) {
      newErrors.cardNumber = 'For testing, use cards starting with 558';
    } else if (cleanedCard.length < 15 || cleanedCard.length > 19) {
      newErrors.cardNumber = 'Card must be 15-19 digits';
    } else if (!validateCardNumber(cleanedCard)) {
      newErrors.cardNumber = 'Invalid card number';
    }

    if (!validatePaymentExpiry(formattedExpiry)) {
      newErrors.expiry = 'Invalid expiry date (MM/YY)';
    }

    if (!validateCVC(cvc)) {
      newErrors.cvc = 'Invalid security code';
    }

    if (!validateEmail(email.trim())) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [cardNumber, expiry, cvc, email]);

  const handlePayment = useCallback(async () => {
    if (!isFormValid) return;

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user){ throw new Error('User not authenticated');
  
      }

      const formattedExpiry = formatExpiry(expiry);
      const [monthStr, yearStr] = formattedExpiry.split('/');

      const paymentData = {
        amount: Math.round(parseFloat(amount) * 100),
        currency: currency.toLowerCase(),
        userId: user.uid,
        card: {
          number: getCardNumberForBackend(cardNumber),
          exp_month: parseInt(monthStr, 10),
          exp_year: parseInt(`20${yearStr}`, 10),
          cvc,
        },
        email: user.email || email.trim()
      };

      const response = await fetch(`${BASE_URL}/api/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Payment failed');
      }

      onPaymentSuccess(user.email || email.trim(), result.paymentId);

    } catch (error: any) {
      Alert.alert(
        'Payment Error', 
        error.message || 'Failed to process payment. Please check your details and try again.',
        [{ text: 'OK', onPress: () => setLoading(false) }]
      );
    } finally {
      setLoading(false);
    }
  }, [amount, currency, cardNumber, expiry, cvc, email, isFormValid, onPaymentSuccess]);

  const styles = StyleSheet.create({
    container: {
      paddingTop: 50,
      flex: 1,
      backgroundColor: backgroundColor,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: textColor,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    amountContainer: {
      alignItems: 'center',
      marginBottom: 24,
      padding: 16,
      backgroundColor: surfaceColor,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    amountLabel: {
      fontSize: 14,
      color: placeholderColor,
      marginBottom: 4,
    },
    amountText: {
      fontSize: 28,
      fontWeight: '700',
      color: highlightColor,
    },
    currencyText: {
      fontSize: 20,
      fontWeight: '600',
      color: placeholderColor,
    },
    cardContainer: {
      backgroundColor: surfaceColor,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: textColor,
      marginBottom: 16,
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
      backgroundColor: backgroundColor,
      borderWidth: 1,
      borderColor: borderColor,
      borderRadius: 8,
      padding: 14,
      fontSize: 16,
      color: textColor,
    },
    inputError: {
      borderColor: dangerColor,
      backgroundColor: errorBackgroundColor,
    },
    errorText: {
      color: dangerColor,
      fontSize: 12,
      marginTop: 4,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    payButton: {
      backgroundColor: highlightColor,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    payButtonDisabled: {
      opacity: 0.6,
    },
    payButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <MaterialIcons name="close" size={24} color={textColor} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Secure Payment</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Total Amount Due</Text>
              <Text style={styles.amountText}>
                {amount} <Text style={styles.currencyText}>{currency}</Text>
              </Text>
            </View>

            <View style={styles.cardContainer}>
              <Text style={styles.sectionTitle}>Payment Details</Text>

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
                  editable={!loading}
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
                    editable={!loading}
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
                    editable={!loading}
                  />
                  {errors.cvc && (
                    <Text style={styles.errorText}>{errors.cvc}</Text>
                  )}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Receipt Email</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="your@email.com"
                  placeholderTextColor={placeholderColor}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.payButton, (!isFormValid || loading) && styles.payButtonDisabled]}
              onPress={handlePayment}
              disabled={!isFormValid || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.payButtonText}>
                  Confirm Payment of {amount} {currency}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

export default PaymentModal;