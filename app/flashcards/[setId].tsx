import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  PanResponder,
  Animated as RNAnimated,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useLibraryStore } from '../../store/useLibraryStore';
import { useProgressStore } from '../../store/useProgressStore';
import { useHaptics } from '../../hooks/useHaptics';
import { FlashCard } from '../../components/flashcards/FlashCard';
import { ProgressDots } from '../../components/flashcards/ProgressDots';
import { CircularProgress } from '../../components/ui/CircularProgress';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { RatingSlider } from '../../components/ui/RatingSlider';
import { EmptyState } from '../../components/ui/EmptyState';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
type CardResult = 'known' | 'learning' | 'skipped' | null;

export default function FlashcardsScreen() {
  const { setId } = useLocalSearchParams<{ setId: string }>();
  const { colors, typography, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { items, updateItem } = useLibraryStore();
  const { updateTopicScore } = useProgressStore();
  const { success, error: hapticError, warning } = useHaptics();

  const item = items.find((i) => i.id === setId);
  const cards = item?.cards || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<CardResult[]>(Array(cards.length).fill(null));
  const [isComplete, setIsComplete] = useState(false);
  const [confidence, setConfidence] = useState(50);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  const swipeLeft = useCallback(() => {
    hapticError();
    const newResults = [...results];
    newResults[currentIndex] = 'learning';
    setResults(newResults);
    translateX.value = withSpring(-SCREEN_WIDTH * 1.5, { damping: 20 }, () => {
      runOnJS(nextCard)(newResults);
    });
  }, [currentIndex, results, hapticError]);

  const swipeRight = useCallback(() => {
    success();
    const newResults = [...results];
    newResults[currentIndex] = 'known';
    setResults(newResults);
    translateX.value = withSpring(SCREEN_WIDTH * 1.5, { damping: 20 }, () => {
      runOnJS(nextCard)(newResults);
    });
  }, [currentIndex, results, success]);

  const swipeUp = useCallback(() => {
    warning();
    const newResults = [...results];
    newResults[currentIndex] = 'skipped';
    setResults(newResults);
    translateY.value = withSpring(-SCREEN_WIDTH, { damping: 20 }, () => {
      runOnJS(nextCard)(newResults);
    });
  }, [currentIndex, results, warning]);

  const nextCard = useCallback((updatedResults: CardResult[]) => {
    translateX.value = 0;
    translateY.value = 0;
    setIsFlipped(false);
    if (currentIndex + 1 >= cards.length) {
      setIsComplete(true);
      const knownCount = updatedResults.filter((r) => r === 'known').length;
      const score = Math.round((knownCount / cards.length) * 100);
      if (item) {
        updateTopicScore(item.topic, score);
        updateItem(item.id, { confidenceScore: score });
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, cards.length, item, updateTopicScore, updateItem]);

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${interpolate(translateX.value, [-200, 0, 200], [-8, 0, 8])}deg` },
    ],
    opacity: cardOpacity.value,
  }));

  const knowOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, 80], [0, 1], 'clamp'),
  }));

  const learnOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-80, 0], [1, 0], 'clamp'),
  }));

  if (!item || cards.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState title="No flashcards found" description="This set appears to be empty." actionLabel="Go Back" onAction={() => router.back()} />
      </View>
    );
  }

  const knownCount = results.filter((r) => r === 'known').length;
  const learningCount = results.filter((r) => r === 'learning').length;
  const skippedCount = results.filter((r) => r === 'skipped').length;
  const scorePercent = cards.length > 0 ? Math.round((knownCount / cards.length) * 100) : 0;

  if (isComplete) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={[styles.completeHeader, { paddingHorizontal: spacing.lg }]}>
          <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close">
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[typography.h3, { color: colors.text }]}>Session Complete</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={[styles.completeContent, { paddingHorizontal: spacing.lg }]}>
          <CircularProgress
            progress={scorePercent}
            size={160}
            strokeWidth={14}
            color={scorePercent >= 80 ? colors.accentGreen : scorePercent >= 50 ? colors.accentAmber : colors.accentRed}
            label={`${scorePercent}%`}
            sublabel="mastered"
          />

          <View style={[styles.statsRow, { marginTop: spacing.xl }]}>
            {[
              { label: 'Known', count: knownCount, color: colors.accentGreen },
              { label: 'Learning', count: learningCount, color: colors.accentRed },
              { label: 'Skipped', count: skippedCount, color: colors.accentAmber },
            ].map((stat) => (
              <View key={stat.label} style={[styles.statItem, { backgroundColor: colors.surface, borderRadius: radius.md }]}>
                <Text style={[typography.h2, { color: stat.color }]}>{stat.count}</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.actionsColumn, { marginTop: spacing.xl, gap: spacing.sm }]}>
            <Button
              label="Study Again (unknowns only)"
              onPress={() => {
                const unknownIndices = results.map((r, i) => r !== 'known' ? i : -1).filter((i) => i >= 0);
                setCurrentIndex(0);
                setResults(Array(cards.length).fill(null));
                setIsComplete(false);
              }}
              variant="primary"
              fullWidth
            />
            <Button label="Review All" onPress={() => { setCurrentIndex(0); setResults(Array(cards.length).fill(null)); setIsComplete(false); }} variant="outline" fullWidth />
            <Button label="Done" onPress={() => router.back()} variant="ghost" fullWidth />
          </View>
        </View>
      </View>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.lg }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close flashcards">
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[typography.bodyMd, { color: colors.textSecondary }]}>
            {currentIndex + 1} / {cards.length}
          </Text>
          <ProgressBar progress={((currentIndex) / cards.length) * 100} height={4} style={{ width: 120 }} />
        </View>
        <Text style={[typography.bodyMd, { color: colors.accentGreen }]}>{knownCount} ✓</Text>
      </View>

      {/* Progress dots */}
      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.sm }}>
        <ProgressDots total={cards.length} current={currentIndex} results={results} />
      </View>

      {/* Card area */}
      <View style={styles.cardArea}>
        {/* Swipe overlays */}
        <Animated.View style={[styles.overlay, styles.overlayLeft, { backgroundColor: colors.accentGreenSoft, borderRadius: radius.xl }, knowOverlayStyle]}>
          <Text style={{ color: colors.accentGreen, fontWeight: '800', fontSize: 18 }}>✓ KNOW IT</Text>
        </Animated.View>
        <Animated.View style={[styles.overlay, styles.overlayRight, { backgroundColor: colors.accentRedSoft, borderRadius: radius.xl }, learnOverlayStyle]}>
          <Text style={{ color: colors.accentRed, fontWeight: '800', fontSize: 18 }}>✗ LEARNING</Text>
        </Animated.View>

        <Animated.View style={[styles.cardWrapper, cardAnimStyle]}>
          <FlashCard
            front={currentCard.front}
            back={currentCard.back}
            hint={currentCard.hint}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(!isFlipped)}
          />
        </Animated.View>
      </View>

      {/* Confidence rating */}
      {isFlipped && (
        <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.md }}>
          <Text style={[typography.caption, { color: colors.textTertiary, marginBottom: spacing.sm, textAlign: 'center' }]}>
            How confident are you?
          </Text>
          <RatingSlider value={confidence} onChange={setConfidence} />
        </View>
      )}

      {/* Action buttons */}
      <View style={[styles.actions, { paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.md, gap: spacing.sm }]}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.accentRedSoft, borderRadius: radius.lg }]}
          onPress={swipeLeft}
          accessibilityRole="button"
          accessibilityLabel="Mark as still learning"
        >
          <Ionicons name="close" size={24} color={colors.accentRed} />
          <Text style={{ color: colors.accentRed, fontSize: 12, fontWeight: '600', marginTop: 2 }}>Learning</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.skipBtn, { backgroundColor: colors.accentAmberSoft, borderRadius: radius.lg }]}
          onPress={swipeUp}
          accessibilityRole="button"
          accessibilityLabel="Skip this card"
        >
          <Ionicons name="arrow-up" size={20} color={colors.accentAmber} />
          <Text style={{ color: colors.accentAmber, fontSize: 11, fontWeight: '600', marginTop: 2 }}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.accentGreenSoft, borderRadius: radius.lg }]}
          onPress={swipeRight}
          accessibilityRole="button"
          accessibilityLabel="Mark as known"
        >
          <Ionicons name="checkmark" size={24} color={colors.accentGreen} />
          <Text style={{ color: colors.accentGreen, fontSize: 12, fontWeight: '600', marginTop: 2 }}>Know it</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12 },
  headerCenter: { alignItems: 'center', gap: 6 },
  cardArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardWrapper: { alignItems: 'center', justifyContent: 'center' },
  overlay: {
    position: 'absolute',
    top: '35%',
    paddingHorizontal: 20,
    paddingVertical: 12,
    zIndex: 10,
  },
  overlayLeft: { left: 20 },
  overlayRight: { right: 20 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  actionBtn: { width: 80, height: 72, alignItems: 'center', justifyContent: 'center' },
  skipBtn: { width: 60, height: 60, marginHorizontal: 8 },
  completeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  completeContent: { flex: 1, alignItems: 'center', paddingTop: 32 },
  statsRow: { flexDirection: 'row', gap: 12, width: '100%' },
  statItem: { flex: 1, alignItems: 'center', padding: 16 },
  actionsColumn: { width: '100%' },
});
