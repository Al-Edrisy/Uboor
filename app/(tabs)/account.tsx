import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { signOut, updateProfile } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useThemeColor } from '@/components/Themed';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FontAwesome5,
  MaterialIcons,
  Feather,
  Ionicons,
  AntDesign,
} from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

type ImageType = 'profile' | 'background';
const fallbackImage = 'https://example.com/fallback.jpg';

const AccountScreen: React.FC = () => {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [bgImageUri, setBgImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showBenefits, setShowBenefits] = useState<boolean>(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const highlightColor = useThemeColor({}, 'highlight');
  const borderColor = useThemeColor({}, 'border');
  const buttonColor = useThemeColor({}, 'button');
  const buttonTextColor = useThemeColor({}, 'buttonText');

  // Load images when screen focuses or user changes
  useFocusEffect(
    useCallback(() => {
      const loadImages = async () => {
        try {
          const [profileUrl, bgUrl] = await Promise.all([
            AsyncStorage.getItem('user_profile_image'),
            AsyncStorage.getItem('user_bg_image'),
          ]);
          
          // Check if files still exist before setting them
          if (profileUrl) {
            const fileInfo = await FileSystem.getInfoAsync(profileUrl);
            if (fileInfo.exists) setLocalImageUri(profileUrl);
          }
          
          if (bgUrl) {
            const fileInfo = await FileSystem.getInfoAsync(bgUrl);
            if (fileInfo.exists) setBgImageUri(bgUrl);
          }
        } catch (error) {
          console.error('Error loading user images:', error);
        }
      };

      if (user) {
        loadImages();
      } else {
        setLocalImageUri(null);
        setBgImageUri(null);
      }
    }, [user])
  );

  const handleImageUpload = async (type: ImageType) => {
    if (!user) {
      router.push('./../modals/auth');
      return;
    }

    setIsLoading(true);
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
        allowsEditing: type === 'profile',
        aspect: type === 'profile' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      const manipulated = await manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: type === 'profile' ? 500 : 1200 } }],
        { compress: 0.7, format: SaveFormat.JPEG }
      );

      // Generate unique filename
      const timestamp = new Date().getTime();
      const fileName = `${type}_${timestamp}.jpg`;
      const newUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.copyAsync({
        from: manipulated.uri,
        to: newUri,
      });

      await AsyncStorage.setItem(`user_${type}_image`, newUri);

      if (type === 'profile') {
        await updateProfile(auth.currentUser!, { photoURL: newUri });
        await refreshUser();
        setLocalImageUri(newUri);
      } else {
        setBgImageUri(newUri);
      }
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              // Clean up stored images
              const [profileUri, bgUri] = await Promise.all([
                AsyncStorage.getItem('user_profile_image'),
                AsyncStorage.getItem('user_bg_image'),
              ]);
              
              const deleteOperations = [];
              if (profileUri) {
                deleteOperations.push(FileSystem.deleteAsync(profileUri, { idempotent: true }));
              }
              if (bgUri) {
                deleteOperations.push(FileSystem.deleteAsync(bgUri, { idempotent: true }));
              }
              
              await Promise.all([
                ...deleteOperations,
                AsyncStorage.multiRemove(['user_profile_image', 'user_bg_image']),
                signOut(auth),
              ]);
              router.replace('/');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to complete logout. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const accountOptions = [
    {
      title: 'Personal Information',
      icon: <Feather name="user" size={24} color={highlightColor} />,
      onPress: () => router.push('../modals/account/personal-info/modal'),
    },
    {
      title: 'Payment Methods',
      icon: <FontAwesome5 name="credit-card" size={22} color={highlightColor} />,
      onPress: () => router.push('../modals/account/payment-methods/modal'),
    },
    {
      title: 'Booking History',
      icon: <Ionicons name="receipt-outline" size={24} color={highlightColor} />,
      onPress: () => router.push('../account/bookings/modal'),
      
    },
    {
      title: 'Notifications',
      icon: <Ionicons name="notifications-outline" size={24} color={highlightColor} />,
      onPress: () => router.push('../account/notifications/modal'),
    },
    {
      title: 'Help Center',
      icon: <AntDesign name="questioncircleo" size={22} color={highlightColor} />,
      onPress: () => router.push('../account/help/modal'),
    },
    {
      title: 'About App',
      icon: <MaterialIcons name="info-outline" size={24} color={highlightColor} />,
      onPress: () => router.push('../account/about/about'),
    },
  ];

  const GuestView: React.FC = () => {
    return (
      <View style={[styles.guestContainer, { backgroundColor: surfaceColor }]}>
        <View style={styles.illustrationContainer}>
          <Ionicons
            name="person-circle-outline"
            size={120}
            color={highlightColor}
            style={styles.illustrationIcon}
          />
          <View style={[styles.illustrationCircle, { borderColor: highlightColor }]} />
          <View style={[styles.illustrationCircleSmall, { borderColor: highlightColor }]} />
        </View>
        <Text style={[styles.guestTitle, { color: textColor }]}>
          Join Our Travel Community
        </Text>
        <Text style={[styles.guestSubtitle, { color: textColor }]}>
          Sign in to unlock these benefits:
        </Text>
        <View style={styles.guestFeatures}>
          {[
            { icon: 'bookmark', text: 'Save and organize your trips' },
            { icon: 'notifications', text: 'Get personalized price alerts' },
            { icon: 'payment', text: 'Faster checkout experience' },
          ].map((item, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: `${highlightColor}20` }]}>
                <Ionicons name={item.icon} size={18} color={highlightColor} />
              </View>
              <Text style={[styles.featureText, { color: textColor }]}>
                {item.text}
              </Text>
            </View>
          ))}
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.authButton,
            {
              backgroundColor: pressed ? `${highlightColor}90` : buttonColor,
              shadowColor: highlightColor,
              shadowOpacity: pressed ? 0 : 0.3,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
          onPress={() => router.push('/modals/auth/modal')}
        >
          <Text style={[styles.authButtonText, { color: buttonTextColor }]}>
            Sign In / Register
          </Text>
          <Feather
            name="arrow-right"
            size={20}
            color={buttonTextColor}
            style={styles.authButtonIcon}
          />
        </Pressable>
        <Pressable
          onPress={() => setShowBenefits(!showBenefits)}
          style={styles.moreInfoButton}
        >
          <Text style={[styles.moreInfoText, { color: highlightColor }]}>
            {showBenefits ? 'Hide benefits' : 'More benefits'}
          </Text>
          <Feather
            name={showBenefits ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={highlightColor}
          />
        </Pressable>
        {showBenefits && (
          <View style={styles.additionalBenefits}>
            {[
              { icon: 'star', text: 'Exclusive member discounts' },
              { icon: 'share-2', text: 'Share trips with friends' },
            ].map((item, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: `${highlightColor}20` }]}>
                  <Feather name={item.icon} size={18} color={highlightColor} />
                </View>
                <Text style={[styles.featureText, { color: textColor }]}>
                  {item.text}
                </Text>
              </View>
            ))}
          </View>
        )}
        <Pressable
          onPress={() => router.push('../modals/auth?mode=guest')}
          style={styles.guestContinueButton}
        >
          <Text style={[styles.guestContinueText, { color: highlightColor }]}>
            Continue as guest
          </Text>
        </Pressable>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={highlightColor} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {user ? (
        <>
          <View style={styles.profileHeader}>
            <Pressable
              style={styles.backgroundImageContainer}
              onPress={() => handleImageUpload('background')}
            >
              {bgImageUri ? (
                <Image
                  source={{ uri: bgImageUri }}
                  style={styles.backgroundImage}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.backgroundPlaceholder,
                    { backgroundColor: highlightColor },
                  ]}
                />
              )}
              <View style={styles.backgroundOverlay}>
                <Feather name="camera" size={16} color="white" />
                <Text style={styles.backgroundText}>Change background</Text>
              </View>
            </Pressable>
            <View style={styles.profileContent}>
              <Pressable
                style={styles.avatarContainer}
                onPress={() => handleImageUpload('profile')}
              >
                {localImageUri || user?.photoURL ? (
                  <Image
                    source={{
                      uri: localImageUri ?? (user.photoURL || fallbackImage),
                    }}
                    style={styles.avatar}
                  />
                ) : (
                  <View
                    style={[
                      styles.avatarPlaceholder,
                      { backgroundColor: highlightColor },
                    ]}
                  >
                    <Text style={styles.avatarText}>
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
                <View style={styles.avatarEditBadge}>
                  <Feather name="edit-3" size={14} color="white" />
                </View>
              </Pressable>
              <Text style={[styles.userName, { color: textColor }]}>
                {user?.displayName || 'Traveler'}
              </Text>
              <Text style={[styles.userEmail, { color: textColor }]}>
                {user?.email || 'guest@example.com'}
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.editButton,
                  {
                    backgroundColor: pressed
                      ? `${highlightColor}20`
                      : `${highlightColor}10`,
                    borderColor: highlightColor,
                  },
                ]}
                onPress={() => router.push('/modals/account/edit-profile/modal')}
              >
                <Text style={[styles.editButtonText, { color: highlightColor }]}>
                  Edit Profile
                </Text>
              </Pressable>
            </View>
          </View>
          
          <View style={[styles.section, { backgroundColor: surfaceColor }]}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="color-lens" size={24} color={highlightColor} />
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Appearance
              </Text>
            </View>
            <View style={styles.themeToggleContainer}>
              <Text style={[styles.themeText, { color: textColor }]}>
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </Text>
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                thumbColor={theme === 'dark' ? highlightColor : surfaceColor}
                trackColor={{
                  false: borderColor,
                  true: `${highlightColor}50`,
                }}
              />
            </View>
          </View>
          
          <View style={[styles.section, { backgroundColor: surfaceColor }]}>
            <View style={styles.sectionHeader}>
              <Feather name="settings" size={24} color={highlightColor} />
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Account Settings
              </Text>
            </View>
            {accountOptions.map((option, index) => (
              <Pressable
                key={option.title}
                style={({ pressed }) => [
                  styles.optionItem,
                  {
                    borderBottomWidth:
                      index === accountOptions.length - 1
                        ? 0
                        : StyleSheet.hairlineWidth,
                    borderBottomColor: borderColor,
                    backgroundColor: pressed
                      ? `${highlightColor}10`
                      : 'transparent',
                  },
                ]}
                onPress={option.onPress}
              >
                <View style={styles.optionIcon}>{option.icon}</View>
                <Text style={[styles.optionText, { color: textColor }]}>
                  {option.title}
                </Text>
                <MaterialIcons
                  name="keyboard-arrow-right"
                  size={24}
                  color={`${textColor}80`}
                />
              </Pressable>
            ))}
          </View>
          
          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              {
                backgroundColor: pressed
                  ? `${highlightColor}10`
                  : 'transparent',
                borderColor: highlightColor,
              },
            ]}
            onPress={handleLogout}
          >
            <Text style={[styles.logoutButtonText, { color: highlightColor }]}>
              Logout
            </Text>
          </Pressable>
        </>
      ) : (
        <GuestView />
      )}
      
      <Text style={[styles.versionText, { color: textColor, opacity: 0.6 }]}>
        {Platform.OS === 'ios' ? 'iOS' : 'Android'} v1.0.0
      </Text>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 60,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 2,
    backgroundColor: 'transparent',
  },
  backgroundImageContainer: {
    height: 180,
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundPlaceholder: {
    flex: 1,
    opacity: 0.6,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  backgroundText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  profileContent: {
    alignItems: 'center',
    marginTop: -60,
    paddingBottom: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    backgroundColor: 'white',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#007AFF',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 16,
  },
  editButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 8,
  },
  editButtonText: {
    fontSize: 10,
    fontWeight: '500',
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  themeText: {
    fontSize: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: -8,
  },
  optionIcon: {
    width: 40,
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
  },
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    marginVertical: 16,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 20,
  },
  guestContainer: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  illustrationContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  illustrationIcon: {
    zIndex: 2,
    position: 'relative',
  },
  illustrationCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    top: -10,
    left: -10,
    opacity: 0.3,
  },
  illustrationCircleSmall: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    top: -20,
    left: -20,
    opacity: 0.1,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  guestFeatures: {
    width: '100%',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: '100%',
    marginBottom: 16,
    gap: 8,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  authButtonIcon: {
    marginTop: 2,
  },
  moreInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginBottom: 8,
  },
  moreInfoText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  additionalBenefits: {
    width: '100%',
    marginBottom: 16,
  },
  guestContinueButton: {
    padding: 12,
  },
  guestContinueText: {
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default AccountScreen;