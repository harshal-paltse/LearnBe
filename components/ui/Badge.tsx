import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

type BadgeVariant = 'default' | 'blue' | 'green' | 'amber' | 'red' | 'purple';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  count?: number;
}

export const Badge = React.memo(function Badge({ label, variant = 'default', count }: BadgeProps) {
  const { colors, radius, typography } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'blue': return { bg: colors.accentBlueSoft, text: colors.accentBlue };
      case 'green': return { bg: colors.accentGreenSoft, text: colors.accentGreen };
      case 'amber': return { bg: colors.accentAmberSoft, text: colors.accentAmber };
      case 'red': return { bg: colors.accentRedSoft, text: colors.accentRed };
      case 'purple': return { bg: colors.accentPurpleSoft, text: colors.accentPurple };
      default: return { bg: colors.surfaceElevated, text: colors.textSecondary };
    }
  };

  const { bg, text } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderRadius: radius.sm }]}>
      <Text style={[typography.label, { color: text }]}>
        {count !== undefined ? `${label} ${count}` : label}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
});
