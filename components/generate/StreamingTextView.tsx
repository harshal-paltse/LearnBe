import React, { useEffect, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';

interface StreamingTextViewProps {
  text: string;
  isStreaming: boolean;
  renderMarkdown?: boolean;
}

export const StreamingTextView = React.memo(function StreamingTextView({
  text,
  isStreaming,
  renderMarkdown = true,
}: StreamingTextViewProps) {
  const { colors, spacing } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const cursorOpacity = useSharedValue(1);

  useEffect(() => {
    if (isStreaming) {
      cursorOpacity.value = withRepeat(withTiming(0, { duration: 500 }), -1, true);
    } else {
      cursorOpacity.value = 0;
    }
  }, [isStreaming, cursorOpacity]);

  useEffect(() => {
    if (isStreaming) {
      scrollRef.current?.scrollToEnd({ animated: true });
    }
  }, [text, isStreaming]);

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scroll}
      contentContainerStyle={{ padding: spacing.lg }}
      showsVerticalScrollIndicator={false}
      accessibilityLiveRegion="polite"
      accessibilityLabel="Generated content"
    >
      {renderMarkdown ? (
        <MarkdownRenderer content={text} />
      ) : (
        <Text style={{ color: colors.text, fontSize: 15, lineHeight: 24 }}>{text}</Text>
      )}
      {isStreaming && (
        <Animated.View style={[styles.cursor, { backgroundColor: colors.accentBlue }, cursorStyle]} />
      )}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  cursor: {
    width: 2,
    height: 18,
    marginTop: 2,
    borderRadius: 1,
  },
});
