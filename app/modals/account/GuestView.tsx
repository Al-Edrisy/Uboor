import {useState} from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const GuestView = ({
  highlightColor,
  surfaceColor,
  textColor,
  router
}: {
  highlightColor: string;
  surfaceColor: string;
  textColor: string;
  router: any;
}) => {
  const [showBenefits, setShowBenefits] = useState(false);

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
        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: `${highlightColor}20` }]}>
            <Feather name="bookmark" size={18} color={highlightColor} />
          </View>
          <Text style={[styles.featureText, { color: textColor }]}>Save and organize your trips</Text>
        </View>
        
        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: `${highlightColor}20` }]}>
            <Ionicons name="notifications" size={18} color={highlightColor} />
          </View>
          <Text style={[styles.featureText, { color: textColor }]}>Get personalized price alerts</Text>
        </View>
        
        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: `${highlightColor}20` }]}>
            <MaterialIcons name="payment" size={18} color={highlightColor} />
          </View>
          <Text style={[styles.featureText, { color: textColor }]}>Faster checkout experience</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.authButton,
          { 
            backgroundColor: pressed ? `${highlightColor}90` : highlightColor,
            transform: [{ scale: pressed ? 0.98 : 1 }]
          }
        ]}
        onPress={() => router.push('/modals/authModal')}
      >
        <Text style={[styles.authButtonText, { color: 'white' }]}>
          Sign In / Register
        </Text>
        <Feather name="arrow-right" size={20} color="white" />
      </Pressable>

      <Pressable 
        onPress={() => setShowBenefits(!showBenefits)}
        style={styles.moreInfoButton}
      >
        <Text style={[styles.moreInfoText, { color: highlightColor }]}>
          {showBenefits ? 'Hide benefits' : 'More benefits'}
        </Text>
        <Feather 
          name={showBenefits ? "chevron-up" : "chevron-down"} 
          size={18} 
          color={highlightColor} 
        />
      </Pressable>

      {showBenefits && (
        <View style={styles.additionalBenefits}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: `${highlightColor}20` }]}>
              <Ionicons name="star" size={18} color={highlightColor} />
            </View>
            <Text style={[styles.featureText, { color: textColor }]}>Exclusive member discounts</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: `${highlightColor}20` }]}>
              <Feather name="share-2" size={18} color={highlightColor} />
            </View>
            <Text style={[styles.featureText, { color: textColor }]}>Share trips with friends</Text>
          </View>
        </View>
      )}

      <Pressable 
        onPress={() => router.push('/auth?mode=guest')}
        style={styles.guestContinueButton}
      >
        <Text style={[styles.guestContinueText, { color: highlightColor }]}>
          Continue as guest
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  guestContainer: {
    marginTop: 90,
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

export default GuestView;