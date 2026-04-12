import React, { useState, useCallback } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string | null;
  hint?: string;
  style?: ViewStyle;
  inputStyle?: object;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
}

export const Input = React.memo(function Input({
  label,
  error,
  hint,
  style,
  inputStyle,
  rightElement,
  leftElement,
  ...props
}: InputProps) {
  const { colors, typography, spacing, radius } = useTheme();
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setFocused(true);
    props.onFocus?.({} as never);
  }, [props]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    props.onBlur?.({} as never);
  }, [props]);

  const borderColor = error
    ? colors.accentRed
    : focused
    ? colors.borderStrong
    : colors.border;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing.xs, textTransform: 'uppercase' }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.inputBg,
            borderColor,
            borderRadius: radius.md,
            borderWidth: focused ? 1.5 : 1,
          },
        ]}
      >
        {leftElement && <View style={styles.leftElement}>{leftElement}</View>}
        <TextInput
          style={[
            styles.input,
            typography.body,
            { color: colors.text, flex: 1 },
            inputStyle,
          ]}
          placeholderTextColor={colors.textTertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={label}
          {...props}
        />
        {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      </View>
      {error && (
        <Text style={[typography.caption, { color: colors.accentRed, marginTop: spacing.xs }]}>
          {error}
        </Text>
      )}
      {hint && !error && (
        <Text style={[typography.caption, { color: colors.textTertiary, marginTop: spacing.xs }]}>
          {hint}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {},
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  input: {
    paddingVertical: 10,
  },
  leftElement: {
    marginRight: 8,
  },
  rightElement: {
    marginLeft: 8,
  },
});
