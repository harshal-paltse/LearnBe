import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { StudyMilestone } from '../../store/useLibraryStore';
import { useHaptics } from '../../hooks/useHaptics';

interface MilestoneCardProps {
  milestone: StudyMilestone;
  isActive: boolean;
  onToggleComplete: (day: number) => void;
}

export const MilestoneCard = React.memo(function MilestoneCard({
  milestone,
  isActive,
  onToggleComplete,
}: MilestoneCardProps) {
  const { colors, radius, spacing, typography } = useTheme();
  const { success } = useHaptics();

  const handleToggle = useCallback(() => {
    success();
    onToggleComplete(milestone.day);
  }, [success, onToggleComplete, milestone.day]);

  const statusColor = milestone.completed
    ? colors.accentGreen
    : isActive
    ? colors.accentBlue
    : colors.textTertiary;

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderRadius: radius.lg, borderWidth: 1, borderColor: isActive ? colors.accentBlue + '40' : colors.border, padding: spacing.lg }]}>
      <View style={styles.header}>
        <View style={[styles.dayPill, { backgroundColor: statusColor + '20', borderRadius: radius.full }]}>
          <Text style={{ color: statusColor, fontSize: 11, fontWeight: '700' }}>
            DAY {milestone.day}
          </Text>
        </View>
        <View style={[styles.timeBadge, { backgroundColor: colors.surfaceElevated, borderRadius: radius.sm }]}>
          <Ionicons name="time-outline" size={12} color={colors.textTertiary} />
          <Text style={{ color: colors.textTertiary, fontSize: 11, fontWeight: '500', marginLeft: 3 }}>
            {milestone.estimatedMinutes}m
          </Text>
        </View>
      </View>

      <Text style={[typography.h3, { color: colors.text, marginTop: spacing.sm }]}>
        {milestone.title}
      </Text>

      <View style={{ marginTop: spacing.sm, gap: 4 }}>
        {milestone.objectives.map((obj, i) => (
          <View key={i} style={styles.objectiveRow}>
            <View style={[styles.bullet, { backgroundColor: statusColor }]} />
            <Text style={[typography.bodyMd, { color: colors.textSecondary, flex: 1 }]}>{obj}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.activitiesRow, { marginTop: spacing.md }]}>
        {milestone.activities.map((activity, i) => (
          <View key={i} style={[styles.activityChip, { backgroundColor: colors.surfaceElevated, borderRadius: radius.full }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '500' }}>{activity}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.checkButton,
          {
            backgroundColor: milestone.completed ? colors.accentGreenSoft : colors.surfaceElevated,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: milestone.completed ? colors.accentGreen : colors.border,
            marginTop: spacing.md,
          },
        ]}
        onPress={handleToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: milestone.completed }}
        accessibilityLabel={`Mark day ${milestone.day} as ${milestone.completed ? 'incomplete' : 'complete'}`}
      >
        <Ionicons
          name={milestone.completed ? 'checkmark-circle' : 'ellipse-outline'}
          size={18}
          color={milestone.completed ? colors.accentGreen : colors.textTertiary}
        />
        <Text style={{ color: milestone.completed ? colors.accentGreen : colors.textSecondary, fontSize: 13, fontWeight: '600', marginLeft: 6 }}>
          {milestone.completed ? 'Completed' : 'Mark Complete'}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  objectiveRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 7,
  },
  activitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  activityChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});
