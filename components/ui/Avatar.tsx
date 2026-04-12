import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface AvatarProps {
  name: string;
  size?: number;
}

export const Avatar = React.memo(function Avatar({ name, size = 48 }: AvatarProps) {
  const { colors } = useTheme();

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.accentBlueSoft,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.accentBlue + '30',
      }}
      accessibilityLabel={`Avatar for ${name}`}
    >
      <Text
        style={{
          fontSize: size * 0.35,
          fontWeight: '700',
          color: colors.accentBlue,
          letterSpacing: -0.5,
        }}
      >
        {initials}
      </Text>
    </View>
  );
});
