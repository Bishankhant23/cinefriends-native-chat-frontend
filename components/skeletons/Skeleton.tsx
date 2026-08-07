import React, { useEffect, useRef } from 'react';
import { View, Animated, Platform, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const [webOpacity, setWebOpacity] = React.useState(0.4);
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (Platform.OS === 'web') {
      let isMounted = true;
      const interval = setInterval(() => {
        if (!isMounted) return;
        setWebOpacity((prev) => (prev === 0.4 ? 0.85 : 0.4));
      }, 800);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    } else {
      const pulse = Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]);

      Animated.loop(pulse).start();

      return () => {
        opacity.stopAnimation();
      };
    }
  }, [opacity]);

  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          {
            width,
            height,
            borderRadius,
            backgroundColor: '#2D2B24',
            opacity: webOpacity,
          } as any,
          style,
        ]}
      />
    );
  }

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#2D2B24',
          opacity,
        } as any,
        style,
      ]}
    />
  );
};

export default Skeleton;
