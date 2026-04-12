import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

interface DailyStreakBannerProps {
  streak: number;
  weeklyActivity: boolean[];
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const DailyStreakBanner = React.memo(function DailyStreakBanner({
  streak,
  weeklyActivity,
}: DailyStreakBannerProps) {
  const { colors, radius, spacing, typography } = useTheme();
  const flameScale = useSharedValue(1);
  const today = new Date().getDay();

  useEffect(() => {
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 600 }),
        withTiming(0.95, { duration: 400 }),
        withTiming(1, { duration: 200 })
      ),
      -1,
      false
    );
  }, [flameScale]);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  const getMotivation = () => {
    if (streak === 0) return 'Start your streak today!';
    if (streak < 3) return 'Great start! Keep it going.';
    if (streak < 7) return 'You\'re on a roll!';
    if (streak < 14) return 'Incredible consistency!';
    return 'Unstoppable learner!';
  };

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: colors.accentAmberSoft,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.accentAmber + '30',
          padding: spacing.lg,
          ...(Platform.OS === 'ios'
            ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 }
            : { elevation: 1 }),
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.streakInfo}>
          <Animated.Text style={[styles.flame, flameStyle]}>🔥</Animated.Text>
          <View>
            <Text style={[typography.h2, { color: colors.accentAmber }]}>
              {streak} day{streak !== 1 ? 's' : ''}
            </Text>
            <Text style={[typography.caption, { color: colors.accentAmber + 'CC' }]}>
              {getMotivation()}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.weekRow, { marginTop: spacing.md }]}>
        {DAY_LABELS.map((day, i) => {
          const isToday = i === today;
          const isDone = weeklyActivity[i];
          return (
            <View key={i} style={styles.dayItem}>
              <Text style={[typography.label, { color: isToday ? colors.accentAmber : colors.textTertiary }]}>
                {day}
              </Text>
              <View
                style={[
                  styles.dayDot,
                  {
                    backgroundColor: isDone
                      ? colors.accentAmber
                      : isToday
                      ? colors.accentAmber + '40'
                      : colors.border,
                    borderWidth: isToday ? 2 : 0,
                    borderColor: colors.accentAmber,
                  },
                ]}
              >
                {isDone && <Text style={{ fontSize: 8 }}>✓</Text>}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  banner: {},
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flame: {
    fontSize: 32,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
    gap: 6,
  },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
