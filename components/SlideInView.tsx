import React, { useEffect } from 'react';
import { Animated, useWindowDimensions, ViewStyle } from 'react-native';
import type { PropsWithChildren } from 'react';

type SlideInViewProps = PropsWithChildren<{ style?: ViewStyle }>;

const SlideInView: React.FC<SlideInViewProps> = (props) => {
  const slideAnim = new Animated.Value(0); // Initial value for translateY: 0
  const { height } = useWindowDimensions(); // Get the height of the window

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1, // Animate to the final position
      duration: 100, // Duration of the animation
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  // Interpolate the animated value to translateY
  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0], // Start from the bottom (height) to the final position (0)
  });

  return (
    <Animated.View // Special animatable View
      style={{
        ...props.style,
        transform: [{ translateY }], // Bind translateY to animated value
      }}>
      {props.children}
    </Animated.View>
  );
};

export default SlideInView;