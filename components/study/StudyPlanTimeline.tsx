import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { StudyMilestone } from '../../store/useLibraryStore';
import { MilestoneCard } from './MilestoneCard';

interface StudyPlanTimelineProps {
  milestones: StudyMilestone[];
  currentDay?: number;
  onToggleComplete: (day: number) => void;
}

export const StudyPlanTimeline = React.memo(function StudyPlanTimeline({
  milestones,
  currentDay = 1,
  onToggleComplete,
}: StudyPlanTimelineProps) {
  const { colors, spacing } = useTheme();

  return (
    <View style={styles.container}>
      {milestones.map((milestone, index) => (
        <View key={milestone.day} style={styles.row}>
          <View style={styles.timelineColumn}>
            <View style={[styles.dot, { backgroundColor: milestone.completed ? colors.accentGreen : milestone.day === currentDay ? colors.accentBlue : colors.border }]} />
            {index < milestones.length - 1 && (
              <View style={[styles.line, { backgroundColor: milestone.completed ? colors.accentGreen + '40' : colors.border }]} />
            )}
          </View>
          <View style={[styles.cardWrapper, { marginBottom: spacing.md }]}>
            <MilestoneCard
              milestone={milestone}
              isActive={milestone.day === currentDay}
              onToggleComplete={onToggleComplete}
            />
          </View>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineColumn: {
    alignItems: 'center',
    width: 16,
    paddingTop: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  cardWrapper: {
    flex: 1,
  },
});
