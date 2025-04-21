import { FontAwesome, MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTheme } from './../context/ThemeContext';
import { useThemeColor } from '@/components/Themed';
import { View, Text } from '@/components/Themed';
import { StyleSheet } from 'react-native';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: useThemeColor({}, 'tabIconSelected'),
        tabBarInactiveTintColor: useThemeColor({}, 'tabIconDefault'),
        tabBarStyle: {
          backgroundColor: useThemeColor({}, 'surface'),
          borderTopColor: useThemeColor({}, 'border'),
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 5,  
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.iconContainerActive : styles.iconContainer}>
              <FontAwesome 
                name="home" 
                size={24} 
                color={color} 
                style={focused ? { transform: [{ scale: 1.1 }] } : null}
              />
              {focused && <View style={[styles.activeIndicator, { backgroundColor: color }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.iconContainerActive : styles.iconContainer}>
              <FontAwesome 
                name="search" 
                size={22} 
                color={color} 
                style={focused ? { transform: [{ scale: 1.1 }] } : null}
              />
              {focused && <View style={[styles.activeIndicator, { backgroundColor: color }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.iconContainerActive : styles.iconContainer}>
              <Ionicons 
                name="airplane"  
                size={24} 
                color={color} 
                style={focused ? { transform: [{ scale: 1.1 }] } : null}
              />
              {focused && <View style={[styles.activeIndicator, { backgroundColor: color }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.iconContainerActive : styles.iconContainer}>
              <MaterialIcons 
                name="message" 
                size={24} 
                color={color} 
                style={focused ? { transform: [{ scale: 1.1 }] } : null}
              />
              {focused && <View style={[styles.activeIndicator, { backgroundColor: color }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.iconContainerActive : styles.iconContainer}>
              <Feather 
                name="user" 
                size={24} 
                color={color} 
                style={focused ? { transform: [{ scale: 1.1 }] } : null}
              />
              {focused && <View style={[styles.activeIndicator, { backgroundColor: color }]} />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    backgroundColor: 'transparent',
    
  },
  iconContainerActive: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  activeIndicator: {
shadowColor: '#000',  
  },
});