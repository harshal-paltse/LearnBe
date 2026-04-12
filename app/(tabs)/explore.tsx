import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  ListRenderItem,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useDebounce } from '../../hooks/useDebounce';
import { TOPIC_CATEGORIES, TopicCategory } from '../../constants/topics';
import { Chip } from '../../components/ui/Chip';
import { SkeletonCard } from '../../components/ui/SkeletonLoader';
import { generateOnce } from '../../services/anthropic';
import { parseTrendingTopics } from '../../services/parser';
import { PROMPTS } from '../../constants/prompts';

interface TrendingTopic {
  title: string;
  description: string;
  category: string;
}

function CategoryCard({ category, onPress }: { category: TopicCategory; onPress: () => void }) {
  const { colors, radius, spacing, typography } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.categoryCard,
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
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={category.name}
      accessibilityState={{ expanded }}
    >
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: category.color + '15', borderRadius: radius.md }]}>
          <Ionicons name={category.icon as never} size={20} color={category.color} />
        </View>
        <Text style={[typography.h3, { color: colors.text, flex: 1, marginLeft: spacing.md }]}>
          {category.name}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.textTertiary}
        />
      </View>

      {expanded && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingTop: spacing.md }}
        >
          {category.subtopics.map((subtopic) => (
            <Chip
              key={subtopic}
              label={subtopic}
              onPress={() => router.push({ pathname: '/generate/summary', params: { prefill: subtopic } })}
              color={category.color}
            />
          ))}
        </ScrollView>
      )}
    </TouchableOpacity>
  );
}

export default function ExploreScreen() {
  const { colors, typography, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(false);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = useCallback(async () => {
    setLoadingTrending(true);
    try {
      const result = await generateOnce(PROMPTS.trendingTopics());
      const topics = parseTrendingTopics(result);
      if (topics.length > 0) setTrendingTopics(topics);
    } catch {
      // silently fail
    } finally {
      setLoadingTrending(false);
    }
  }, []);

  const filteredCategories = debouncedSearch
    ? TOPIC_CATEGORIES.filter(
        (c) =>
          c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          c.subtopics.some((s) => s.toLowerCase().includes(debouncedSearch.toLowerCase()))
      )
    : TOPIC_CATEGORIES;

  const renderCategory: ListRenderItem<TopicCategory> = useCallback(({ item }) => (
    <CategoryCard category={item} onPress={() => {}} />
  ), []);

  const ListHeader = useCallback(() => (
    <View>
      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginHorizontal: spacing.lg, marginBottom: spacing.lg }]}>
        <Ionicons name="search" size={16} color={colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search topics..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search topics"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityRole="button" accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Generate CTA for search */}
      {debouncedSearch.length > 2 && (
        <TouchableOpacity
          style={[styles.generateCta, { backgroundColor: colors.accentBlueSoft, borderRadius: radius.md, marginHorizontal: spacing.lg, marginBottom: spacing.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.accentBlue + '30' }]}
          onPress={() => router.push({ pathname: '/generate/summary', params: { prefill: debouncedSearch } })}
          accessibilityRole="button"
          accessibilityLabel={`Generate materials for ${debouncedSearch}`}
        >
          <Ionicons name="sparkles" size={16} color={colors.accentBlue} />
          <Text style={[typography.bodyMd, { color: colors.accentBlue, marginLeft: 8, fontWeight: '600' }]}>
            Generate materials for "{debouncedSearch}"
          </Text>
        </TouchableOpacity>
      )}

      {/* Trending Topics */}
      {!debouncedSearch && (
        <View style={{ marginBottom: spacing.lg }}>
          <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
            <Text style={[typography.h3, { color: colors.text }]}>Trending Now</Text>
          </View>
          {loadingTrending ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 12 }}>
              {[1, 2, 3].map((i) => <SkeletonCard key={i} style={{ width: 200 }} />)}
            </ScrollView>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 12 }}>
              {trendingTopics.map((topic, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.trendingCard, { backgroundColor: colors.cardBg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md }]}
                  onPress={() => router.push({ pathname: '/generate/summary', params: { prefill: topic.title } })}
                  accessibilityRole="button"
                  accessibilityLabel={topic.title}
                >
                  <Text style={[typography.caption, { color: colors.accentBlue, marginBottom: 4 }]}>{topic.category}</Text>
                  <Text style={[typography.h3, { color: colors.text }]}>{topic.title}</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]} numberOfLines={2}>{topic.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
        <Text style={[typography.h3, { color: colors.text }]}>
          {debouncedSearch ? 'Search Results' : 'Browse Categories'}
        </Text>
      </View>
    </View>
  ), [colors, typography, spacing, radius, searchQuery, debouncedSearch, trendingTopics, loadingTrending]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg, paddingBottom: spacing.md }]}>
        <Text style={[typography.h1, { color: colors.text }]}>Explore</Text>
        <TouchableOpacity
          onPress={loadTrending}
          style={[styles.refreshBtn, { backgroundColor: colors.surface, borderRadius: radius.md }]}
          accessibilityRole="button"
          accessibilityLabel="Refresh trending topics"
        >
          <Ionicons name="refresh" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  refreshBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  generateCta: { flexDirection: 'row', alignItems: 'center' },
  categoryCard: {},
  categoryHeader: { flexDirection: 'row', alignItems: 'center' },
  categoryIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  trendingCard: { width: 200 },
});
