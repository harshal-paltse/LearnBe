import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { useHaptics } from '../../hooks/useHaptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = 280;

interface FlashCardProps {
  front: string;
  back: string;
  hint?: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export const FlashCard = React.memo(function FlashCard({
  front,
  back,
  hint,
  isFlipped,
  onFlip,
}: FlashCardProps) {
  const { colors, radius, spacing } = useTheme();
  const { light } = useHaptics();
  const rotation = useSharedValue(0);

  const handleFlip = useCallback(() => {
    light();
    rotation.value = withTiming(isFlipped ? 0 : 180, { duration: 350 });
    onFlip();
  }, [isFlipped, light, onFlip, rotation]);

  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [0, 180]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [180, 360]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const cardBase: object = {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    position: 'absolute',
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16 }
      : { elevation: 4 }),
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: CARD_WIDTH, height: CARD_HEIGHT }]}
      onPress={handleFlip}
      activeOpacity={1}
      accessibilityRole="button"
      accessibilityLabel={isFlipped ? `Card back: ${back}` : `Card front: ${front}. Tap to flip`}
      accessibilityHint="Double tap to flip the card"
    >
      <Animated.View style={[cardBase, { backgroundColor: colors.cardBg }, frontStyle]}>
        <Text style={[styles.sideLabel, { color: colors.textTertiary }]}>QUESTION</Text>
        <Text style={[styles.cardText, { color: colors.text }]}>{front}</Text>
        {hint && (
          <Text style={[styles.hint, { color: colors.textTertiary }]}>💡 {hint}</Text>
        )}
        <Text style={[styles.tapHint, { color: colors.textTertiary }]}>Tap to reveal answer</Text>
      </Animated.View>

      <Animated.View style={[cardBase, { backgroundColor: colors.accentBlueSoft }, backStyle]}>
        <Text style={[styles.sideLabel, { color: colors.accentBlue }]}>ANSWER</Text>
        <Text style={[styles.cardText, { color: colors.text }]}>{back}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  cardText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  hint: {
    fontSize: 13,
    marginTop: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tapHint: {
    fontSize: 11,
    position: 'absolute',
    bottom: 20,
    letterSpacing: 0.3,
  },
});
