import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface ProgressDotsProps {
  total: number;
  current: number;
  results: ('known' | 'learning' | 'skipped' | null)[];
}

export const ProgressDots = React.memo(function ProgressDots({ total, current, results }: ProgressDotsProps) {
  const { colors } = useTheme();

  const getDotColor = (index: number) => {
    if (index === current) return colors.accentBlue;
    const result = results[index];
    if (result === 'known') return colors.accentGreen;
    if (result === 'learning') return colors.accentRed;
    if (result === 'skipped') return colors.accentAmber;
    return colors.border;
  };

  const dots = Math.min(total, 20);

  return (
    <View style={styles.container}>
      {Array.from({ length: dots }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: getDotColor(i),
              width: i === current ? 16 : 6,
              borderRadius: 3,
            },
          ]}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  dot: {
    height: 6,
  },
});
