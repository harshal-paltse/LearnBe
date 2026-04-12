import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useHaptics } from '../../hooks/useHaptics';

const POMODORO_MINUTES = 25;
const BREAK_MINUTES = 5;

export const StudyTimer = React.memo(function StudyTimer() {
  const { colors, typography, spacing, radius } = useTheme();
  const { success, warning } = useHaptics();
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isRunning) {
      pulseScale.value = withRepeat(
        withSequence(withTiming(1.03, { duration: 1000 }), withTiming(1, { duration: 1000 })),
        -1,
        false
      );
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            if (isBreak) {
              success();
              setIsBreak(false);
              setIsRunning(false);
              return POMODORO_MINUTES * 60;
            } else {
              warning();
              setIsBreak(true);
              return BREAK_MINUTES * 60;
            }
          }
          return s - 1;
        });
      }, 1000);
    } else {
      pulseScale.value = withTiming(1);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, isBreak]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleToggle = useCallback(() => {
    setIsRunning((r) => !r);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsBreak(false);
    setSecondsLeft(POMODORO_MINUTES * 60);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = isBreak
    ? 1 - secondsLeft / (BREAK_MINUTES * 60)
    : 1 - secondsLeft / (POMODORO_MINUTES * 60);

  const timerColor = isBreak ? colors.accentGreen : colors.accentBlue;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.xl,
        },
        pulseStyle,
      ]}
    >
      <Text style={[typography.label, { color: colors.textTertiary, textAlign: 'center', textTransform: 'uppercase', marginBottom: spacing.sm }]}>
        {isBreak ? '☕ Break Time' : '🎯 Focus Session'}
      </Text>

      <Text style={[styles.timerText, { color: timerColor }]}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Text>

      <View style={[styles.progressBar, { backgroundColor: colors.surfaceElevated, borderRadius: radius.full, marginVertical: spacing.md }]}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: timerColor, borderRadius: radius.full }]} />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlBtn, { backgroundColor: colors.surfaceElevated, borderRadius: radius.md }]}
          onPress={handleReset}
          accessibilityRole="button"
          accessibilityLabel="Reset timer"
        >
          <Ionicons name="refresh" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playBtn, { backgroundColor: timerColor, borderRadius: radius.full }]}
          onPress={handleToggle}
          accessibilityRole="button"
          accessibilityLabel={isRunning ? 'Pause timer' : 'Start timer'}
        >
          <Ionicons name={isRunning ? 'pause' : 'play'} size={24} color="#fff" />
        </TouchableOpacity>

        <View style={[styles.controlBtn, { backgroundColor: colors.surfaceElevated, borderRadius: radius.md }]}>
          <Text style={[typography.caption, { color: colors.textTertiary }]}>
            {isBreak ? `${BREAK_MINUTES}m` : `${POMODORO_MINUTES}m`}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {},
  timerText: {
    fontSize: 56,
    fontWeight: '700',
    letterSpacing: -2,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  progressBar: {
    height: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  controlBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
