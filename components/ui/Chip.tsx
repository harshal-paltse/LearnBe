import React, { useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useHaptics } from '../../hooks/useHaptics';

interface ChipProps {
  label: string;
  onPress?: () => void;
  selected?: boolean;
  color?: string;
  style?: ViewStyle;
  size?: 'sm' | 'md';
  accessibilityLabel?: string;
}

export const Chip = React.memo(function Chip({
  label,
  onPress,
  selected = false,
  color,
  style,
  size = 'md',
  accessibilityLabel,
}: ChipProps) {
  const { colors, radius, typography } = useTheme();
  const { selection } = useHaptics();

  const handlePress = useCallback(() => {
    selection();
    onPress?.();
  }, [selection, onPress]);

  const accentColor = color || colors.accentBlue;

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: selected ? accentColor : colors.surfaceElevated,
          borderColor: selected ? accentColor : colors.border,
          borderRadius: radius.full,
          paddingVertical: size === 'sm' ? 4 : 8,
          paddingHorizontal: size === 'sm' ? 10 : 14,
          borderWidth: 1,
        },
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ selected }}
    >
      <Text
        style={[
          size === 'sm' ? typography.caption : typography.bodyMd,
          { color: selected ? '#fff' : colors.textSecondary, fontWeight: '500' },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
  },
});
