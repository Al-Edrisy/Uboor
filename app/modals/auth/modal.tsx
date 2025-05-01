import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useThemeColor } from '@/components/Themed';
import { useState } from 'react';
import SignInModal from './SignInModal';
import SignUpModal from './SignUpModal';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function AuthModal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot'>('signin');
  
  const textColor = useThemeColor({}, 'text');
  const highlightColor = useThemeColor({}, 'highlight');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ 
        title: activeTab === 'signin' ? 'Sign In' : 
              activeTab === 'signup' ? 'Create Account' : 'Reset Password',
        headerShown: true,
      }} />
      
      <View style={[styles.tabsContainer, { borderBottomColor: borderColor }]}>
        <Pressable
          onPress={() => setActiveTab('signin')}
          style={[styles.tab, activeTab === 'signin' && styles.activeTab]}
        >
          <Text style={[
            styles.tabText, 
            { color: textColor },
            activeTab === 'signin' && { color: highlightColor }
          ]}>
            Sign In
          </Text>
          {activeTab === 'signin' && (
            <View style={[styles.activeTabIndicator, { backgroundColor: highlightColor }]} />
          )}
        </Pressable>
        
        <Pressable
          onPress={() => setActiveTab('signup')}
          style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
        >
          <Text style={[
            styles.tabText, 
            { color: textColor },
            activeTab === 'signup' && { color: highlightColor }
          ]}>
            Sign Up
          </Text>
          {activeTab === 'signup' && (
            <View style={[styles.activeTabIndicator, { backgroundColor: highlightColor }]} />
          )}
        </Pressable>
      </View>
      
      {activeTab === 'signin' && (
        <SignInModal 
          onForgotPassword={() => setActiveTab('forgot')}
          onSuccess={() => router.back()}
        />
      )}
      
      {activeTab === 'signup' && (
        <SignUpModal 
          onSuccess={() => router.back()}
        />
      )}
      
      {activeTab === 'forgot' && (
        <ForgotPasswordModal 
          onBack={() => setActiveTab('signin')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    position: 'relative',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    height: 2,
    width: '100%',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
});