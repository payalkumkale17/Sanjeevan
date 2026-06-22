import { Appearance } from 'react-native';

export const palette = {
  white: '#FFFFFF',
  bgTop: '#F8FAFC',
  bgBottom: '#F8FAFC',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  panel: '#FFFFFF',
  panelGlass: '#FFFFFF',
  textPrimary: '#0F172A',
  textLight: '#334155',
  textMuted: '#64748B',
  textWhite: '#FFFFFF',
  textWhiteMuted: 'rgba(255, 255, 255, 0.8)',
  accent: '#1E3A8A',
  black: '#0F172A',
  primary: '#4F46E5',
  secondary: '#FF9933',
  success: '#138808',
  cyan: '#1E3A8A',
  mint: '#138808',
  pink: '#FF9933',
  lightMint: '#F0FDF4',
  lightPink: '#FFF7ED',
  lightCyan: '#EFF6FF',
  gray: '#E2E8F0',
  warning: '#F59E0B',
  danger: '#EF4444',
  good: '#10B981',
};

export const darkPalette = {
  white: '#1F2937',
  bgTop: '#111827',
  bgBottom: '#111827',
  bg: '#111827',
  surface: '#1F2937',
  panel: '#1F2937',
  panelGlass: '#1F2937',
  textPrimary: '#F9FAFB',
  textLight: '#D1D5DB',
  textMuted: '#9CA3AF',
  textWhite: '#F9FAFB',
  textWhiteMuted: 'rgba(249, 250, 251, 0.7)',
  accent: '#818CF8',
  black: '#F9FAFB',
  primary: '#818CF8',
  secondary: '#FB923C',
  success: '#34D399',
  cyan: '#60A5FA',
  mint: '#34D399',
  pink: '#FB923C',
  lightMint: '#064E3B',
  lightPink: '#431407',
  lightCyan: '#1E3A5F',
  gray: '#374151',
  warning: '#FBBF24',
  danger: '#F87171',
  good: '#34D399',
};

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
};

export const typography = {
  fontLight: 'Poppins_300Light',
  fontRegular: 'Poppins_400Regular',
  fontMedium: 'Poppins_500Medium',
  fontSemiBold: 'Poppins_600SemiBold',
  fontBold: 'Poppins_700Bold',
  fontExtraBold: 'Poppins_800ExtraBold',
  fontInter: 'Inter_400Regular',
  fontInterMedium: 'Inter_500Medium',
  fontInterBold: 'Inter_700Bold',
};

export const aqiCategoryColor = (category: string): string => {
  switch (category) {
    case 'Good': return '#00C853';
    case 'Moderate': return '#FFB300';
    case 'Poor': return '#FF6D00';
    case 'Very Poor': return '#D50000';
    case 'Severe': return '#6A1B9A';
    default: return '#64748B';
  }
};

export const aqiCategoryGradient = (category: string) => {
  switch (category) {
    case 'Good': return [palette.white, palette.lightMint] as const;
    case 'Moderate': return [palette.white, '#FEF3C7'] as const;
    case 'Poor': return [palette.white, palette.lightPink] as const;
    case 'Very Poor': return [palette.white, '#FEE2E2'] as const;
    case 'Severe': return [palette.white, '#FECACA'] as const;
    default: return [palette.white, palette.bg] as const;
  }
};