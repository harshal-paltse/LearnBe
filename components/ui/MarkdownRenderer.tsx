import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface MarkdownRendererProps {
  content: string;
  fontSize?: number;
}

interface MarkdownNode {
  type: 'h1' | 'h2' | 'h3' | 'paragraph' | 'bullet' | 'blockquote' | 'empty';
  content: string;
}

function parseMarkdown(text: string): MarkdownNode[] {
  const lines = text.split('\n');
  const nodes: MarkdownNode[] = [];

  for (const line of lines) {
    if (line.startsWith('### ')) {
      nodes.push({ type: 'h3', content: line.slice(4) });
    } else if (line.startsWith('## ')) {
      nodes.push({ type: 'h2', content: line.slice(3) });
    } else if (line.startsWith('# ')) {
      nodes.push({ type: 'h1', content: line.slice(2) });
    } else if (line.startsWith('> ')) {
      nodes.push({ type: 'blockquote', content: line.slice(2) });
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      nodes.push({ type: 'bullet', content: line.slice(2) });
    } else if (line.trim() === '') {
      nodes.push({ type: 'empty', content: '' });
    } else {
      nodes.push({ type: 'paragraph', content: line });
    }
  }

  return nodes;
}

function renderInlineMarkdown(text: string, baseColor: string, boldColor: string, fontSize: number) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={i} style={{ fontWeight: '700', color: boldColor, fontSize }}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return (
      <Text key={i} style={{ color: baseColor, fontSize }}>
        {part}
      </Text>
    );
  });
}

export const MarkdownRenderer = React.memo(function MarkdownRenderer({
  content,
  fontSize = 15,
}: MarkdownRendererProps) {
  const { colors, spacing } = useTheme();

  const nodes = useMemo(() => parseMarkdown(content), [content]);

  return (
    <View>
      {nodes.map((node, index) => {
        switch (node.type) {
          case 'h1':
            return (
              <Text key={index} style={[styles.h1, { color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
                {node.content}
              </Text>
            );
          case 'h2':
            return (
              <Text key={index} style={[styles.h2, { color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
                {node.content}
              </Text>
            );
          case 'h3':
            return (
              <Text key={index} style={[styles.h3, { color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs }]}>
                {node.content}
              </Text>
            );
          case 'blockquote':
            return (
              <View key={index} style={[styles.blockquote, { borderLeftColor: colors.accentBlue, backgroundColor: colors.accentBlueSoft, marginVertical: spacing.sm }]}>
                <Text style={{ color: colors.accentBlue, fontSize: fontSize - 1, lineHeight: 22, fontStyle: 'italic' }}>
                  {node.content}
                </Text>
              </View>
            );
          case 'bullet':
            return (
              <View key={index} style={[styles.bulletRow, { marginBottom: spacing.xs }]}>
                <Text style={{ color: colors.accentBlue, fontSize, marginRight: 8, marginTop: 2 }}>•</Text>
                <Text style={{ color: colors.textSecondary, fontSize, lineHeight: 22, flex: 1 }}>
                  {renderInlineMarkdown(node.content, colors.textSecondary, colors.text, fontSize)}
                </Text>
              </View>
            );
          case 'empty':
            return <View key={index} style={{ height: spacing.sm }} />;
          default:
            return (
              <Text key={index} style={{ color: colors.textSecondary, fontSize, lineHeight: 24, marginBottom: spacing.xs }}>
                {renderInlineMarkdown(node.content, colors.textSecondary, colors.text, fontSize)}
              </Text>
            );
        }
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  h1: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  h2: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  h3: { fontSize: 15, fontWeight: '600', letterSpacing: -0.2 },
  blockquote: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    paddingVertical: 8,
    paddingRight: 12,
    borderRadius: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});
