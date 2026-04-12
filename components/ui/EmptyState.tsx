import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Rect, G } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  type?: 'library' | 'search' | 'quiz' | 'general';
}

function EmptyIllustration({ type, color }: { type: string; color: string }) {
  if (type === 'library') {
    return (
      <Svg width={120} height={100} viewBox="0 0 120 100">
        <Rect x="20" y="20" width="80" height="60" rx="8" fill={color} opacity={0.1} />
        <Rect x="30" y="30" width="60" height="8" rx="4" fill={color} opacity={0.3} />
        <Rect x="30" y="44" width="45" height="8" rx="4" fill={color} opacity={0.2} />
        <Rect x="30" y="58" width="55" height="8" rx="4" fill={color} opacity={0.15} />
        <Circle cx="95" cy="75" r="18" fill={color} opacity={0.15} />
        <Path d="M89 75 L94 80 L101 70" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.6} />
      </Svg>
    );
  }
  if (type === 'search') {
    return (
      <Svg width={120} height={100} viewBox="0 0 120 100">
        <Circle cx="52" cy="48" r="26" fill={color} opacity={0.1} stroke={color} strokeWidth="3" strokeOpacity={0.3} />
        <Path d="M70 66 L88 84" stroke={color} strokeWidth="3" strokeLinecap="round" opacity={0.4} />
        <Path d="M44 48 L60 48 M52 40 L52 56" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity={0.3} />
      </Svg>
    );
  }
  return (
    <Svg width={120} height={100} viewBox="0 0 120 100">
      <Circle cx="60" cy="50" r="35" fill={color} opacity={0.08} />
      <Path d="M45 50 Q60 35 75 50 Q60 65 45 50Z" fill={color} opacity={0.2} />
      <Circle cx="60" cy="50" r="8" fill={color} opacity={0.3} />
    </Svg>
  );
}

export const EmptyState = React.memo(function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  type = 'general',
}: EmptyStateProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={[styles.container, { paddingVertical: spacing.xxxl }]}>
      <EmptyIllustration type={type} color={colors.accentBlue} />
      <Text style={[typography.h3, { color: colors.text, textAlign: 'center', marginTop: spacing.lg }]}>
        {title}
      </Text>
      {description && (
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, maxWidth: 260 }]}>
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="primary"
          style={{ marginTop: spacing.xl }}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
});
