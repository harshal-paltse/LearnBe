import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { StudySession } from '../../store/useSessionStore';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { formatTimeAgo } from '../../utils/formatters';
import { suggestNextAction } from '../../utils/difficulty';

interface RecentSessionCardProps {
  session: StudySession;
  confidenceScore?: number;
  onPress: () => void;
}

const TYPE_BADGE: Record<string, { label: string; variant: 'blue' | 'purple' | 'green' | 'amber' }> = {
  summary: { label: 'Summary', variant: 'blue' },
  flashcards: { label: 'Flashcards', variant: 'purple' },
  quiz: { label: 'Quiz', variant: 'green' },
  studyPlan: { label: 'Study Plan', variant: 'amber' },
};

export const RecentSessionCard = React.memo(function RecentSessionCard({
  session,
  confidenceScore = 0,
  onPress,
}: RecentSessionCardProps) {
  const { colors, radius, spacing, typography } = useTheme();
  const badge = TYPE_BADGE[session.type] || { label: session.type, variant: 'blue' as const };
  const suggestion = suggestNextAction(confidenceScore);

  const getConfidenceDot = () => {
    if (confidenceScore >= 80) return colors.accentGreen;
    if (confidenceScore >= 50) return colors.accentAmber;
    return colors.accentRed;
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBg,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.lg,
          ...(Platform.OS === 'ios'
            ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6 }
            : { elevation: 1 }),
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${session.topic} ${badge.label} session`}
    >
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <View style={[styles.confidenceDot, { backgroundColor: getConfidenceDot() }]} />
          <Text style={[typography.h3, { color: colors.text, flex: 1 }]} numberOfLines={1}>
            {session.topic}
          </Text>
        </View>
        <Badge label={badge.label} variant={badge.variant} />
      </View>

      <View style={[styles.progressRow, { marginTop: spacing.sm }]}>
        <ProgressBar progress={session.progressPercent} height={4} />
        <Text style={[typography.caption, { color: colors.textTertiary, marginTop: 4 }]}>
          {session.progressPercent}% complete · {formatTimeAgo(session.lastActiveAt)}
        </Text>
      </View>

      <View style={[styles.suggestionRow, { marginTop: spacing.sm, backgroundColor: colors.surfaceElevated, borderRadius: radius.sm, padding: spacing.sm }]}>
        <Ionicons name={suggestion.icon as never} size={12} color={colors.accentBlue} />
        <Text style={[typography.caption, { color: colors.accentBlue, marginLeft: 4 }]}>
          {suggestion.message}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {},
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  confidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressRow: {},
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
