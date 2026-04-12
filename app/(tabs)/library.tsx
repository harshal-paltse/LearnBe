import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ListRenderItem,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useLibraryStore, LibraryItem, MaterialType } from '../../store/useLibraryStore';
import { useDebounce } from '../../hooks/useDebounce';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Chip } from '../../components/ui/Chip';
import { RatingSlider } from '../../components/ui/RatingSlider';
import { formatTimeAgo } from '../../utils/formatters';

type FilterTab = 'all' | MaterialType;
type SortOption = 'date' | 'reviews' | 'confidence';

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'summary', label: 'Summaries' },
  { value: 'flashcards', label: 'Flashcards' },
  { value: 'quiz', label: 'Quizzes' },
  { value: 'studyPlan', label: 'Plans' },
];

const TYPE_COLORS: Record<MaterialType, string> = {
  summary: '#1B6FE8',
  flashcards: '#5B3FBF',
  quiz: '#1A7A4A',
  studyPlan: '#B8600A',
};

const TYPE_ICONS: Record<MaterialType, string> = {
  summary: 'document-text',
  flashcards: 'layers',
  quiz: 'help-circle',
  studyPlan: 'map',
};

function LibraryItemCard({ item, onPress, onDelete }: { item: LibraryItem; onPress: () => void; onDelete: () => void }) {
  const { colors, typography, spacing, radius } = useTheme();
  const typeColor = TYPE_COLORS[item.type];

  return (
    <TouchableOpacity
      style={[
        styles.itemCard,
        {
          backgroundColor: colors.cardBg,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          borderLeftWidth: 3,
          borderLeftColor: typeColor,
          ...(Platform.OS === 'ios'
            ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6 }
            : { elevation: 1 }),
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${item.topic} ${item.type}`}
    >
      <View style={styles.itemHeader}>
        <View style={styles.itemTitleRow}>
          <Ionicons name={TYPE_ICONS[item.type] as never} size={16} color={typeColor} />
          <Text style={[typography.h3, { color: colors.text, flex: 1, marginLeft: 8 }]} numberOfLines={1}>
            {item.topic}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteBtn}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${item.topic}`}
        >
          <Ionicons name="trash-outline" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      <View style={styles.itemMeta}>
        <Badge label={item.type} variant={item.type === 'summary' ? 'blue' : item.type === 'flashcards' ? 'purple' : item.type === 'quiz' ? 'green' : 'amber'} />
        <Text style={[typography.caption, { color: colors.textTertiary }]}>
          {formatTimeAgo(item.savedAt)} · {item.reviewCount} reviews
        </Text>
      </View>

      {item.confidenceScore > 0 && (
        <View style={{ marginTop: spacing.sm }}>
          <RatingSlider value={item.confidenceScore} readonly showLabel />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function LibraryScreen() {
  const { colors, typography, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { items, removeItem } = useLibraryStore();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [sort, setSort] = useState<SortOption>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (filter !== 'all') {
      result = result.filter((i) => i.type === filter);
    }

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (i) => i.topic.toLowerCase().includes(q) || i.content.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case 'date':
        result.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
        break;
      case 'reviews':
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'confidence':
        result.sort((a, b) => b.confidenceScore - a.confidenceScore);
        break;
    }

    return result;
  }, [items, filter, sort, debouncedSearch]);

  const handleItemPress = useCallback((item: LibraryItem) => {
    switch (item.type) {
      case 'flashcards':
        router.push(`/flashcards/${item.id}`);
        break;
      case 'quiz':
        router.push(`/quiz/${item.id}`);
        break;
      case 'studyPlan':
        router.push(`/study/${item.id}`);
        break;
      default:
        router.push({ pathname: '/generate/summary', params: { prefill: item.topic } });
    }
  }, []);

  const renderItem: ListRenderItem<LibraryItem> = useCallback(({ item }) => (
    <LibraryItemCard
      item={item}
      onPress={() => handleItemPress(item)}
      onDelete={() => removeItem(item.id)}
    />
  ), [handleItemPress, removeItem]);

  const ListHeader = useCallback(() => (
    <View>
      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginHorizontal: spacing.lg, marginBottom: spacing.md }]}>
        <Ionicons name="search" size={16} color={colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search library..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search library"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityRole="button" accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      <FlatList
        horizontal
        data={FILTER_TABS}
        keyExtractor={(t) => t.value}
        renderItem={({ item: tab }) => (
          <Chip
            label={tab.label}
            selected={filter === tab.value}
            onPress={() => setFilter(tab.value)}
            style={{ marginRight: 8 }}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}
        showsHorizontalScrollIndicator={false}
      />

      {/* Sort row */}
      <View style={[styles.sortRow, { paddingHorizontal: spacing.lg, marginBottom: spacing.md }]}>
        <Text style={[typography.caption, { color: colors.textTertiary }]}>
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
        </Text>
        <View style={styles.sortButtons}>
          {(['date', 'reviews', 'confidence'] as SortOption[]).map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setSort(s)}
              style={[styles.sortBtn, { backgroundColor: sort === s ? colors.accentBlueSoft : 'transparent', borderRadius: radius.sm }]}
              accessibilityRole="button"
              accessibilityState={{ selected: sort === s }}
            >
              <Text style={[typography.caption, { color: sort === s ? colors.accentBlue : colors.textTertiary, fontWeight: sort === s ? '600' : '400' }]}>
                {s === 'date' ? 'Recent' : s === 'reviews' ? 'Reviews' : 'Confidence'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  ), [colors, typography, spacing, radius, filter, sort, searchQuery, filteredItems.length]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg, paddingBottom: spacing.md }]}>
        <Text style={[typography.h1, { color: colors.text }]}>Library</Text>
        <TouchableOpacity
          onPress={() => router.push('/generate/summary')}
          style={[styles.addButton, { backgroundColor: colors.accent, borderRadius: radius.md }]}
          accessibilityRole="button"
          accessibilityLabel="Generate new material"
        >
          <Ionicons name="add" size={20} color={colors.background} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <EmptyState
            title={debouncedSearch ? 'No results found' : 'Your library is empty'}
            description={debouncedSearch ? `No materials match "${debouncedSearch}"` : 'Generate your first study material to get started.'}
            actionLabel={debouncedSearch ? undefined : 'Generate Material'}
            onAction={debouncedSearch ? undefined : () => router.push('/generate/summary')}
            type={debouncedSearch ? 'search' : 'library'}
          />
        }
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sortButtons: { flexDirection: 'row', gap: 4 },
  sortBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  itemCard: { padding: 16, marginBottom: 0 },
  itemHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  itemTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  deleteBtn: { padding: 4 },
  itemMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
});
