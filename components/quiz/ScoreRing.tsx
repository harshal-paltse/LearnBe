import React from 'react';
import { View, Text } from 'react-native';
import { CircularProgress } from '../ui/CircularProgress';
import { useTheme } from '../../hooks/useTheme';

interface ScoreRingProps {
  correct: number;
  total: number;
}

export const ScoreRing = React.memo(function ScoreRing({ correct, total }: ScoreRingProps) {
  const { colors } = useTheme();
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

  const getColor = () => {
    if (percent >= 75) return colors.accentGreen;
    if (percent >= 50) return colors.accentAmber;
    return colors.accentRed;
  };

  return (
    <CircularProgress
      progress={percent}
      size={160}
      strokeWidth={14}
      color={getColor()}
      label={`${correct}/${total}`}
      sublabel={`${percent}% correct`}
    />
  );
});
