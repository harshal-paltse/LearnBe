import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  height?: number;
  style?: ViewStyle;
  animated?: boolean;
}

export const ProgressBar = React.memo(function ProgressBar({
  progress,
  color,
  height = 6,
  style,
  animated = true,
}: ProgressBarProps) {
  const { colors, radius } = useTheme();
  const width = useSharedValue(0);

  useEffect(() => {
    const clampedProgress = Math.min(100, Math.max(0, progress));
    if (animated) {
      width.value = withSpring(clampedProgress, { damping: 20, stiffness: 100 });
    } else {
      width.value = clampedProgress;
    }
  }, [progress, animated, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View
      style={[
        styles.track,
        { height, backgroundColor: colors.surfaceElevated, borderRadius: radius.full },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: progress }}
    >
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: color || colors.accentBlue, borderRadius: radius.full, height },
          animatedStyle,
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
    width: '100%',
  },
  fill: {},
});
