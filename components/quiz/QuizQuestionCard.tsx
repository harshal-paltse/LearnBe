import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { useHaptics } from '../../hooks/useHaptics';
import { QuizQuestion } from '../../store/useLibraryStore';

interface QuizQuestionCardProps {
  question: QuizQuestion;
  questionNumber: number;
  total: number;
  selectedOption: number | null;
  submitted: boolean;
  onSelect: (index: number) => void;
}

export const QuizQuestionCard = React.memo(function QuizQuestionCard({
  question,
  questionNumber,
  total,
  selectedOption,
  submitted,
  onSelect,
}: QuizQuestionCardProps) {
  const { colors, radius, spacing, typography } = useTheme();
  const { selection, success, error: hapticError } = useHaptics();

  const handleSelect = useCallback((index: number) => {
    if (submitted) return;
    selection();
    onSelect(index);
  }, [submitted, selection, onSelect]);

  const getOptionStyle = (index: number) => {
    if (!submitted) {
      return {
        backgroundColor: selectedOption === index ? colors.accentBlueSoft : colors.surface,
        borderColor: selectedOption === index ? colors.accentBlue : colors.border,
      };
    }
    if (index === question.correct) {
      return { backgroundColor: colors.accentGreenSoft, borderColor: colors.accentGreen };
    }
    if (index === selectedOption && index !== question.correct) {
      return { backgroundColor: colors.accentRedSoft, borderColor: colors.accentRed };
    }
    return { backgroundColor: colors.surface, borderColor: colors.border };
  };

  const getOptionTextColor = (index: number) => {
    if (!submitted) return selectedOption === index ? colors.accentBlue : colors.text;
    if (index === question.correct) return colors.accentGreen;
    if (index === selectedOption && index !== question.correct) return colors.accentRed;
    return colors.textSecondary;
  };

  return (
    <View style={{ gap: spacing.lg }}>
      <View>
        <Text style={[typography.label, { color: colors.textTertiary, marginBottom: spacing.sm }]}>
          QUESTION {questionNumber} OF {total}
        </Text>
        <Text style={[typography.h2, { color: colors.text, lineHeight: 30 }]}>
          {question.question}
        </Text>
        {question.concept && (
          <View style={[styles.conceptBadge, { backgroundColor: colors.accentBlueSoft, borderRadius: radius.sm, marginTop: spacing.sm }]}>
            <Text style={{ color: colors.accentBlue, fontSize: 11, fontWeight: '600' }}>
              {question.concept}
            </Text>
          </View>
        )}
      </View>

      <View style={{ gap: spacing.sm }}>
        {question.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              { borderRadius: radius.md, borderWidth: 1.5, padding: spacing.md },
              getOptionStyle(index),
            ]}
            onPress={() => handleSelect(index)}
            disabled={submitted}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedOption === index, checked: submitted && index === question.correct }}
            accessibilityLabel={option}
          >
            <View style={[styles.optionLetter, { backgroundColor: getOptionStyle(index).borderColor + '20', borderRadius: radius.sm }]}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: getOptionTextColor(index) }}>
                {String.fromCharCode(65 + index)}
              </Text>
            </View>
            <Text style={[styles.optionText, { color: getOptionTextColor(index) }]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {submitted && (
        <View style={[styles.explanation, { backgroundColor: colors.accentBlueSoft, borderRadius: radius.md, padding: spacing.md }]}>
          <Text style={{ color: colors.accentBlue, fontSize: 13, fontWeight: '600', marginBottom: 4 }}>
            Explanation
          </Text>
          <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>
            {question.explanation}
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionLetter: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  conceptBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  explanation: {},
});
