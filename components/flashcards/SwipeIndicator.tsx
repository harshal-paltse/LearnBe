import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

interface SwipeIndicatorProps {
  translateX: Animated.SharedValue<number>;
}

export const SwipeIndicator = React.memo(function SwipeIndicator({ translateX }: SwipeIndicatorProps) {
  const { colors, radius } = useTheme();

  const knowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, 80], [0, 1], 'clamp'),
  }));

  const learnStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-80, 0], [1, 0], 'clamp'),
  }));

  return (
    <>
      <Animated.View
        style={[
          styles.indicator,
          { backgroundColor: colors.accentGreenSoft, borderColor: colors.accentGreen, borderRadius: radius.md, left: 24 },
          knowStyle,
        ]}
      >
        <Text style={{ color: colors.accentGreen, fontWeight: '800', fontSize: 16 }}>✓ KNOW</Text>
      </Animated.View>
      <Animated.View
        style={[
          styles.indicator,
          { backgroundColor: colors.accentRedSoft, borderColor: colors.accentRed, borderRadius: radius.md, right: 24 },
          learnStyle,
        ]}
      >
        <Text style={{ color: colors.accentRed, fontWeight: '800', fontSize: 16 }}>✗ LEARNING</Text>
      </Animated.View>
    </>
  );
});

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    top: '40%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    zIndex: 10,
  },
});
