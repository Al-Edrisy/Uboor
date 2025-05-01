import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { Feather } from '@expo/vector-icons';
import { useThemeColor } from '@/components/Themed';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import PhoneInput from 'react-native-phone-number-input';

type PersonalInfo = {
  phone: string;
  phoneCountryCode: string;
};

export default function PersonalInfoModal() {
  const router = useRouter();
  const { user } = useAuth();
  const [info, setInfo] = useState<PersonalInfo>({
    phone: '',
    phoneCountryCode: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phoneInput, setPhoneInput] = useState<PhoneInput | null>(null);
  const textColor = useThemeColor({}, 'text');
  const highlightColor = useThemeColor({}, 'highlight');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    const loadInfo = async () => {
      if (!user?.uid) return;
      try {
        const userDoc = await getDoc(doc(db, 'Users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.phone && userData.phoneCountryCode) {
            setInfo({
              phone: userData.phone,
              phoneCountryCode: userData.phoneCountryCode
            });
          }
        }
      } catch (error) {
        // Silently catch error, don't show to user
        console.error('Failed to load phone info:', error);
      } finally {
        setLoading(false);
      }
    };
    loadInfo();
  }, [user]);

  const handleSave = async () => {
    if (!user?.uid) return;
    
    try {
      setSaving(true);
      
      // Only update the phone number fields
      await updateDoc(doc(db, 'Users', user.uid), {
        phone: info.phone,
        phoneCountryCode: info.phoneCountryCode
      });
      
      Alert.alert('Success', 'Phone number updated successfully');
      router.back();
    } catch (error) {
      // Silently catch error, don't show to user
      console.error('Failed to save phone number:', error);
      Alert.alert('Error', 'Failed to update phone number');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (value: string, countryData: {dialCode: string}) => {
    try {
      // Attempt to update the phone info
      setInfo(prev => ({ 
        ...prev, 
        phone: value,
        phoneCountryCode: countryData.dialCode
      }));
    } catch (error) {
      // Silently catch any errors from the phone input library
      console.error('Phone input error:', error);
    }
  };

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
          <Text style={[styles.title, { color: textColor }]}>Update Phone Number</Text>
          <Pressable onPress={() => router.back()}>
            <Feather name="x" size={24} color={textColor} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {loading ? (
            <ActivityIndicator size="large" color={highlightColor} style={styles.loader} />
          ) : (
            <>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>Contact Information</Text>
                <View style={styles.inputGroup}>
                  <Feather name="mail" size={20} color="#888" style={styles.inputIcon} />
                  <TextInput
                    style={[
                      styles.readOnlyInput,
                      { color: `${textColor}80`, backgroundColor: `${highlightColor}10` }
                    ]}
                    value={user?.email || ''}
                    editable={false}
                    placeholder="Email"
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Feather name="phone" size={20} color="#888" style={styles.inputIcon} />
                  <PhoneInput
                    ref={ref => setPhoneInput(ref)}
                    defaultValue={info.phone}
                    defaultCode={info.phoneCountryCode || 'US'}
                    layout="first"
                    onChangeText={(value) => handleChange(value, { dialCode: info.phoneCountryCode })}
                    onChangeCountryCode={({ dialCode }) => handleChange(info.phone, { dialCode })}
                    containerStyle={[
                      styles.phoneInputContainer,
                      { backgroundColor: surfaceColor, borderColor: borderColor }
                    ]}
                    textContainerStyle={[
                      styles.phoneInputTextContainer,
                      { backgroundColor: surfaceColor }
                    ]}
                    textInputStyle={{ color: textColor }}
                    codeTextStyle={{ color: textColor }}
                    flagButtonStyle={{ backgroundColor: surfaceColor }}
                  />
                </View>
              </View>
              <Text style={[styles.disclaimer, { color: `${textColor}60` }]}>
                Updating your phone number helps us keep your account secure.
              </Text>
            </>
          )}
        </ScrollView>
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            {
              backgroundColor: pressed ? `${highlightColor}90` : highlightColor,
              opacity: saving ? 0.7 : 1,
            },
          ]}
          onPress={handleSave}
          disabled={saving || loading}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.saveButtonText}>Save Phone Number</Text>
              <Feather name="save" size={20} color="white" style={{ marginLeft: 8 }} />
            </>
          )}
        </Pressable>
      </View>
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
  scrollContent: {
    paddingBottom: 20,
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
  loader: {
    marginVertical: 40,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  inputGroup: {
    position: 'relative',
    marginBottom: 15,
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: 15,
    zIndex: 1,
  },
  readOnlyInput: {
    paddingLeft: 45,
    paddingVertical: 12,
    fontSize: 16,
    borderRadius: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingLeft: 45,
    paddingRight: 15,
    fontSize: 16,
  },
  phoneInputContainer: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 45,
  },
  phoneInputTextContainer: {
    borderRadius: 12,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});