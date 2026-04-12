export const lightColors = {
  background: '#FFFFFF',
  surface: '#F7F7F5',
  surfaceElevated: '#F0EFEA',
  border: 'rgba(0,0,0,0.08)',
  borderStrong: 'rgba(0,0,0,0.15)',
  text: '#0D0D0D',
  textSecondary: '#555550',
  textTertiary: '#8A8A84',
  accent: '#1A1A1A',
  accentSoft: '#F0EFEA',
  accentBlue: '#1B6FE8',
  accentBlueSoft: '#EAF1FD',
  accentGreen: '#1A7A4A',
  accentGreenSoft: '#E8F5EE',
  accentAmber: '#B8600A',
  accentAmberSoft: '#FDF3E3',
  accentRed: '#C0392B',
  accentRedSoft: '#FDECEA',
  accentPurple: '#5B3FBF',
  accentPurpleSoft: '#F0EDFC',
  cardBg: '#FFFFFF',
  tabBar: '#FFFFFF',
  inputBg: '#F7F7F5',
  shimmer: '#EBEBEB',
  overlay: 'rgba(0,0,0,0.45)',
} as const;

export const darkColors = {
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceElevated: '#242424',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.15)',
  text: '#F5F5F0',
  textSecondary: '#A8A8A2',
  textTertiary: '#6A6A65',
  accent: '#F5F5F0',
  accentSoft: '#242424',
  accentBlue: '#4A8FF5',
  accentBlueSoft: '#151C2E',
  accentGreen: '#3DB370',
  accentGreenSoft: '#0F1E16',
  accentAmber: '#F0A940',
  accentAmberSoft: '#1F1508',
  accentRed: '#E05555',
  accentRedSoft: '#1E0F0F',
  accentPurple: '#9B7FEF',
  accentPurpleSoft: '#180F33',
  cardBg: '#1A1A1A',
  tabBar: '#141414',
  inputBg: '#1A1A1A',
  shimmer: '#242424',
  overlay: 'rgba(0,0,0,0.70)',
} as const;

export type ColorPalette = typeof lightColors;

export const typography = {
  display: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -1.2, lineHeight: 38 },
  h1:      { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.8, lineHeight: 32 },
  h2:      { fontSize: 20, fontWeight: '600' as const, letterSpacing: -0.4, lineHeight: 26 },
  h3:      { fontSize: 17, fontWeight: '600' as const, letterSpacing: -0.2, lineHeight: 23 },
  body:    { fontSize: 15, fontWeight: '400' as const, letterSpacing: 0,    lineHeight: 22 },
  bodyMd:  { fontSize: 14, fontWeight: '400' as const, letterSpacing: 0,    lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, letterSpacing: 0.2,  lineHeight: 17 },
  label:   { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.8,  lineHeight: 15 },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const;

export const shadow = {
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  android: {
    elevation: 3,
  },
};
