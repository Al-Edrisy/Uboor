import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useThemeColor } from '@/components/Themed';
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import * as Keychain from 'react-native-keychain';
import AddPaymentMethodModal from './AddPaymentMethodModal';

type PaymentMethod = {
  id: string;
  type: 'card' | 'paypal' | 'applepay';
  details: {
    lastFour?: string;
    email?: string;
    cardBrand?: string;
    expiry?: string;
  };
  isDefault: boolean;
  token?: string;
};

const validateCardNumber = (number: string): boolean => {
  let sum = 0;
  const num = number.replace(/\D/g, '');
  if (num.length < 15 || num.length > 19) return false;
  
  for (let i = 0; i < num.length; i++) {
    let digit = parseInt(num[i], 10);
    if ((num.length - i) % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
};

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

const getCardBrand = (number: string): string => {
  const num = number.replace(/\D/g, '');
  if (/^4/.test(num)) return 'Visa';
  if (/^5[1-5]/.test(num)) return 'Mastercard';
  if (/^3[47]/.test(num)) return 'American Express';
  if (/^6(?:011|5)/.test(num)) return 'Discover';
  return 'Card';
};

export default function PaymentMethodsModal() {
  const router = useRouter();
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [processing, setProcessing] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const highlightColor = useThemeColor({}, 'highlight');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  const loadPaymentMethods = async () => {
    if (!user?.uid) return;
    
    try {
      // Load from Firestore
      const userDoc = await getDoc(doc(db, 'Users', user.uid));
      let methods = userDoc.exists() ? userDoc.data().paymentMethods || [] : [];
      
      // Try to load from secure storage
      try {
        const credentials = await Keychain.getGenericPassword({ service: 'payment_details' });
        if (credentials && credentials.username === user.uid) {
          const secureData = JSON.parse(credentials.password);
          
          // Check if this card already exists in methods
          const exists = methods.some(m => 
            m.type === 'card' && 
            m.details.lastFour === secureData.lastFour
          );
          
          if (!exists) {
            methods.push({
              id: `secure_${Date.now()}`,
              type: 'card',
              details: {
                lastFour: secureData.lastFour,
                cardBrand: secureData.brand,
                expiry: `${secureData.exp_month}/${secureData.exp_year.toString().slice(-2)}`
              },
              isDefault: methods.length === 0,
              token: credentials.password
            });
          }
        }
      } catch (keychainError) {
        console.log('Keychain access error:', keychainError);
      }
      
      setPaymentMethods(methods);
    } catch (error) {
      Alert.alert('Error', 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, [user]);

  const handleDelete = async (methodId: string) => {
    if (!user?.uid) return;
    
    Alert.alert(
      'Confirm Removal',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);
              const methodToRemove = paymentMethods.find(m => m.id === methodId);
              if (!methodToRemove) return;
              
              // Remove from Firestore
              await updateDoc(doc(db, 'Users', user.uid), {
                paymentMethods: arrayRemove(methodToRemove)
              });
              
              // If it's a secure card, try to remove from Keychain
              if (methodToRemove.token) {
                try {
                  await Keychain.resetGenericPassword({ service: 'payment_details' });
                } catch (keychainError) {
                  console.log('Keychain delete error:', keychainError);
                }
              }
              
              // If removing default, set another as default
              if (methodToRemove.isDefault && paymentMethods.length > 1) {
                const newDefault = paymentMethods.find(m => m.id !== methodId);
                if (newDefault) {
                  await updateDoc(doc(db, 'Users', user.uid), {
                    paymentMethods: arrayUnion({ ...newDefault, isDefault: true })
                  });
                }
              }
              
              setPaymentMethods(prev => prev.filter(m => m.id !== methodId));
            } catch (error) {
              Alert.alert('Error', 'Failed to remove payment method');
            } finally {
              setProcessing(false);
            }
          }
        }
      ]
    );
  };

  const handleSetDefault = async (methodId: string) => {
    if (!user?.uid) return;
    
    try {
      setProcessing(true);
      
      const updatedMethods = paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }));
      
      await updateDoc(doc(db, 'Users', user.uid), {
        paymentMethods: updatedMethods
      });
      
      setPaymentMethods(updatedMethods);
    } catch (error) {
      Alert.alert('Error', 'Failed to set default payment method');
    } finally {
      setProcessing(false);
    }
  };

  const handleAddMethod = async (newMethod: Omit<PaymentMethod, 'id'> & { cardDetails?: any }) => {
    if (!user?.uid) return;
    
    try {
      setProcessing(true);
      
      const methodId = `pm_${Date.now()}`;
      let methodToAdd = { ...newMethod, id: methodId };
      
      // If it's a card with secure details
      if (newMethod.type === 'card' && newMethod.cardDetails) {
        try {
          await Keychain.setGenericPassword(
            user.uid,
            JSON.stringify(newMethod.cardDetails),
            { 
              service: 'payment_details',
              accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY
            }
          );
          
          methodToAdd = {
            ...methodToAdd,
            token: JSON.stringify(newMethod.cardDetails),
            details: {
              lastFour: newMethod.cardDetails.number.slice(-4),
              cardBrand: getCardBrand(newMethod.cardDetails.number),
              expiry: `${newMethod.cardDetails.exp_month}/${newMethod.cardDetails.exp_year.toString().slice(-2)}`
            }
          };
        } catch (keychainError) {
          console.log('Keychain save failed:', keychainError);
          // Fallback to storing just the minimal details
          methodToAdd = {
            ...methodToAdd,
            details: {
              lastFour: newMethod.cardDetails.number.slice(-4),
              cardBrand: getCardBrand(newMethod.cardDetails.number),
              expiry: `${newMethod.cardDetails.exp_month}/${newMethod.cardDetails.exp_year.toString().slice(-2)}`
            }
          };
        }
      }
      
      const shouldBeDefault = paymentMethods.length === 0 || newMethod.isDefault;
      const finalMethod = { ...methodToAdd, isDefault: shouldBeDefault };
      
      let updatedMethods = [...paymentMethods];
      if (shouldBeDefault) {
        updatedMethods = updatedMethods.map(m => ({ ...m, isDefault: false }));
      }
      
      updatedMethods.push(finalMethod);
      
      await updateDoc(doc(db, 'Users', user.uid), {
        paymentMethods: updatedMethods
      });
      
      setPaymentMethods(updatedMethods);
      setAddModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add payment method');
    } finally {
      setProcessing(false);
    }
  };

  const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => (
    <View style={[styles.methodContainer, { backgroundColor: surfaceColor }]}>
      <View style={styles.methodLeft}>
        <View style={styles.methodIcon}>
          {item.type === 'card' && (
            <MaterialIcons 
              name="credit-card" 
              size={28} 
              color={item.isDefault ? highlightColor : textColor} 
            />
          )}
          {item.type === 'paypal' && (
            <FontAwesome5 
              name="paypal" 
              size={28} 
              color={item.isDefault ? highlightColor : textColor} 
            />
          )}
          {item.type === 'applepay' && (
            <FontAwesome5 
              name="apple" 
              size={28} 
              color={item.isDefault ? highlightColor : textColor} 
            />
          )}
        </View>
        
        <View style={styles.methodInfo}>
          <Text style={[
            styles.methodTitle, 
            { color: item.isDefault ? highlightColor : textColor }
          ]}>
            {item.type === 'card' ? 
              `${item.details.cardBrand || 'Card'} •••• ${item.details.lastFour}` : 
             item.type === 'paypal' ? 'PayPal' : 'Apple Pay'}
            {item.isDefault && ' (Default)'}
          </Text>
          
          {item.type === 'card' && item.details.expiry && (
            <Text style={[styles.methodDetail, { color: textColor }]}>
              Expires {item.details.expiry}
            </Text>
          )}
          
          {item.type === 'paypal' && item.details.email && (
            <Text style={[styles.methodDetail, { color: textColor }]}>
              {item.details.email}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.methodActions}>
        {!item.isDefault && (
          <Pressable
            onPress={() => handleSetDefault(item.id)}
            style={styles.defaultButton}
          >
            <Text style={[styles.defaultText, { color: highlightColor }]}>
              Set Default
            </Text>
          </Pressable>
        )}
        
        <Pressable
          onPress={() => handleDelete(item.id)}
          disabled={processing}
        >
          <Feather 
            name="trash-2" 
            size={20} 
            color={textColor} 
            style={{ opacity: processing ? 0.5 : 1 }}
          />
        </Pressable>
      </View>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={() => router.back()}
    >
      <TouchableWithoutFeedback onPress={() => router.back()}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      
      <View style={[styles.modalContainer, { backgroundColor: surfaceColor }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Payment Methods</Text>
          <Pressable onPress={() => router.back()}>
            <Feather name="x" size={24} color={textColor} />
          </Pressable>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={highlightColor} />
          </View>
        ) : (
          <FlatList
            data={paymentMethods}
            renderItem={renderPaymentMethod}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="credit-card" size={48} color={borderColor} />
                <Text style={[styles.emptyText, { color: textColor }]}>
                  No payment methods added
                </Text>
              </View>
            }
          />
        )}
        
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            { 
              backgroundColor: pressed ? `${highlightColor}20` : `${highlightColor}10`,
              borderColor: highlightColor
            }
          ]}
          onPress={() => setAddModalVisible(true)}
          disabled={processing}
        >
          <Feather 
            name="plus" 
            size={24} 
            color={highlightColor} 
            style={{ opacity: processing ? 0.5 : 1 }}
          />
          <Text style={[styles.addButtonText, { color: highlightColor }]}>
            Add Payment Method
          </Text>
        </Pressable>
      </View>
      
      <AddPaymentMethodModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSubmit={handleAddMethod}
        processing={processing}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
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
    fontSize: 22,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  methodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  methodDetail: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  methodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  defaultButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  defaultText: {
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});