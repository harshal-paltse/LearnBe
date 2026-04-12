import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { getConfidenceLabel, getConfidenceColor } from '../../utils/difficulty';
import { useHaptics } from '../../hooks/useHaptics';

interface RatingSliderProps {
  value: number; // 0-100
  onChange?: (value: number) => void;
  readonly?: boolean;
  showLabel?: boolean;
}

const SEGMENTS = 5;

export const RatingSlider = React.memo(function RatingSlider({
  value,
  onChange,
  readonly = false,
  showLabel = true,
}: RatingSliderProps) {
  const { colors } = useTheme();
  const { selection } = useHaptics();
  const fillWidth = useSharedValue(value);

  useEffect(() => {
    fillWidth.value = withSpring(value, { damping: 20, stiffness: 120 });
  }, [value, fillWidth]);

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${fillWidth.value}%`,
  }));

  const segmentValue = (index: number) => ((index + 1) / SEGMENTS) * 100;

  const handleSegmentPress = (index: number) => {
    if (readonly) return;
    const newValue = segmentValue(index);
    selection();
    onChange?.(newValue);
  };

  const fillColor = getConfidenceColor(value, colors);
  const label = getConfidenceLabel(value);

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View
          style={[styles.fill, { backgroundColor: fillColor }, animatedFillStyle]}
        />
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.segment, { borderColor: colors.border }]}
            onPress={() => handleSegmentPress(i)}
            disabled={readonly}
            accessibilityRole="button"
            accessibilityLabel={`Confidence level ${i + 1} of ${SEGMENTS}`}
          />
        ))}
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: fillColor, fontSize: 11, fontWeight: '600', letterSpacing: 0.5 }]}>
          {label.toUpperCase()}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 999,
    zIndex: 1,
  },
  segment: {
    flex: 1,
    borderRightWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'rgba(0,0,0,0.08)',
    zIndex: 2,
  },
  label: {
    textAlign: 'right',
  },
});
