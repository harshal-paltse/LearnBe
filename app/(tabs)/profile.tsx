import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStore, ThemeMode } from '../../store/useThemeStore';
import { useUserStore } from '../../store/useUserStore';
import { useLibraryStore } from '../../store/useLibraryStore';
import { useProgressStore } from '../../store/useProgressStore';
import { Avatar } from '../../components/ui/Avatar';
import { Divider } from '../../components/ui/Divider';
import { formatDate, formatStudyHours } from '../../utils/formatters';
import { storageClear } from '../../services/storage';

function SettingRow({ icon, label, value, onPress, rightElement }: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}) {
  const { colors, typography, spacing, radius } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.settingRow, { paddingVertical: spacing.md, paddingHorizontal: spacing.lg }]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={onPress ? 0.6 : 1}
      accessibilityRole={onPress ? 'button' : 'none'}
      accessibilityLabel={label}
    >
      <View style={[styles.settingIcon, { backgroundColor: colors.surfaceElevated, borderRadius: radius.sm }]}>
        <Ionicons name={icon as never} size={16} color={colors.textSecondary} />
      </View>
      <Text style={[typography.body, { color: colors.text, flex: 1, marginLeft: spacing.md }]}>{label}</Text>
      {value && <Text style={[typography.bodyMd, { color: colors.textTertiary }]}>{value}</Text>}
      {rightElement}
      {onPress && !rightElement && <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />}
    </TouchableOpacity>
  );
}

function SectionTitle({ title }: { title: string }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <Text style={[typography.label, { color: colors.textTertiary, paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.sm, textTransform: 'uppercase' }]}>
      {title}
    </Text>
  );
}

