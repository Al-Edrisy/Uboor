import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Image,
  Modal,
  TouchableWithoutFeedback,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { auth, storage, db } from '../../../lib/firebase';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/components/Themed';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export default function EditProfileModal() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [profileImage, setProfileImage] = useState(user?.photoURL || '');
  const [bgImage, setBgImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<'profile' | 'background' | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const highlightColor = useThemeColor({}, 'highlight');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  // Load user data from Firestore
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.uid) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'Users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setBgImage(userData?.bgImage || '');
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, [user]);

  const handleImageUpload = async (type: 'profile' | 'background') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photos to upload images.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'profile' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      setUploadingImage(type);
      const manipulated = await manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: type === 'profile' ? 500 : 1200 } }],
        { compress: 0.7, format: SaveFormat.JPEG }
      );

      // Delete old image if exists
      if (type === 'profile' && profileImage) {
        try {
          const oldRef = ref(storage, profileImage);
          await deleteObject(oldRef);
        } catch (error) {
          console.log("No existing profile image to delete");
        }
      } else if (bgImage) {
        try {
          const oldRef = ref(storage, bgImage);
          await deleteObject(oldRef);
        } catch (error) {
          console.log("No existing background image to delete");
        }
      }

      // Upload new image
      const storageRef = ref(storage, `users/${user?.uid}/${type}-${Date.now()}.jpg`);
      const response = await fetch(manipulated.uri);
      const blob = await response.blob();
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // Update state and database
      if (type === 'profile') {
        await updateProfile(auth.currentUser!, { photoURL: downloadURL });
        setProfileImage(downloadURL);
      } else {
        await updateDoc(doc(db, 'Users', user?.uid!), { 
          bgImage: downloadURL 
        });
        setBgImage(downloadURL);
      }
    } catch (error) {
      Alert.alert('Upload Error', error.message);
    } finally {
      setUploadingImage(null);
    }
  };

  const handleRemoveImage = async (type: 'profile' | 'background') => {
    try {
      if (type === 'profile') {
        if (!profileImage) return;
        
        // Delete from storage
        const oldRef = ref(storage, profileImage);
        await deleteObject(oldRef);
        
        // Update auth and state
        await updateProfile(auth.currentUser!, { photoURL: null });
        setProfileImage('');
      } else {
        if (!bgImage) return;
        
        // Delete from storage
        const oldRef = ref(storage, bgImage);
        await deleteObject(oldRef);
        
        // Update firestore and state
        await updateDoc(doc(db, 'Users', user?.uid!), { bgImage: null });
        setBgImage('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to remove image');
    } finally {
      setModalVisible(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      await updateProfile(auth.currentUser!, { displayName });
      await updateDoc(doc(db, 'Users', user.uid), { displayName });
      await refreshUser();
      router.back();
    } catch (error) {
      Alert.alert('Update Failed', error.message);
    } finally {
      setIsLoading(false);
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
          <Text style={[styles.title, { color: textColor }]}>Edit Profile</Text>
          <Pressable onPress={() => router.back()}>
            <Feather name="x" size={24} color={textColor} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profile Image Section */}
          <View style={styles.avatarWrapper}>
            <Pressable 
              onPress={() => setModalVisible(true)}
              style={styles.avatarPressable}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: highlightColor }]}>
                  <Text style={styles.avatarText}>
                    {displayName.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              <View style={styles.cameraOverlay}>
                {uploadingImage === 'profile' ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Feather name="camera" size={20} color="white" />
                )}
              </View>
            </Pressable>
            
            <Pressable 
              onPress={() => setModalVisible(true)}
              style={styles.imageOptionsButton}
            >
              <Text style={[styles.imageOptionsText, { color: highlightColor }]}>
                {profileImage ? 'Change Photo' : 'Add Photo'}
              </Text>
            </Pressable>
          </View>

          {/* Background Image Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Background Image</Text>
            <Pressable 
              onPress={() => handleImageUpload('background')}
              style={[
                styles.bgImageContainer,
                { borderColor: borderColor, backgroundColor: `${highlightColor}10` }
              ]}
            >
              {bgImage ? (
                <Image source={{ uri: bgImage }} style={styles.bgImage} />
              ) : (
                <View style={styles.bgImagePlaceholder}>
                  {uploadingImage === 'background' ? (
                    <ActivityIndicator color={highlightColor} />
                  ) : (
                    <>
                      <Feather name="image" size={32} color={highlightColor} />
                      <Text style={[styles.bgImageText, { color: highlightColor }]}>
                        Add Background Image
                      </Text>
                    </>
                  )}
                </View>
              )}
            </Pressable>
            
            {bgImage && (
              <Pressable 
                onPress={() => handleRemoveImage('background')}
                style={styles.removeImageButton}
              >
                <Text style={[styles.removeImageText, { color: 'red' }]}>
                  Remove Background
                </Text>
              </Pressable>
            )}
          </View>

          {/* Display Name Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Display Name</Text>
            <View style={styles.inputGroup}>
              <Feather name="user" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: textColor, 
                    borderColor: borderColor,
                    backgroundColor: surfaceColor
                  }
                ]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your name"
                placeholderTextColor="#999"
                maxLength={30}
              />
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            {
              backgroundColor: pressed ? `${highlightColor}90` : highlightColor,
              opacity: isLoading ? 0.7 : 1,
            },
          ]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.saveButtonText}>Save Changes</Text>
              <Feather name="check" size={20} color="white" style={{ marginLeft: 8 }} />
            </>
          )}
        </Pressable>

        {/* Image Options Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          
          <View style={[styles.actionSheet, { backgroundColor: surfaceColor }]}>
            <Pressable 
              style={styles.actionButton}
              onPress={() => {
                setModalVisible(false);
                handleImageUpload('profile');
              }}
            >
              <Text style={[styles.actionText, { color: textColor }]}>Take Photo</Text>
            </Pressable>
            
            <Pressable 
              style={styles.actionButton}
              onPress={() => {
                setModalVisible(false);
                handleImageUpload('profile');
              }}
            >
              <Text style={[styles.actionText, { color: textColor }]}>Choose from Library</Text>
            </Pressable>
            
            {profileImage && (
              <Pressable 
                style={styles.actionButton}
                onPress={() => {
                  setModalVisible(false);
                  handleRemoveImage('profile');
                }}
              >
                <Text style={[styles.actionText, { color: 'red' }]}>Remove Photo</Text>
              </Pressable>
            )}
            
            <Pressable 
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.cancelText, { color: textColor }]}>Cancel</Text>
            </Pressable>
          </View>
        </Modal>
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
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarPressable: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOptionsButton: {
    marginTop: 10,
  },
  imageOptionsText: {
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  bgImageContainer: {
    height: 150,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
  bgImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  bgImageText: {
    marginTop: 10,
    fontSize: 14,
  },
  removeImageButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  removeImageText: {
    fontSize: 14,
  },
  inputGroup: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: 15,
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingLeft: 45,
    paddingRight: 15,
    fontSize: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  actionSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  actionButton: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  actionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 16,
    marginTop: 10,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});