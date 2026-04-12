import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from '../ui/Chip';

interface SuggestionChipsProps {
  topics: string[];
  onSelect: (topic: string) => void;
}

export const SuggestionChips = React.memo(function SuggestionChips({
  topics,
  onSelect,
}: SuggestionChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {topics.map((topic) => (
        <Chip
          key={topic}
          label={topic}
          onPress={() => onSelect(topic)}
        />
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
});
