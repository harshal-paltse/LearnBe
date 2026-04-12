import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { useHaptics } from '../../hooks/useHaptics';

type Variant = 'primary' | 'ghost' | 'outline' | 'danger' | 'secondary';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  fullWidth?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const Button = React.memo(function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  fullWidth = false,
}: ButtonProps) {
  const { colors, radius, spacing } = useTheme();
  const { light } = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.97, { duration: 100 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 150 });
  }, [scale]);

  const handlePress = useCallback(() => {
    light();
    onPress();
  }, [light, onPress]);

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: { backgroundColor: colors.accent, borderWidth: 0 },
          text: { color: colors.background },
        };
      case 'secondary':
        return {
          container: { backgroundColor: colors.surfaceElevated, borderWidth: 0 },
          text: { color: colors.text },
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent', borderWidth: 0 },
          text: { color: colors.text },
        };
      case 'outline':
        return {
          container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.borderStrong },
          text: { color: colors.text },
        };
      case 'danger':
        return {
          container: { backgroundColor: colors.accentRedSoft, borderWidth: 0 },
          text: { color: colors.accentRed },
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minHeight: 36 },
          text: { fontSize: 13, fontWeight: '600' },
        };
      case 'md':
        return {
          container: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, minHeight: 44 },
          text: { fontSize: 15, fontWeight: '600' },
        };
      case 'lg':
        return {
          container: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, minHeight: 52 },
          text: { fontSize: 16, fontWeight: '700' },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <AnimatedTouchable
      style={[
        styles.base,
        { borderRadius: radius.md },
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        animatedStyle,
        style,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyles.text.color as string} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, variantStyles.text, sizeStyles.text, icon ? styles.textWithIcon : null, textStyle]}>
            {label}
          </Text>
        </>
      )}
    </AnimatedTouchable>
  );
});

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    letterSpacing: -0.2,
  },
  textWithIcon: {
    marginLeft: 4,
  },
});
