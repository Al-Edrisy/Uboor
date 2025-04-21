// screens/AccountScreen.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  ScrollView, 
  Switch,
  Image
} from 'react-native';
import { signOut } from 'firebase/auth';
import auth from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from './../context/ThemeContext';
import { FontAwesome5, MaterialIcons, Feather, Ionicons, AntDesign } from '@expo/vector-icons';
import { useThemeColor } from '@/components/Themed';

export default function AccountScreen() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const highlightColor = useThemeColor({}, 'highlight');
  const borderColor = useThemeColor({}, 'border');

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const accountOptions = [
    {
      title: 'Personal Information',
      icon: <Feather name="user" size={24} color={highlightColor} />,
      onPress: () => console.log('Personal Info pressed')
    },
    {
      title: 'Payment Methods',
      icon: <FontAwesome5 name="credit-card" size={22} color={highlightColor} />,
      onPress: () => console.log('Payment Methods pressed')
    },
    {
      title: 'Booking History',
      icon: <Ionicons name="ios-receipt-outline" size={24} color={highlightColor} />,
      onPress: () => console.log('Booking History pressed')
    },
    {
      title: 'Notifications',
      icon: <Ionicons name="notifications-outline" size={24} color={highlightColor} />,
      onPress: () => console.log('Notifications pressed')
    },
    {
      title: 'Help Center',
      icon: <AntDesign name="questioncircleo" size={22} color={highlightColor} />,
      onPress: () => console.log('Help Center pressed')
    },
    {
      title: 'About App',
      icon: <MaterialIcons name="info-outline" size={24} color={highlightColor} />,
      onPress: () => console.log('About App pressed')
    },
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* User Profile Section */}
      <View style={[styles.profileSection, { backgroundColor: surfaceColor }]}>
        <View style={styles.avatarContainer}>
          {user?.photoURL ? (
            <Image 
              source={{ uri: user.photoURL }} 
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: highlightColor }]}>
              <Text style={styles.avatarText}>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </View>
        
        <Text style={[styles.userEmail, { color: textColor }]}>
          {user?.email || 'guest@example.com'}
        </Text>
        
        <Pressable
          style={({ pressed }) => [
            styles.editButton,
            { 
              backgroundColor: pressed ? `${highlightColor}30` : `${highlightColor}20`,
              borderColor: highlightColor
            }
          ]}
          onPress={() => console.log('Edit Profile pressed')}
        >
          <Text style={[styles.editButtonText, { color: highlightColor }]}>
            Edit Profile
          </Text>
        </Pressable>
      </View>

      {/* Theme Toggle Section */}
      <View style={[styles.section, { backgroundColor: surfaceColor }]}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="color-lens" size={24} color={highlightColor} />
          <Text style={[styles.sectionTitle, { color: textColor }]}>Appearance</Text>
        </View>
        
        <View style={styles.themeToggleContainer}>
          <Text style={[styles.themeText, { color: textColor }]}>
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </Text>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            thumbColor={highlightColor}
            trackColor={{ false: '#767577', true: `${highlightColor}50` }}
          />
        </View>
      </View>

      {/* Account Options Section */}
      <View style={[styles.section, { backgroundColor: surfaceColor }]}>
        <View style={styles.sectionHeader}>
          <Feather name="settings" size={24} color={highlightColor} />
          <Text style={[styles.sectionTitle, { color: textColor }]}>Account Settings</Text>
        </View>
        
        {accountOptions.map((option, index) => (
          <Pressable
            key={option.title}
            style={({ pressed }) => [
              styles.optionItem,
              { 
                borderBottomWidth: index === accountOptions.length - 1 ? 0 : 1,
                borderBottomColor: borderColor,
                opacity: pressed ? 0.6 : 1
              }
            ]}
            onPress={option.onPress}
          >
            <View style={styles.optionIcon}>
              {option.icon}
            </View>
            <Text style={[styles.optionText, { color: textColor }]}>
              {option.title}
            </Text>
            <MaterialIcons 
              name="keyboard-arrow-right" 
              size={24} 
              color={textColor} 
            />
          </Pressable>
        ))}
      </View>

      {/* Logout Section */}
      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          { 
            backgroundColor: pressed ? '#ff444430' : '#ff444420',
            borderColor: '#ff4444'
          }
        ]}
        onPress={handleLogout}
      >
        <Text style={[styles.logoutButtonText, { color: '#ff4444' }]}>
          Logout
        </Text>
      </Pressable>

      {/* App Version */}
      <Text style={[styles.versionText, { color: textColor }]}>
        Travel App v1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  profileSection: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
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
    marginLeft: 10,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  themeText: {
    fontSize: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  optionIcon: {
    width: 30,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
  },
  logoutButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.6,
  },
});