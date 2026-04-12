import React, { useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useHaptics } from '../../hooks/useHaptics';

interface QuickStartTopic {
  label: string;
  icon: string;
  color: string;
}

interface TopicQuickStartProps {
  topics: QuickStartTopic[];
  onSelect: (topic: string) => void;
}

export const TopicQuickStart = React.memo(function TopicQuickStart({
  topics,
  onSelect,
}: TopicQuickStartProps) {
  const { colors, radius, spacing, typography } = useTheme();
  const { light } = useHaptics();

  const handlePress = useCallback((label: string) => {
    light();
    onSelect(label);
  }, [light, onSelect]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.lg }}
    >
      {topics.map((topic) => (
        <TouchableOpacity
          key={topic.label}
          style={[
            styles.card,
            {
              backgroundColor: colors.cardBg,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.md,
              ...(Platform.OS === 'ios'
                ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6 }
                : { elevation: 1 }),
            },
          ]}
          onPress={() => handlePress(topic.label)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Quick start ${topic.label}`}
        >
          <View style={[styles.iconBg, { backgroundColor: topic.color + '15', borderRadius: radius.md }]}>
            <Ionicons name={topic.icon as never} size={18} color={topic.color} />
          </View>
          <Text style={[typography.bodyMd, { color: colors.text, marginTop: spacing.sm, fontWeight: '600' }]}>
            {topic.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 110,
    alignItems: 'flex-start',
  },
  iconBg: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
