import { DefaultTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { COLORS } from '../constants';

const fontConfig = {
  default: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100' as const,
    },
  },
};

export const lightTheme = {
  ...DefaultTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...DefaultTheme.colors,
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceVariant: '#F3F4F6',
    text: '#111827',
    textSecondary: '#6B7280',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    border: '#E5E7EB',
    // Custom colors
    ...COLORS,
  },
  roundness: 12,
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  elevation: {
    level0: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    level1: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    level2: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    level3: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#60A5FA',
    secondary: '#A78BFA',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    info: '#60A5FA',
    border: '#475569',
    // Custom colors (adjusted for dark mode)
    risk: '#F87171',
    assumption: '#60A5FA',
    issue: '#FB923C',
    dependency: '#A78BFA',
    p0: '#EF4444',
    p1: '#F97316',
    p2: '#FBBF24',
    p3: '#9CA3AF',
    proposed: '#6B7280',
    open: '#60A5FA',
    inProgress: '#818CF8',
    mitigating: '#A78BFA',
    resolved: '#34D399',
    closed: '#10B981',
    archived: '#4B5563',
  },
  roundness: 12,
  spacing: lightTheme.spacing,
  elevation: {
    level0: lightTheme.elevation.level0,
    level1: {
      ...lightTheme.elevation.level1,
      shadowOpacity: 0.15,
    },
    level2: {
      ...lightTheme.elevation.level2,
      shadowOpacity: 0.2,
    },
    level3: {
      ...lightTheme.elevation.level3,
      shadowOpacity: 0.25,
    },
  },
};

export type AppTheme = typeof lightTheme;

// Type augmentation for react-native-paper
declare global {
  namespace ReactNativePaper {
    interface ThemeColors {
      textSecondary: string;
      border: string;
      risk: string;
      assumption: string;
      issue: string;
      dependency: string;
      p0: string;
      p1: string;
      p2: string;
      p3: string;
      proposed: string;
      open: string;
      inProgress: string;
      mitigating: string;
      resolved: string;
      closed: string;
      archived: string;
    }
    interface Theme {
      spacing: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
      };
    }
  }
}