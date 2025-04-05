import React, { useState } from 'react';
import {
  ScrollView,
  Image,
  Pressable,
  Animated,
  Easing,
  FlatList,
  StyleSheet,
  Dimensions,
  Text,
  View,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/components/Themed';
import { useRouter } from 'expo-router'; // Import useRouter for navigation

const { width } = Dimensions.get('window');

export default function TabOneScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tabIconDefaultColor = useThemeColor({}, 'tabIconDefault');
  const tabIconSelectedColor = useThemeColor({}, 'tabIconSelected');

  const [selectedIcon, setSelectedIcon] = useState('hotel');
  const scaleValue = new Animated.Value(1);
  const router = useRouter(); // Initialize router

  const handleIconPress = (icon) => {
    setSelectedIcon(icon);
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.2,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to the respective screen based on the icon pressed
    switch (icon) {
      case 'hotel':
        router.push('./../screens/StaysScreen'); 
        break;
      case 'plane':
        router.push('./../screens/FlightsScreen'); 
        break;
      case 'car':
        router.push('./../screens/CarsScreen'); 
        break;
      case 'box':
        router.push('./../screens/PackagesScreen'); 
        break;
      case 'suitcase':
        router.push('./../screens/ThingsToDoScreen'); 
        break;
      default:
        break;
    }
  };

  const flightCards = [
    {
      id: '1',
      title: 'Get alerted if the flight price drops',
      description: 'Never miss a deal on your next trip.',
      icon: 'bell',
    },
    {
      id: '2',
      title: 'Earn rewards on top of airline miles',
      description: 'Double the rewards with every booking.',
      icon: 'gift',
    },
    {
      id: '3',
      title: 'Exclusive member-only deals',
      description: 'Save big with exclusive offers.',
      icon: 'star',
    },
  ];

  const vacationDeals = [
    {
      id: '1',
      image: 'https://storage.googleapis.com/a1aa/image/cvKZtdt4dV5fsWJH-Z5s92qm23-Yv1xVD3V_f1lhE-o.jpg',
      title: 'Green Valley Ranch Resort and Spa',
      location: 'Henderson',
      rating: '9.0/10 Wonderful (1,847 reviews)',
      price: '$973',
      originalPrice: '$1,300',
      discount: '25% off',
    },
    {
      id: '2',
      image: 'https://storage.googleapis.com/a1aa/image/AYwyQLFDOP0R7sb7_SOZ9dwMtP6MUPWHsqwAAYDq1nM.jpg',
      title: 'Suncoast Hotel and Casino',
      location: 'Las Vegas',
      rating: '9.0/10 Wonderful (1,847 reviews)',
      price: '$684',
      originalPrice: '$950',
      discount: '28% off',
    },
    {
      id: '3',
      image: 'https://storage.googleapis.com/a1aa/image/AYwyQLFDOP0R7sb7_SOZ9dwMtP6MUPWHsqwAAYDq1nM.jpg',
      title: 'Suncoast Hotel and Casino',
      location: 'Las Vegas',
      rating: '9.0/10 Wonderful (1,847 reviews)',
      price: '$684',
      originalPrice: '$950',
      discount: '28% off',
    },
  ];

  const renderFlightCard = ({ item }) => (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: '#E3F2FD', marginRight: 10, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <FontAwesome5 name={item.icon} size={24} color="#1976D2" />
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 8 }}>{item.title}</Text>
      <Text style={{ color: '#555', marginTop: 4 }}>{item.description}</Text>
    </Pressable>
  );

  const renderHotelDeal = ({ item }) => (
    <Pressable
      style={({ pressed }) => [
        styles.hotelCard,
        { width: 200, marginRight: 10, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <Image
        source={{ uri: item.image }}
        style={{ width: '100%', height: 120, borderRadius: 6 }}
        resizeMode="cover"
      />
      <View style={{ padding: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{item.title}</Text>
        <Text style={{ color: '#777', fontSize: 12 }}>{item.location}</Text>
        <Text style={{ color: '#777', fontSize: 12 }}>{item.rating}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.price}</Text>
          <Text style={{ textDecorationLine: 'line-through', marginLeft: 8, fontSize: 12 }}>{item.originalPrice}</Text>
        </View>
        <Text style={{ color: '#777', fontSize: 12, marginTop: 4 }}>{item.discount}</Text>
      </View>
    </Pressable>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor }} showsVerticalScrollIndicator={false}>
      <View style={{ maxWidth: width, marginHorizontal: 'auto', paddingBottom: 24, paddingTop: 70 }}>
        {/* Top Navigation */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, marginHorizontal: 10 }}>
          {['hotel', 'plane', 'car', 'box', 'suitcase'].map((icon, index) => (
            <Pressable key={icon} onPress={() => handleIconPress(icon)} accessibilityRole="button">
              <View style={{ alignItems: 'center' }}>
                <Animated.View style={{ transform: [{ scale: selectedIcon === icon ? scaleValue : 1 }] }}>
                  <FontAwesome5 name={icon} size={30} color={selectedIcon === icon ? tabIconSelectedColor : tabIconDefaultColor} />
                </Animated.View>
                <Text style={{ color: textColor, fontSize: 12, marginTop: 4 }}>
                  {['Stays', 'Flights', 'Cars', 'Packages', 'Things to do'][index]}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Sign In Section */}
        <LinearGradient
          colors={['#261FB3', '#161179']}
          style={[styles.card, { marginHorizontal: 20, padding: 16, marginTop: 10 }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 22 }}>
            <FontAwesome5 name="star" size={20} color="white" />
            <Text style={{ fontSize: 14, fontWeight: '600', marginLeft: 8, color: 'white' }}>
              Sign in to access One Key Member Prices
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => ({
              backgroundColor: pressed ? 'rgba(217, 222, 242, 0.96)' : 'white',
              paddingVertical: 8,
              borderRadius: 11,
            })}
            onPress={() => console.log('Sign in pressed')}
            accessibilityRole="button"
          >
            <Text style={{ color: '#000', textAlign: 'center', fontWeight: 'bold' }}>Sign in</Text>
          </Pressable>
        </LinearGradient>

        {/* No Vacation Sale Section */}
        <View style={[styles.card, { marginHorizontal: 20, padding: 0, overflow: 'hidden', marginTop: 15 }]}>
          <Image
            source={{ uri:'https://placehold.co/600x400' }}
            style={{width: '100%',height: 200 }}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgb(19, 4, 156)', 'rgba(0, 91, 237, 1)', 'transparent']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <View style={{ position: 'absolute', left: 16, bottom: 16, right: 16 }}>
            <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold', textShadowColor: 'rgba(2, 2, 2, 0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
              No Vacation Sale
            </Text>
            <Text style={{ color: 'white', fontSize: 14, marginTop: 4, textShadowColor: 'rgba(21, 21, 21, 0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
              Book by Mar 31 for travel by Sep 8, 2025 to save
            </Text>
            <Pressable
              style={({ pressed }) => ({
                marginTop: 12,
                backgroundColor: pressed ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
              })}
              onPress={() => console.log('Learn More pressed')}
              accessibilityRole="button"
            >
              <Text style={{ color: '#000', fontWeight: 'bold' }}>Learn More</Text>
            </Pressable>
          </View>
        </View>

        {/* Hotel Deals Section */}
        <View style={{ marginTop: 16, marginHorizontal: 10 }}>
          <LinearGradient
            colors={['#160F30', '#261FB3', '#261FC3']}
            style={[styles.hotelContainer, { padding: 15, borderRadius: 8 }]}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
              Unknown Vacation Sale: Book by Mar 31
            </Text>
            <Text style={{ color: 'white', fontSize: 14, marginTop: 4 }}>
              Showing deals for May 16 - May 18
            </Text>
            <FlatList
              horizontal
              data={vacationDeals}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 16, paddingRight: 10 }}
              renderItem={renderHotelDeal}
              initialNumToRender={2}
            />
          </LinearGradient>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0.4,
    },
    shadowOpacity: 0.20,
    shadowRadius: 0.84,
    elevation: 5,
  },
  hotelContainer: {
    borderRadius: 8,
    marginHorizontal: 10,
  },
  hotelCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});