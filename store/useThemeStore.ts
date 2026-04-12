import { create } from 'zustand';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, ColorPalette } from '../constants/tokens';
import { STORAGE_KEYS } from '../constants/config';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeStore {
  mode: ThemeMode;
  resolved: 'light' | 'dark';
  colors: ColorPalette;
  setMode: (mode: ThemeMode) => void;
  initTheme: () => Promise<void>;
}

function resolveColors(mode: ThemeMode): { resolved: 'light' | 'dark'; colors: ColorPalette } {
  if (mode === 'system') {
    const scheme = Appearance.getColorScheme();
    const resolved = scheme === 'dark' ? 'dark' : 'light';
    return { resolved, colors: resolved === 'dark' ? darkColors : lightColors };
  }
  return { resolved: mode, colors: mode === 'dark' ? darkColors : lightColors };
}

export const useThemeStore = create<ThemeStore>((set, get) => {
  // Listen to system appearance changes
  Appearance.addChangeListener(({ colorScheme }) => {
    if (get().mode === 'system') {
      const resolved = colorScheme === 'dark' ? 'dark' : 'light';
      set({ resolved, colors: resolved === 'dark' ? darkColors : lightColors });
    }
  });

  return {
    mode: 'system',
    ...resolveColors('system'),

    setMode: (mode: ThemeMode) => {
      const { resolved, colors } = resolveColors(mode);
      set({ mode, resolved, colors });
      AsyncStorage.setItem(STORAGE_KEYS.theme, mode);
    },

    initTheme: async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.theme);
        const mode = (saved as ThemeMode) || 'system';
        const { resolved, colors } = resolveColors(mode);
        set({ mode, resolved, colors });
      } catch {
        // use defaults
      }
    },
  };
});
