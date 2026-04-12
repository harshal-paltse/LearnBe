import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Difficulty, LengthOption, LearningStyle } from '../../constants/prompts';

interface OptionsPanelProps {
  difficulty: Difficulty;
  length: LengthOption;
  learningStyle: LearningStyle;
  focusArea: string;
  onDifficultyChange: (d: Difficulty) => void;
  onLengthChange: (l: LengthOption) => void;
  onLearningStyleChange: (s: LearningStyle) => void;
  onFocusAreaChange: (f: string) => void;
}

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const LENGTHS: { value: LengthOption; label: string }[] = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'detailed', label: 'Detailed' },
];

const STYLES: { value: LearningStyle; label: string }[] = [
  { value: 'visual', label: 'Visual' },
  { value: 'reading', label: 'Reading' },
  { value: 'kinesthetic', label: 'Kinesthetic' },
  { value: 'mixed', label: 'Mixed' },
];

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { colors, radius } = useTheme();
  return (
    <View style={[styles.segmented, { backgroundColor: colors.surfaceElevated, borderRadius: radius.md }]}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[
            styles.segment,
            { borderRadius: radius.sm - 2 },
            value === opt.value && { backgroundColor: colors.cardBg, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
          ]}
          onPress={() => onChange(opt.value)}
          accessibilityRole="button"
          accessibilityState={{ selected: value === opt.value }}
        >
          <Text style={{ fontSize: 12, fontWeight: '600', color: value === opt.value ? colors.text : colors.textTertiary }}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export const OptionsPanel = React.memo(function OptionsPanel({
  difficulty,
  length,
  learningStyle,
  onDifficultyChange,
  onLengthChange,
  onLearningStyleChange,
}: OptionsPanelProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={{ gap: spacing.md }}>
      <View>
        <Text style={[typography.label, { color: colors.textTertiary, marginBottom: spacing.sm, textTransform: 'uppercase' }]}>
          Difficulty
        </Text>
        <SegmentedControl options={DIFFICULTIES} value={difficulty} onChange={onDifficultyChange} />
      </View>
      <View>
        <Text style={[typography.label, { color: colors.textTertiary, marginBottom: spacing.sm, textTransform: 'uppercase' }]}>
          Length
        </Text>
        <SegmentedControl options={LENGTHS} value={length} onChange={onLengthChange} />
      </View>
      <View>
        <Text style={[typography.label, { color: colors.textTertiary, marginBottom: spacing.sm, textTransform: 'uppercase' }]}>
          Learning Style
        </Text>
        <SegmentedControl options={STYLES} value={learningStyle} onChange={onLearningStyleChange} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  segmented: {
    flexDirection: 'row',
    padding: 3,
    gap: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
