import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  ImageSourcePropType,
  Image,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const ICON_SIZE = 60;
const SPACING = 50;
const TAPE_SPEED = 8000;
const TITLE_SIZE = 40;

const ICONS: ImageSourcePropType[] = [
  require('../assets/images/splash_screen_image/🦆 icon _card travel_.png'),
  require('../assets/images/splash_screen_image/🦆 icon _directions car_.png'),
  require('../assets/images/splash_screen_image/🦆 icon _map_.png'),
  require('../assets/images/splash_screen_image/🦆 icon _map_2.png'),
  require('../assets/images/splash_screen_image/airplan.png'),
  require('../assets/images/splash_screen_image/hotel-building.png'),
  require('../assets/images/splash_screen_image/Vector.png'),
  require('../assets/images/splash_screen_image/way_svgrepo.png'),
];

type AnimatedSplashScreenProps = {
  onAnimationFinish: () => void;
  duration?: number;
};

export default function AnimatedSplashScreen({
  onAnimationFinish,
  duration = 4000,
}: AnimatedSplashScreenProps) {
  const topAnim = useRef(new Animated.Value(0)).current;
  const bottomAnim = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const tapeWidth = useMemo(() => ICONS.length * (ICON_SIZE + SPACING), []);

  useEffect(() => {
    // Infinite loop: Top tape (scrolls left)
    Animated.loop(
      Animated.timing(topAnim, {
        toValue: -tapeWidth,
        duration: TAPE_SPEED,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Infinite loop: Bottom tape (scrolls right)
    Animated.loop(
      Animated.timing(bottomAnim, {
        toValue: tapeWidth,
        duration: TAPE_SPEED,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Fade out after duration
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      delay: duration,
      useNativeDriver: true,
    }).start(() => {
      onAnimationFinish();
    });

  }, [tapeWidth, onAnimationFinish, duration]);

  const renderTape = (animValue: Animated.Value, reverse = false) => (
    <Animated.View
      style={[
        styles.tape,
        { transform: [{ translateX: animValue }] },
        reverse && { flexDirection: 'row-reverse' },
      ]}
    >
      {/* Duplicate the icons for seamless looping */}
      {[...ICONS, ...ICONS].map((src, idx) => (
        <Image key={idx} source={src} style={styles.icon} />
      ))}
    </Animated.View>
  );

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents="none">
      {/* Top tape - scroll left */}
      <View style={[styles.tapeContainer, { top: height * 0.22 }]}>
        {renderTape(topAnim)}
      </View>

      {/* Title */}
      <Text style={[styles.title, { fontSize: TITLE_SIZE }]}>Uboor</Text>

      {/* Bottom tape - scroll right */}
      <View style={[styles.tapeContainer, { top: height * 0.7 }]}>
        {renderTape(bottomAnim, true)}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapeContainer: {
    position: 'absolute',
    width: width,
    height: ICON_SIZE,
    overflow: 'hidden',
  },
  tape: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    marginRight: SPACING,
    opacity: 0.8,
    resizeMode: 'contain',
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',  
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
    borderColor: '#e0e0e0',
    padding: 5,
    marginVertical: 5,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Poppins_700Bold',
  },
});
