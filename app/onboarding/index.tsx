import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import Svg, { Circle, Path, Rect, G, Ellipse } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useUserStore } from '../../store/useUserStore';
import { Button } from '../../components/ui/Button';
import { LearningStyle } from '../../constants/prompts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function Slide1Illustration({ color }: { color: string }) {
  return (
    <Svg width={240} height={200} viewBox="0 0 240 200">
      <Ellipse cx="120" cy="180" rx="80" ry="12" fill={color} opacity={0.08} />
      <Rect x="60" y="40" width="120" height="90" rx="12" fill={color} opacity={0.12} />
      <Rect x="72" y="55" width="96" height="10" rx="5" fill={color} opacity={0.4} />
      <Rect x="72" y="72" width="72" height="8" rx="4" fill={color} opacity={0.25} />
      <Rect x="72" y="87" width="84" height="8" rx="4" fill={color} opacity={0.2} />
      <Rect x="72" y="102" width="60" height="8" rx="4" fill={color} opacity={0.15} />
      <Circle cx="168" cy="52" r="28" fill={color} opacity={0.15} />
      <Path d="M158 52 L165 59 L178 44" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.7} />
      <Circle cx="72" cy="148" r="18" fill={color} opacity={0.1} />
      <Path d="M64 148 L70 154 L80 142" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.5} />
    </Svg>
  );
}

function Slide2Illustration({ color }: { color: string }) {
  return (
    <Svg width={240} height={200} viewBox="0 0 240 200">
      <Circle cx="120" cy="100" r="70" fill={color} opacity={0.06} />
      <Rect x="50" y="60" width="60" height="50" rx="10" fill={color} opacity={0.15} />
      <Path d="M65 80 L75 90 L95 70" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" opacity={0.6} />
      <Rect x="130" y="60" width="60" height="50" rx="10" fill={color} opacity={0.1} />
      <Path d="M145 85 L175 85 M145 95 L165 95" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity={0.4} />
      <Rect x="50" y="125" width="60" height="50" rx="10" fill={color} opacity={0.1} />
      <Circle cx="80" cy="150" r="12" fill={color} opacity={0.3} />
      <Rect x="130" y="125" width="60" height="50" rx="10" fill={color} opacity={0.12} />
      <Path d="M145 140 L175 140 M145 152 L170 152 M145 164 L160 164" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={0.35} />
    </Svg>
  );
}

function Slide3Illustration({ color }: { color: string }) {
  return (
    <Svg width={240} height={200} viewBox="0 0 240 200">
      <Path d="M120 30 L140 80 L195 80 L150 110 L165 165 L120 135 L75 165 L90 110 L45 80 L100 80 Z" fill={color} opacity={0.12} />
      <Path d="M120 50 L134 88 L175 88 L143 110 L155 148 L120 126 L85 148 L97 110 L65 88 L106 88 Z" fill={color} opacity={0.2} />
      <Circle cx="120" cy="100" r="20" fill={color} opacity={0.35} />
    </Svg>
  );
}

const LEARNING_STYLES: { value: LearningStyle; label: string; description: string; icon: string }[] = [
  { value: 'visual', label: 'Visual', description: 'Diagrams, charts & images', icon: '👁️' },
  { value: 'reading', label: 'Reading', description: 'Text, notes & summaries', icon: '📖' },
  { value: 'kinesthetic', label: 'Kinesthetic', description: 'Practice & hands-on', icon: '✋' },
  { value: 'auditory', label: 'Auditory', description: 'Listening & discussion', icon: '🎧' },
];

const GOALS: { value: string; label: string; description: string; icon: string }[] = [
  { value: 'exam_prep', label: 'Exam Prep', description: 'Ace upcoming tests', icon: '📝' },
  { value: 'skill_building', label: 'Skill Building', description: 'Master new abilities', icon: '🚀' },
  { value: 'curiosity', label: 'Curiosity', description: 'Learn for the joy of it', icon: '🔍' },
  { value: 'professional', label: 'Professional', description: 'Advance your career', icon: '💼' },
];

