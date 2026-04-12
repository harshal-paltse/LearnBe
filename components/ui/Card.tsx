import React, { useCallback } from 'react';
import { StyleSheet, ViewStyle, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  elevated?: boolean;
  noPadding?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'none';
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const Card = React.memo(function Card({
  children,
  onPress,
  style,
  elevated = false,
  noPadding = false,
  accessibilityLabel,
  accessibilityRole,
}: CardProps) {
  const { colors, radius, spacing, shadow } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (onPress) scale.value = withTiming(0.98, { duration: 100 });
  }, [onPress, scale]);

  const handlePressOut = useCallback(() => {
    if (onPress) scale.value = withTiming(1, { duration: 150 });
  }, [onPress, scale]);

  const cardStyle: ViewStyle = {
    backgroundColor: elevated ? colors.surfaceElevated : colors.cardBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: noPadding ? 0 : spacing.lg,
    overflow: 'hidden',
    ...(Platform.OS === 'ios' ? shadow.ios : shadow.android),
  };

  if (onPress) {
    return (
      <AnimatedTouchable
        style={[cardStyle, animatedStyle, style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole={accessibilityRole || 'button'}
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </AnimatedTouchable>
    );
  }

  return (
    <Animated.View style={[cardStyle, style]}>
      {children}
    </Animated.View>
  );
});
