import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useUserStore } from '../../store/useUserStore';
import { useSessionStore } from '../../store/useSessionStore';
import { useProgressStore } from '../../store/useProgressStore';
import { DailyStreakBanner } from '../../components/home/DailyStreakBanner';
import { RecentSessionCard } from '../../components/home/RecentSessionCard';
import { SuggestionChips } from '../../components/home/SuggestionChips';
import { GeneratorCard } from '../../components/generate/GeneratorCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { MaterialType } from '../../store/useLibraryStore';
import { getGreeting, formatTimeAgo, formatStudyHours } from '../../utils/formatters';
import { QUICK_START_TOPICS } from '../../constants/topics';

type HomeSection =
  | { key: 'header' }
  | { key: 'streak' }
  | { key: 'continue' }
  | { key: 'generate' }
  | { key: 'suggestions' }
  | { key: 'recent' }
  | { key: 'stats' };

const GENERATOR_TYPES: MaterialType[] = ['summary', 'flashcards', 'quiz', 'studyPlan'];

export default function HomeScreen() {
  const { colors, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, streak, totalStudyMinutes } = useUserStore();
  const { currentSession, recentSessions } = useSessionStore();
  const { topicsCovered, cardsMastered, quizzesPassed } = useProgressStore();

  const sections: HomeSection[] = useMemo(() => {
    const s: HomeSection[] = [
      { key: 'header' },
      { key: 'streak' },
    ];
    if (currentSession) s.push({ key: 'continue' });
    s.push({ key: 'generate' });
    s.push({ key: 'suggestions' });
    if (recentSessions.length > 0) s.push({ key: 'recent' });
    s.push({ key: 'stats' });
    return s;
  }, [currentSession, recentSessions.length]);

  const handleGeneratorPress = useCallback((type: MaterialType) => {
    router.push(`/generate/${type}`);
  }, []);

  const handleTopicSelect = useCallback((topic: string) => {
    router.push({ pathname: '/generate/summary', params: { prefill: topic } });
  }, []);

  const handleSessionPress = useCallback((sessionId: string) => {
    router.push(`/study/${sessionId}`);
  }, []);

  const renderSection: ListRenderItem<HomeSection> = useCallback(({ item }) => {
    switch (item.key) {
      case 'header':
        return (
          <View style={[styles.header, { paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg, paddingBottom: spacing.md }]}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.display, { color: colors.text }]}>
                {getGreeting(profile.name)}
              </Text>
              <Text style={[typography.body, { color: colors.textSecondary, marginTop: 2 }]}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.bellButton, { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <Ionicons name="notifications-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        );

      case 'streak':
        return (
          <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
            <DailyStreakBanner streak={streak.current} weeklyActivity={streak.weeklyActivity} />
          </View>
        );

      case 'continue':
        if (!currentSession) return null;
        return (
          <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
            <SectionHeader title="Continue Learning" />
            <Card
              onPress={() => handleSessionPress(currentSession.id)}
              style={{ gap: spacing.sm }}
            >
              <Text style={[typography.caption, { color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
                In Progress
              </Text>
              <Text style={[typography.h2, { color: colors.text }]}>{currentSession.topic}</Text>
              <ProgressBar progress={currentSession.progressPercent} />
              <View style={styles.continueRow}>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {currentSession.progressPercent}% complete · {formatTimeAgo(currentSession.lastActiveAt)}
                </Text>
                <Button label="Resume" onPress={() => handleSessionPress(currentSession.id)} size="sm" />
              </View>
            </Card>
          </View>
        );

      case 'generate':
        return (
          <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
            <SectionHeader title="Generate Material" />
            <View style={styles.generatorGrid}>
              {GENERATOR_TYPES.map((type) => (
                <GeneratorCard key={type} type={type} onPress={() => handleGeneratorPress(type)} />
              ))}
            </View>
          </View>
        );

      case 'suggestions':
        return (
          <View style={{ marginBottom: spacing.lg }}>
            <View style={{ paddingHorizontal: spacing.lg }}>
              <SectionHeader title="Quick Start" />
            </View>
            <SuggestionChips
              topics={QUICK_START_TOPICS}
              onSelect={handleTopicSelect}
            />
          </View>
        );

      case 'recent':
        return (
          <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
            <SectionHeader
              title="Recent Sessions"
              actionLabel="See all"
              onAction={() => router.push('/(tabs)/library')}
            />
            <View style={{ gap: spacing.sm }}>
              {recentSessions.slice(0, 5).map((session) => (
                <RecentSessionCard
                  key={session.id}
                  session={session}
                  onPress={() => handleSessionPress(session.id)}
                />
              ))}
            </View>
          </View>
        );

      case 'stats':
        return (
          <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.xxxl }}>
            <SectionHeader title="My Progress" />
            <View style={styles.statsGrid}>
              {[
                { label: 'Topics', value: topicsCovered, icon: '📚' },
                { label: 'Cards', value: cardsMastered, icon: '🃏' },
                { label: 'Quizzes', value: quizzesPassed, icon: '🧠' },
                { label: 'Hours', value: formatStudyHours(totalStudyMinutes), icon: '⏱️' },
              ].map((stat) => (
                <View
                  key={stat.label}
                  style={[styles.statBox, { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border }]}
                >
                  <Text style={{ fontSize: 20 }}>{stat.icon}</Text>
                  <Text style={[typography.h2, { color: colors.text, marginTop: 4 }]}>{stat.value}</Text>
                  <Text style={[typography.caption, { color: colors.textTertiary }]}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  }, [colors, typography, spacing, insets, profile, streak, currentSession, recentSessions, topicsCovered, cardsMastered, quizzesPassed, totalStudyMinutes, handleGeneratorPress, handleTopicSelect, handleSessionPress]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.key}
        renderItem={renderSection}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  bellButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  continueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
});
