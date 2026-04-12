import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapHeight?: number;
  style?: ViewStyle;
}

export const BottomSheet = React.memo(function BottomSheet({
  visible,
  onClose,
  children,
  snapHeight = SCREEN_HEIGHT * 0.5,
  style,
}: BottomSheetProps) {
  const { colors, radius } = useTheme();
  const translateY = useSharedValue(snapHeight);
  const overlayOpacity = useSharedValue(0);

  const close = useCallback(() => {
    translateY.value = withSpring(snapHeight, { damping: 20 }, () => runOnJS(onClose)());
    overlayOpacity.value = withSpring(0);
  }, [translateY, overlayOpacity, snapHeight, onClose]);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      overlayOpacity.value = withSpring(1);
    } else {
      close();
    }
  }, [visible, close, translateY, overlayOpacity]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }, overlayStyle]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={close} activeOpacity={1} accessibilityLabel="Close sheet" />
      </Animated.View>
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            height: snapHeight,
          },
          sheetStyle,
          style,
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
        {children}
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
});
