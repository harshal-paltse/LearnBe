import React, { useEffect, useCallback } from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export const Toast = React.memo(function Toast({
  message,
  type = 'info',
  visible,
  onHide,
  duration = 3000,
}: ToastProps) {
  const { colors, radius, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  const hide = useCallback(() => {
    translateY.value = withSpring(-100, { damping: 20 });
    opacity.value = withTiming(0, { duration: 200 }, () => runOnJS(onHide)());
  }, [translateY, opacity, onHide]);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });
      const timer = setTimeout(hide, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, hide, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getTypeColor = () => {
    switch (type) {
      case 'success': return colors.accentGreen;
      case 'error': return colors.accentRed;
      case 'warning': return colors.accentAmber;
      default: return colors.accentBlue;
    }
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          top: insets.top + spacing.sm,
          backgroundColor: colors.surfaceElevated,
          borderRadius: radius.lg,
          borderLeftWidth: 3,
          borderLeftColor: getTypeColor(),
          marginHorizontal: spacing.lg,
          ...(Platform.OS === 'ios'
            ? { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12 }
            : { elevation: 6 }),
        },
        animatedStyle,
      ]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Text style={[{ color: colors.text, fontSize: 14, fontWeight: '500', flex: 1 }]}>
        {message}
      </Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
});
