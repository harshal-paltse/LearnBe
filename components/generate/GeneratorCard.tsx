import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useHaptics } from '../../hooks/useHaptics';
import { MaterialType } from '../../store/useLibraryStore';

interface GeneratorCardProps {
  type: MaterialType;
  onPress: () => void;
}

const CARD_CONFIG: Record<MaterialType, { icon: string; label: string; description: string; color: string; softColor: string }> = {
  summary: {
    icon: 'document-text',
    label: 'Summary',
    description: 'Condense any topic',
    color: '#1B6FE8',
    softColor: '#EAF1FD',
  },
  flashcards: {
    icon: 'layers',
    label: 'Flashcards',
    description: 'Active recall practice',
    color: '#5B3FBF',
    softColor: '#F0EDFC',
  },
  quiz: {
    icon: 'help-circle',
    label: 'Quiz',
    description: 'Test your knowledge',
    color: '#1A7A4A',
    softColor: '#E8F5EE',
  },
  studyPlan: {
    icon: 'map',
    label: 'Study Plan',
    description: 'Structured learning path',
    color: '#B8600A',
    softColor: '#FDF3E3',
  },
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const GeneratorCard = React.memo(function GeneratorCard({ type, onPress }: GeneratorCardProps) {
  const { colors, radius, spacing } = useTheme();
  const { light } = useHaptics();
  const scale = useSharedValue(1);
  const config = CARD_CONFIG[type];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.96, { duration: 100 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 150 });
  }, [scale]);

  const handlePress = useCallback(() => {
    light();
    onPress();
  }, [light, onPress]);

  return (
    <AnimatedTouchable
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBg,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.lg,
          ...(Platform.OS === 'ios'
            ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 }
            : { elevation: 2 }),
        },
        animatedStyle,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      accessibilityRole="button"
      accessibilityLabel={`Generate ${config.label}`}
      accessibilityHint={config.description}
    >
      <View style={[styles.iconContainer, { backgroundColor: config.softColor, borderRadius: radius.md }]}>
        <Ionicons name={config.icon as never} size={22} color={config.color} />
      </View>
      <Text style={[styles.label, { color: colors.text, marginTop: spacing.md }]}>
        {config.label}
      </Text>
      <Text style={[styles.description, { color: colors.textTertiary }]}>
        {config.description}
      </Text>
    </AnimatedTouchable>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
});
