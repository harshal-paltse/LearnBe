import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useLibraryStore } from '../../store/useLibraryStore';
import { useProgressStore } from '../../store/useProgressStore';
import { useUserStore } from '../../store/useUserStore';
import { QuizQuestionCard } from '../../components/quiz/QuizQuestionCard';
import { ScoreRing } from '../../components/quiz/ScoreRing';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';

export default function QuizScreen() {
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  const { colors, typography, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { items, updateItem } = useLibraryStore();
  const { updateTopicScore } = useProgressStore();
  const { profile } = useUserStore();

  const item = items.find((i) => i.id === quizId);
  const questions = item?.questions || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [isComplete, setIsComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slideAnim = useSharedValue(0);

  useEffect(() => {
    if (profile.quizTimerEnabled && !submitted && !isComplete) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            handleSubmit();
            return 30;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentIndex, submitted, profile.quizTimerEnabled]);

  const handleSubmit = useCallback(() => {
    if (selectedOption === null && !submitted) {
      const newAnswers = [...answers];
      newAnswers[currentIndex] = -1;
      setAnswers(newAnswers);
    } else if (selectedOption !== null) {
      const newAnswers = [...answers];
      newAnswers[currentIndex] = selectedOption;
      setAnswers(newAnswers);
    }
    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [selectedOption, submitted, answers, currentIndex]);

  const handleNext = useCallback(() => {
    slideAnim.value = withTiming(-400, { duration: 200 }, () => {
      slideAnim.value = 400;
      slideAnim.value = withSpring(0, { damping: 20 });
    });

    if (currentIndex + 1 >= questions.length) {
      const correct = answers.filter((a, i) => a === questions[i]?.correct).length;
      const score = Math.round((correct / questions.length) * 100);
      if (item) {
        updateTopicScore(item.topic, score);
        updateItem(item.id, { confidenceScore: score });
      }
      setIsComplete(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setSubmitted(false);
      setTimeLeft(30);
    }
  }, [currentIndex, questions, answers, item, updateTopicScore, updateItem, slideAnim]);

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideAnim.value }],
  }));

  if (!item || questions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState title="No quiz found" description="This quiz appears to be empty." actionLabel="Go Back" onAction={() => router.back()} />
      </View>
    );
  }

  const correctCount = answers.filter((a, i) => a === questions[i]?.correct).length;
  const scorePercent = Math.round((correctCount / questions.length) * 100);

  if (isComplete) {
    const weakConcepts = questions
      .filter((q, i) => answers[i] !== q.correct)
      .map((q) => q.concept)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 3);

    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
          <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close quiz">
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[typography.h3, { color: colors.text }]}>Quiz Results</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: spacing.lg, alignItems: 'center', gap: spacing.xl }}>
          <ScoreRing correct={correctCount} total={questions.length} />

          <View style={[styles.scoreBreakdown, { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, width: '100%', borderWidth: 1, borderColor: colors.border }]}>
            <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>Performance</Text>
            {[
              { label: 'Correct', count: correctCount, color: colors.accentGreen },
              { label: 'Incorrect', count: questions.length - correctCount, color: colors.accentRed },
            ].map((stat) => (
              <View key={stat.label} style={[styles.statRow, { marginBottom: spacing.sm }]}>
                <Text style={[typography.body, { color: colors.textSecondary }]}>{stat.label}</Text>
                <Text style={[typography.h3, { color: stat.color }]}>{stat.count}</Text>
              </View>
            ))}
          </View>

          {weakConcepts.length > 0 && (
            <View style={[styles.weakAreas, { backgroundColor: colors.accentAmberSoft, borderRadius: radius.lg, padding: spacing.lg, width: '100%', borderWidth: 1, borderColor: colors.accentAmber + '30' }]}>
              <Text style={[typography.h3, { color: colors.accentAmber, marginBottom: spacing.sm }]}>Review These Areas</Text>
              {weakConcepts.map((concept) => (
                <TouchableOpacity
                  key={concept}
                  style={[styles.conceptRow, { marginBottom: spacing.xs }]}
                  onPress={() => router.push({ pathname: '/generate/summary', params: { prefill: concept } })}
                  accessibilityRole="button"
                  accessibilityLabel={`Generate summary for ${concept}`}
                >
                  <Text style={[typography.body, { color: colors.accentAmber }]}>→ {concept}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ width: '100%', gap: spacing.sm }}>
            <Button label="Retake Quiz" onPress={() => { setCurrentIndex(0); setSelectedOption(null); setSubmitted(false); setAnswers(Array(questions.length).fill(null)); setIsComplete(false); }} variant="primary" fullWidth />
            <Button label="Generate New Quiz" onPress={() => router.push({ pathname: '/generate/quiz', params: { prefill: item.topic } })} variant="outline" fullWidth />
            <Button label="Done" onPress={() => router.back()} variant="ghost" fullWidth />
          </View>
        </ScrollView>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.lg }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close quiz">
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <ProgressBar progress={((currentIndex) / questions.length) * 100} height={4} style={{ width: 160 }} />
        </View>
        <View style={styles.scoreChip}>
          <Text style={[typography.bodyMd, { color: colors.accentGreen, fontWeight: '700' }]}>
            {correctCount}/{currentIndex}
          </Text>
        </View>
      </View>

      {profile.quizTimerEnabled && !submitted && (
        <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.sm }}>
          <View style={[styles.timerBar, { backgroundColor: colors.surface, borderRadius: radius.full }]}>
            <View style={[styles.timerFill, { width: `${(timeLeft / 30) * 100}%`, backgroundColor: timeLeft < 10 ? colors.accentRed : colors.accentBlue, borderRadius: radius.full }]} />
          </View>
          <Text style={[typography.caption, { color: colors.textTertiary, textAlign: 'right', marginTop: 2 }]}>{timeLeft}s</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={{ padding: spacing.lg }} showsVerticalScrollIndicator={false}>
        <Animated.View style={slideStyle}>
          <QuizQuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            total={questions.length}
            selectedOption={selectedOption}
            submitted={submitted}
            onSelect={setSelectedOption}
          />
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.md, borderTopColor: colors.border, borderTopWidth: 1, paddingTop: spacing.md }]}>
        {!submitted ? (
          <Button
            label="Submit Answer"
            onPress={handleSubmit}
            fullWidth
            size="lg"
            disabled={selectedOption === null}
          />
        ) : (
          <Button
            label={currentIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}
            onPress={handleNext}
            fullWidth
            size="lg"
            icon={<Ionicons name="arrow-forward" size={18} color={colors.background} />}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12 },
  headerCenter: { flex: 1, alignItems: 'center', marginHorizontal: 12 },
  scoreChip: { minWidth: 40, alignItems: 'flex-end' },
  timerBar: { height: 6, overflow: 'hidden' },
  timerFill: { height: '100%' },
  footer: {},
  scoreBreakdown: {},
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weakAreas: {},
  conceptRow: {},
});