export default function OnboardingScreen() {
  const { colors, typography, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { updateProfile, setOnboarded } = useUserStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState<LearningStyle>('mixed');
  const [selectedGoal, setSelectedGoal] = useState('curiosity');
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useSharedValue(0);

  const handleScroll = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    scrollX.value = e.nativeEvent.contentOffset.x;
  };

  const goToSlide = useCallback((index: number) => {
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    setCurrentSlide(index);
  }, []);

  const handleNext = useCallback(() => {
    if (currentSlide < 2) {
      goToSlide(currentSlide + 1);
    }
  }, [currentSlide, goToSlide]);

  const handleGetStarted = useCallback(async () => {
    await updateProfile({
      learningStyle: selectedStyle,
      goal: selectedGoal as never,
    });
    await setOnboarded(true);
    router.replace('/(tabs)');
  }, [selectedStyle, selectedGoal, updateProfile, setOnboarded]);

  const slides = [
    {
      title: 'Learn anything,\nmaster everything.',
      subtitle: 'LearnBe uses AI to generate personalized summaries, flashcards, quizzes, and study plans — tailored to how you learn best.',
      illustration: <Slide1Illustration color={colors.accentBlue} />,
    },
    {
      title: 'How do you\nlearn best?',
      subtitle: 'We\'ll personalize your content based on your learning style.',
      illustration: <Slide2Illustration color={colors.accentPurple} />,
    },
    {
      title: 'What\'s your\nlearning goal?',
      subtitle: 'Tell us what you\'re working toward so we can guide you better.',
      illustration: <Slide3Illustration color={colors.accentGreen} />,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[styles.skipButton, { top: insets.top + spacing.md }]}
        onPress={handleGetStarted}
        accessibilityRole="button"
        accessibilityLabel="Skip onboarding"
      >
        <Text style={[typography.bodyMd, { color: colors.textTertiary }]}>Skip</Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef as never}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onMomentumScrollEnd={(e) => {
          setCurrentSlide(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
        }}
        style={styles.scrollView}
      >
        {slides.map((slide, index) => (
          <View key={index} style={[styles.slide, { width: SCREEN_WIDTH, paddingTop: insets.top + 60 }]}>
            <View style={styles.illustrationContainer}>
              {slide.illustration}
            </View>

            <Text style={[typography.display, { color: colors.text, textAlign: 'center', marginTop: spacing.xl }]}>
              {slide.title}
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md, paddingHorizontal: spacing.xl }]}>
              {slide.subtitle}
            </Text>

            {index === 1 && (
              <View style={[styles.optionsGrid, { marginTop: spacing.xl }]}>
                {LEARNING_STYLES.map((style) => (
                  <TouchableOpacity
                    key={style.value}
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor: selectedStyle === style.value ? colors.accentBlueSoft : colors.surface,
                        borderColor: selectedStyle === style.value ? colors.accentBlue : colors.border,
                        borderRadius: radius.lg,
                        borderWidth: selectedStyle === style.value ? 2 : 1,
                      },
                    ]}
                    onPress={() => setSelectedStyle(style.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: selectedStyle === style.value }}
                  >
                    <Text style={{ fontSize: 24 }}>{style.icon}</Text>
                    <Text style={[typography.h3, { color: colors.text, marginTop: 6 }]}>{style.label}</Text>
                    <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center', marginTop: 2 }]}>{style.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {index === 2 && (
              <View style={[styles.optionsGrid, { marginTop: spacing.xl }]}>
                {GOALS.map((goal) => (
                  <TouchableOpacity
                    key={goal.value}
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor: selectedGoal === goal.value ? colors.accentGreenSoft : colors.surface,
                        borderColor: selectedGoal === goal.value ? colors.accentGreen : colors.border,
                        borderRadius: radius.lg,
                        borderWidth: selectedGoal === goal.value ? 2 : 1,
                      },
                    ]}
                    onPress={() => setSelectedGoal(goal.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: selectedGoal === goal.value }}
                  >
                    <Text style={{ fontSize: 24 }}>{goal.icon}</Text>
                    <Text style={[typography.h3, { color: colors.text, marginTop: 6 }]}>{goal.label}</Text>
                    <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center', marginTop: 2 }]}>{goal.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg, paddingHorizontal: spacing.xl }]}>
        <View style={styles.dots}>
          {slides.map((_, i) => {
            const isActive = currentSlide === i;
            return (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: colors.text,
                    width: isActive ? 20 : 6,
                    opacity: isActive ? 1 : 0.4,
                  },
                ]}
              />
            );
          })}
        </View>

        {currentSlide < 2 ? (
          <Button label="Continue" onPress={handleNext} fullWidth size="lg" />
        ) : (
          <Button label="Get Started" onPress={handleGetStarted} fullWidth size="lg" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipButton: {
    position: 'absolute',
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  scrollView: { flex: 1 },
  slide: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
  },
  optionCard: {
    width: (SCREEN_WIDTH - 48 - 12) / 2,
    padding: 16,
    alignItems: 'center',
  },
  footer: {
    gap: 20,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
