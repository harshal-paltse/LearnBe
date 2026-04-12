import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useLibraryStore } from '../../store/useLibraryStore';
import { useProgressStore } from '../../store/useProgressStore';
import { StudyPlanTimeline } from '../../components/study/StudyPlanTimeline';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';

export default function StudySessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { colors, typography, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { items, updateItem } = useLibraryStore();
  const { updateTopicScore } = useProgressStore();

  const item = items.find((i) => i.id === sessionId);
  const [milestones, setMilestones] = useState(item?.plan?.milestones || []);

  const handleToggleComplete = useCallback((day: number) => {
    const updated = milestones.map((m) =>
      m.day === day ? { ...m, completed: !m.completed } : m
    );
    setMilestones(updated);
    if (item) {
      const completedCount = updated.filter((m) => m.completed).length;
      const score = Math.round((completedCount / updated.length) * 100);
      updateTopicScore(item.topic, score);
      updateItem(item.id, {
        plan: { ...item.plan!, milestones: updated },
        confidenceScore: score,
      });
    }
  }, [milestones, item, updateTopicScore, updateItem]);

  if (!item || !item.plan) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState title="Study plan not found" actionLabel="Go Back" onAction={() => router.back()} />
      </View>
    );
  }

  const completedCount = milestones.filter((m) => m.completed).length;
  const progressPercent = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;
  const currentDay = milestones.find((m) => !m.completed)?.day || milestones[milestones.length - 1]?.day || 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.lg, borderBottomColor: colors.border, borderBottomWidth: 1, paddingBottom: spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={[typography.h3, { color: colors.text }]} numberOfLines={1}>{item.plan.topic}</Text>
          <Badge label={item.plan.duration} variant="blue" />
        </View>
      </View>

      <View style={[styles.progressSection, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
        <View style={styles.progressRow}>
          <Text style={[typography.bodyMd, { color: colors.textSecondary }]}>
            {completedCount} of {milestones.length} milestones
          </Text>
          <Text style={[typography.bodyMd, { color: colors.accentBlue, fontWeight: '600' }]}>
            {progressPercent}%
          </Text>
        </View>
        <ProgressBar progress={progressPercent} style={{ marginTop: spacing.sm }} />
        <Text style={[typography.caption, { color: colors.textTertiary, marginTop: spacing.xs }]}>
          Goal: {item.plan.goal}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        <StudyPlanTimeline
          milestones={milestones}
          currentDay={currentDay}
          onToggleComplete={handleToggleComplete}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressSection: {},
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