function ThemeSegmentedControl() {
  const { mode, setMode } = useThemeStore();
  const { colors, radius } = useTheme();
  const options: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '📱' },
  ];

  return (
    <View style={[styles.themeControl, { backgroundColor: colors.surfaceElevated, borderRadius: radius.md }]}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[
            styles.themeOption,
            { borderRadius: radius.sm - 2 },
            mode === opt.value && { backgroundColor: colors.cardBg },
          ]}
          onPress={() => setMode(opt.value)}
          accessibilityRole="radio"
          accessibilityState={{ selected: mode === opt.value }}
          accessibilityLabel={`${opt.label} theme`}
        >
          <Text style={{ fontSize: 14 }}>{opt.icon}</Text>
          <Text style={{ fontSize: 12, fontWeight: '600', color: mode === opt.value ? colors.text : colors.textTertiary, marginTop: 2 }}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function ProfileScreen() {
  const { colors, typography, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, streak, totalStudyMinutes, materialsGenerated, updateProfile } = useUserStore();
  const { items } = useLibraryStore();
  const { topicsCovered } = useProgressStore();

  const handleClearHistory = useCallback(() => {
    Alert.alert(
      'Clear Study History',
      'This will remove all your study sessions and progress. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: async () => { await storageClear(); } },
      ]
    );
  }, []);

  const DAILY_GOALS = [15, 30, 45, 60, 90];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.profileHeader, { paddingTop: insets.top + spacing.lg, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }]}>
        <Avatar name={profile.name} size={72} />
        <View style={{ marginTop: spacing.md }}>
          <Text style={[typography.h1, { color: colors.text, textAlign: 'center' }]}>{profile.name}</Text>
          <View style={[styles.styleBadge, { backgroundColor: colors.accentBlueSoft, borderRadius: radius.full, alignSelf: 'center', marginTop: spacing.xs }]}>
            <Text style={{ color: colors.accentBlue, fontSize: 12, fontWeight: '600', paddingHorizontal: 12, paddingVertical: 4 }}>
              {profile.learningStyle.charAt(0).toUpperCase() + profile.learningStyle.slice(1)} Learner
            </Text>
          </View>
          <Text style={[typography.caption, { color: colors.textTertiary, textAlign: 'center', marginTop: spacing.xs }]}>
            Member since {formatDate(profile.memberSince)}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={[styles.statsGrid, { paddingHorizontal: spacing.lg, marginBottom: spacing.lg }]}>
        {[
          { icon: '🔥', label: 'Streak', value: `${streak.current}d` },
          { icon: '📚', label: 'Topics', value: String(topicsCovered) },
          { icon: '⏱️', label: 'Study Time', value: formatStudyHours(totalStudyMinutes) },
          { icon: '🏆', label: 'Generated', value: String(materialsGenerated) },
        ].map((stat) => (
          <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border }]}>
            <Text style={{ fontSize: 22 }}>{stat.icon}</Text>
            <Text style={[typography.h2, { color: colors.text, marginTop: 4 }]}>{stat.value}</Text>
            <Text style={[typography.caption, { color: colors.textTertiary }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <Divider />

      {/* Appearance */}
      <SectionTitle title="Appearance" />
      <View style={[styles.section, { backgroundColor: colors.cardBg, borderRadius: radius.lg, marginHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.border }]}>
        <View style={[styles.settingRow, { paddingVertical: spacing.md, paddingHorizontal: spacing.lg }]}>
          <View style={[styles.settingIcon, { backgroundColor: colors.surfaceElevated, borderRadius: radius.sm }]}>
            <Ionicons name="color-palette" size={16} color={colors.textSecondary} />
          </View>
          <Text style={[typography.body, { color: colors.text, flex: 1, marginLeft: spacing.md }]}>Theme</Text>
          <ThemeSegmentedControl />
        </View>
        <Divider style={{ marginHorizontal: spacing.lg }} />
        <SettingRow
          icon="text"
          label="Large Text"
          rightElement={
            <Switch
              value={profile.fontSizeLarge}
              onValueChange={(v) => updateProfile({ fontSizeLarge: v })}
              trackColor={{ false: colors.border, true: colors.accentBlue }}
              thumbColor="#fff"
              accessibilityLabel="Toggle large text"
            />
          }
        />
      </View>

      {/* AI Preferences */}
      <SectionTitle title="AI Preferences" />
      <View style={[styles.section, { backgroundColor: colors.cardBg, borderRadius: radius.lg, marginHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.border }]}>
        <SettingRow icon="speedometer" label="Default Difficulty" value={profile.defaultDifficulty} />
        <Divider style={{ marginHorizontal: spacing.lg }} />
        <SettingRow icon="resize" label="Response Length" value={profile.defaultLength} />
        <Divider style={{ marginHorizontal: spacing.lg }} />
        <SettingRow icon="school" label="Learning Style" value={profile.learningStyle} />
      </View>

      {/* Study Preferences */}
      <SectionTitle title="Study Preferences" />
      <View style={[styles.section, { backgroundColor: colors.cardBg, borderRadius: radius.lg, marginHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.border }]}>
        <View style={[styles.settingRow, { paddingVertical: spacing.md, paddingHorizontal: spacing.lg }]}>
          <View style={[styles.settingIcon, { backgroundColor: colors.surfaceElevated, borderRadius: radius.sm }]}>
            <Ionicons name="time" size={16} color={colors.textSecondary} />
          </View>
          <Text style={[typography.body, { color: colors.text, flex: 1, marginLeft: spacing.md }]}>Daily Goal</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {DAILY_GOALS.map((mins) => (
              <TouchableOpacity
                key={mins}
                style={[styles.goalChip, { backgroundColor: profile.dailyGoalMinutes === mins ? colors.accentBlue : colors.surfaceElevated, borderRadius: radius.full }]}
                onPress={() => updateProfile({ dailyGoalMinutes: mins })}
                accessibilityRole="radio"
                accessibilityState={{ selected: profile.dailyGoalMinutes === mins }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: profile.dailyGoalMinutes === mins ? '#fff' : colors.textSecondary }}>
                  {mins}m
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <Divider style={{ marginHorizontal: spacing.lg }} />
        <SettingRow
          icon="timer"
          label="Quiz Timer"
          rightElement={
            <Switch
              value={profile.quizTimerEnabled}
              onValueChange={(v) => updateProfile({ quizTimerEnabled: v })}
              trackColor={{ false: colors.border, true: colors.accentBlue }}
              thumbColor="#fff"
              accessibilityLabel="Toggle quiz timer"
            />
          }
        />
      </View>

      {/* Data */}
      <SectionTitle title="Data" />
      <View style={[styles.section, { backgroundColor: colors.cardBg, borderRadius: radius.lg, marginHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.border }]}>
        <SettingRow icon="trash" label="Clear Study History" onPress={handleClearHistory} />
      </View>

      {/* About */}
      <SectionTitle title="About" />
      <View style={[styles.section, { backgroundColor: colors.cardBg, borderRadius: radius.lg, marginHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.border }]}>
        <SettingRow icon="information-circle" label="Version" value="1.0.0" />
        <Divider style={{ marginHorizontal: spacing.lg }} />
        <SettingRow icon="star" label="Rate LearnBe" onPress={() => {}} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: { alignItems: 'center' },
  styleBadge: {},
  statsGrid: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, padding: 12, alignItems: 'center' },
  section: { overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center' },
  settingIcon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  themeControl: { flexDirection: 'row', padding: 3, gap: 2 },
  themeOption: { paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' },
  goalChip: { paddingHorizontal: 10, paddingVertical: 5 },
});
