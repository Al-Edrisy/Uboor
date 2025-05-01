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
  SafeAreaView,
} from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View, Button } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useTheme } from './../context/ThemeContext';
import { useThemeColor } from '@/components/Themed';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const FEATURE_CARD_WIDTH = 220;
const SECTION_SPACING = 24;

export default function index() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const highlightColor = useThemeColor({}, 'highlight');
  const tabIconDefaultColor = useThemeColor({}, 'tabIconDefault');
  const tabIconSelectedColor = useThemeColor({}, 'tabIconSelected');
  const secondaryColor = useThemeColor({}, 'secondary');
  const paragraphColor = useThemeColor({}, 'paragraph');
  const borderColor = useThemeColor({}, 'border');
  const headlineColor = useThemeColor({}, 'headline');
    const buttonColor = useThemeColor({}, 'button');
    const buttonTextColor = useThemeColor({}, 'buttonText');

  const [selectedIcon, setSelectedIcon] = useState('hotel');
  const scaleValue = new Animated.Value(1);
  const router = useRouter();

  const handleIconPress = (icon: string) => {
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

  const travelFeatures = [
    {
      id: '1',
      title: 'Price Drop Alerts',
      description: 'Get notified when flight prices decrease',
      icon: 'bell',
    },
    {
      id: '2',
      title: 'Double Rewards',
      description: 'Earn extra points on every booking',
      icon: 'gift',
    },
    {
      id: '3',
      title: 'Exclusive Deals',
      description: 'Member-only discounts and offers',
      icon: 'star',
    },
  ];

  const vacationDeals = [
    {
      id: '1',
      image: 'https://storage.googleapis.com/a1aa/image/cvKZtdt4dV5fsWJH-Z5s92qm23-Yv1xVD3V_f1lhE-o.jpg',
      title: 'Green Valley Ranch Resort',
      location: 'Henderson, NV',
      rating: '4.8 (1,847 reviews)',
      price: '$973',
      originalPrice: '$1,300',
      discount: '25% off',
    },
    {
      id: '2',
      image: 'https://storage.googleapis.com/a1aa/image/AYwyQLFDOP0R7sb7_SOZ9dwMtP6MUPWHsqwAAYDq1nM.jpg',
      title: 'Suncoast Hotel and Casino',
      location: 'Las Vegas, NV',
      rating: '4.7 (2,103 reviews)',
      price: '$684',
      originalPrice: '$950',
      discount: '28% off',
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      title: 'Oceanview Paradise Resort',
      location: 'Miami, FL',
      rating: '4.9 (3,215 reviews)',
      price: '$1,245',
      originalPrice: '$1,750',
      discount: '29% off',
    },
  ];

  const renderFeatureCard = ({ item }: { item: typeof travelFeatures[0] }) => (
    <Pressable
      style={({ pressed }) => [
        styles.featureCard,
        { 
          backgroundColor: surfaceColor,
          opacity: pressed ? 0.8 : 1,
          borderColor: borderColor,
        },
      ]}
    >
      <View style={[styles.featureIconContainer, { backgroundColor: `${highlightColor}20` }]}>
        <FontAwesome5 
          name={item.icon} 
          size={20} 
          color={highlightColor} 
        />
      </View>
      <Text style={[styles.featureTitle, { color: headlineColor }]} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={[styles.featureDescription, { color: paragraphColor }]}>
        {item.description}
      </Text>
    </Pressable>
  );

  const renderDealCard = ({ item }: { item: typeof vacationDeals[0] }) => (
    <Pressable
      style={({ pressed }) => [
        styles.dealCard,
        { 
          opacity: pressed ? 0.8 : 1,
          backgroundColor: surfaceColor,
          borderColor: borderColor,
        },
      ]}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.dealImage}
        resizeMode="cover"
      />
      <View style={styles.dealDetails}>
        <View style={styles.dealHeader}>
          <Text style={[styles.dealTitle, { color: headlineColor }]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={14} color="#FFD700" />
            <Text style={[styles.ratingText, { color: textColor }]}>
              {item.rating}
            </Text>
          </View>
        </View>
        <Text style={[styles.dealLocation, { color: paragraphColor }]}>
          {item.location}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={[styles.currentPrice, { color: highlightColor }]}>
            {item.price}
          </Text>
          <Text style={[styles.originalPrice, { color: paragraphColor }]}>
            {item.originalPrice}
          </Text>
          <View style={[styles.discountBadge, { backgroundColor: highlightColor }]}>
            <Text style={styles.discountText}>
              {item.discount}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={[styles.container, { backgroundColor }]}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Main Navigation */}
          <View style={[styles.navContainer, { backgroundColor: surfaceColor }]}>
            {['hotel', 'plane', 'car', 'box', 'suitcase'].map((icon) => (
              <Pressable 
                key={icon} 
                onPress={() => handleIconPress(icon)}
                style={styles.navButton}
              >
                <Animated.View style={[styles.navIconContainer, { 
                  backgroundColor: selectedIcon === icon ? `${highlightColor}20` : 'transparent',
                  transform: [{ scale: selectedIcon === icon ? scaleValue : 1 }],
                }]}>
                  <FontAwesome5 
                    name={icon} 
                    size={22} 
                    color={selectedIcon === icon ? highlightColor : tabIconDefaultColor} 
                  />
                </Animated.View>
                <Text style={[styles.navLabel, { 
                  color: selectedIcon === icon ? highlightColor : tabIconDefaultColor,
                }]}>
                  {icon === 'hotel' && 'Stays'}
                  {icon === 'plane' && 'Flights'}
                  {icon === 'car' && 'Cars'}
                  {icon === 'box' && 'Packages'}
                  {icon === 'suitcase' && 'Activities'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Show sign-in section only if user is not logged in */}
          {!user && (
            <LinearGradient
              colors={theme === 'light' ? ['#261FB3', '#161179'] : ['#7f5af0', '#5e3fdc']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.membershipBanner}
            >
              <View style={styles.bannerContent}>
                <View style={styles.crownIcon}>
                  <FontAwesome5 name="crown" size={20} color="white" />
                </View>
                <View style={styles.bannerTextContainer}>
                  <Text style={styles.bannerTitle}>Unlock Member Benefits</Text>
                  <Text style={styles.bannerSubtitle}>Sign in for exclusive prices and rewards</Text>
                </View>
              </View>
              <Button
                title="Sign In / Join"
                onPress={() => router.push('/modal')}
                style={styles.bannerButton}
                textStyle={{ color: highlightColor }}
              />
            </LinearGradient>
          )}

          {/* Featured Deals */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: headlineColor }]}>
                Featured Vacation Deals
              </Text>
              <Pressable>
                <Text style={[styles.seeAllText, { color: highlightColor }]}>
                  See all
                </Text>
              </Pressable>
            </View>
            
            <FlatList
              horizontal
              data={vacationDeals}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dealsContainer}
              renderItem={renderDealCard}
              snapToInterval={CARD_WIDTH + 16}
              decelerationRate="fast"
            />
          </View>

          {/* Travel Features */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: headlineColor }]}>
                Travel Perks
              </Text>
              <Pressable>
                <Text style={[styles.seeAllText, { color: highlightColor }]}>
                  See all
                </Text>
              </Pressable>
            </View>
            
            <FlatList
              horizontal
              data={travelFeatures}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuresContainer}
              renderItem={renderFeatureCard}
            />
          </View>

          {/* Promotion Banner */}
          <View style={[styles.promoBanner, { borderColor: borderColor }]}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80' }}
              style={styles.promoImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.7)', 'transparent']}
              style={styles.promoGradientTop}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.promoGradientBottom}
            />
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>
                Summer Vacation Sale
              </Text>
              <Text style={styles.promoSubtitle}>
                Book by June 30 for travel through September
              </Text>
              <Button
                title="Explore Deals"
                onPress={() => console.log('Learn More pressed')}
                style={styles.promoButton}
                style={{ borderWidth: 1, borderColor: 'white', borderRadius: 12, height: 48, justifyContent: 'center', alignItems: 'center' }}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 35,
    flex: 1
  },
  scrollContainer: {
    paddingBottom: 24,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: SECTION_SPACING,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  navButton: {
    alignItems: 'center',
    minWidth: 60,
  },
  navIconContainer: {
    padding: 12,
    borderRadius: 16,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
  },
  membershipBanner: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: SECTION_SPACING,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  bannerContent: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  crownIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bannerTextContainer: {
    backgroundColor: 'transparent',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginRight: 12,
    marginLeft: 8,
    padding: 4,
    flex: 1,
  },
  bannerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  bannerSubtitle: {
    color: 'white',
    fontSize: 14,
  },
  bannerButton: {
    borderRadius: 12,
    height: 48,
  },
  sectionContainer: {
    marginBottom: SECTION_SPACING,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dealsContainer: {
    paddingLeft: 24,
    paddingRight: 8,
    paddingBottom: 8,
  },
  dealCard: {
    width: CARD_WIDTH,
    marginRight: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  dealImage: {
    width: '100%',
    height: 180,
  },
  dealDetails: {
    padding: 16,
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dealTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  dealLocation: {
    fontSize: 12,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginLeft: 8,
    opacity: 0.7,
  },
  discountBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 'auto',
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  featuresContainer: {
    paddingLeft: 24,
    paddingRight: 8,
    paddingBottom: 8,
  },
  featureCard: {
    width: FEATURE_CARD_WIDTH,
    marginRight: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  promoBanner: {
    height: 200,
    borderRadius: 16,
    marginHorizontal: 24,
    marginTop: 8,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
  },
  promoImage: {
    width: '100%',
    height: '100%',
  },
  promoGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  promoGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  promoContent: {
    position: 'absolute',
    left: 0,
    bottom: 24,
    right: 14,
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    height: '40%',
    shadowColor: '#000',
  },
  promoTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  promoSubtitle: {
    color: 'white',
    fontSize: 14,
    marginBottom: 16,
  },
  promoButton: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 12,
    height: 48,
  },
});