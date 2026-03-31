export const colors = {
  primary: '#C8FF00',
  background: '#0A0A0A',
  card: '#1A1A1A',
  cardLight: '#252525',
  textPrimary: '#FFFFFF',
  textSecondary: '#888888',
  textTertiary: '#555555',
  accentOrange: '#FF6B00',
  accentGreen: '#00FF88',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FFCC00',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 48,
    fontWeight: '700' as const,
    lineHeight: 56,
  },
  h2: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
};
