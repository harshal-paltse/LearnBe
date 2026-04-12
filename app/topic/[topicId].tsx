import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { TOPIC_CATEGORIES } from '../../constants/topics';
import { Button } from '../../components/ui/Button';
import { MaterialType } from '../../store/useLibraryStore';

const MATERIAL_TYPES: { type: MaterialType; label: string; icon: string; description: string }[] = [
  { type: 'summary', label: 'Summary', icon: 'document-text', description: 'Get a comprehensive overview' },
  { type: 'flashcards', label: 'Flashcards', icon: 'layers', description: 'Practice with active recall' },
  { type: 'quiz', label: 'Quiz', icon: 'help-circle', description: 'Test your knowledge' },
  { type: 'studyPlan', label: 'Study Plan', icon: 'map', description: 'Structured learning path' },
];

export default function TopicScreen() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const { colors, typography, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();

  const category = TOPIC_CATEGORIES.find((c) => c.id === topicId);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.lg, borderBottomColor: colors.border, borderBottomWidth: 1, paddingBottom: spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[typography.h3, { color: colors.text, flex: 1, marginLeft: spacing.md }]}>
          {category?.name || topicId}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        {category?.subtopics.map((subtopic) => (
          <View key={subtopic} style={[styles.subtopicCard, { backgroundColor: colors.cardBg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg }]}>
            <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>{subtopic}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {MATERIAL_TYPES.map((mt) => (
                <TouchableOpacity
                  key={mt.type}
                  style={[styles.typeBtn, { backgroundColor: colors.surfaceElevated, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border }]}
                  onPress={() => router.push({ pathname: `/generate/${mt.type}`, params: { prefill: subtopic } })}
                  accessibilityRole="button"
                  accessibilityLabel={`Generate ${mt.label} for ${subtopic}`}
                >
                  <Ionicons name={mt.icon as never} size={14} color={colors.textSecondary} />
                  <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>{mt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center' },
  subtopicCard: {},
  typeBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6 },
});
