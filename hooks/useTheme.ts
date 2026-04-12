import { useThemeStore } from '../store/useThemeStore';
import { ColorPalette } from '../constants/tokens';
import { typography, spacing, radius, shadow } from '../constants/tokens';

export interface Theme {
  colors: ColorPalette;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadow: typeof shadow;
  isDark: boolean;
}

export function useTheme(): Theme {
  const { colors, resolved } = useThemeStore();
  return {
    colors,
    typography,
    spacing,
    radius,
    shadow,
    isDark: resolved === 'dark',
  };
}
