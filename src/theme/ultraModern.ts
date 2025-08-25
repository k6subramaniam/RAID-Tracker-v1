import { MD3Theme, configureFonts } from 'react-native-paper';

// Ultra-modern dark theme colors matching the HTML designs
export const ultraModernColors = {
  // Base colors
  primary: '#fb923c',        // --accent-orange
  primaryContainer: '#f97316', // --accent-orange-hover
  secondary: '#3b82f6',      // --accent-blue
  secondaryContainer: '#8b5cf6', // --accent-purple
  
  // Background colors
  background: '#0a0a0a',     // --bg-primary
  surface: '#161618',        // --bg-secondary
  surfaceVariant: '#1f1f23', // --bg-tertiary
  surfaceContainer: '#262629', // --bg-card
  surfaceContainerHigh: '#2a2a2e', // --bg-hover
  
  // Text colors
  onPrimary: '#18181b',       // --text-inverse
  onSecondary: '#ffffff',
  onBackground: '#ffffff',    // --text-primary
  onSurface: '#ffffff',       // --text-primary
  onSurfaceVariant: '#a1a1aa', // --text-secondary
  
  // Semantic colors
  error: '#ef4444',          // --accent-red
  success: '#10b981',        // --accent-green
  warning: '#f59e0b',
  info: '#3b82f6',
  
  // RAID type colors
  risk: '#ef4444',           // --risk-color
  riskContainer: 'rgba(239, 68, 68, 0.1)', // --risk-bg
  issue: '#f97316',          // --issue-color
  issueContainer: 'rgba(249, 115, 22, 0.1)', // --issue-bg
  assumption: '#3b82f6',     // --assumption-color
  assumptionContainer: 'rgba(59, 130, 246, 0.1)', // --assumption-bg
  dependency: '#8b5cf6',     // --dependency-color
  dependencyContainer: 'rgba(139, 92, 246, 0.1)', // --dependency-bg
  
  // Priority colors
  p0: '#dc2626',             // --p0-color
  p1: '#ea580c',             // --p1-color
  p2: '#d97706',             // --p2-color
  p3: '#65a30d',             // --p3-color
  
  // Border colors
  outline: '#27272a',        // --border-primary
  outlineVariant: '#3f3f46', // --border-secondary
  
  // Special colors
  tertiary: '#a1a1aa',       // --text-muted
  onTertiary: '#71717a',
  
  // Glass effects
  glassBackground: 'rgba(38, 38, 41, 0.8)', // --glass-bg
  glassBorder: 'rgba(255, 255, 255, 0.1)',  // --glass-border
};

// Typography configuration for ultra-modern look
const fontConfig = {
  fontFamily: 'Inter',
  letterSpacing: -0.02,
};

export const ultraModernFonts = configureFonts({
  config: {
    displayLarge: {
      ...fontConfig,
      fontSize: 57,
      lineHeight: 64,
      fontWeight: '700' as const,
    },
    displayMedium: {
      ...fontConfig,
      fontSize: 45,
      lineHeight: 52,
      fontWeight: '700' as const,
    },
    displaySmall: {
      ...fontConfig,
      fontSize: 36,
      lineHeight: 44,
      fontWeight: '700' as const,
    },
    headlineLarge: {
      ...fontConfig,
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '700' as const,
    },
    headlineMedium: {
      ...fontConfig,
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '700' as const,
    },
    headlineSmall: {
      ...fontConfig,
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '700' as const,
    },
    titleLarge: {
      ...fontConfig,
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '700' as const,
    },
    titleMedium: {
      ...fontConfig,
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '600' as const,
    },
    titleSmall: {
      ...fontConfig,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: '600' as const,
    },
    labelLarge: {
      ...fontConfig,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500' as const,
    },
    labelMedium: {
      ...fontConfig,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500' as const,
    },
    labelSmall: {
      ...fontConfig,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '500' as const,
    },
    bodyLarge: {
      ...fontConfig,
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
    },
    bodyMedium: {
      ...fontConfig,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as const,
    },
    bodySmall: {
      ...fontConfig,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400' as const,
    },
  },
});

// Complete ultra-modern theme
export const ultraModernTheme: MD3Theme = {
  dark: true,
  version: 3,
  colors: ultraModernColors,
  fonts: ultraModernFonts,
  roundness: 12,
  animation: {
    scale: 1.0,
  },
};

// Shared styles for ultra-modern components
export const ultraModernStyles = {
  // Glass effect containers
  glassContainer: {
    backgroundColor: ultraModernColors.glassBackground,
    borderColor: ultraModernColors.glassBorder,
    borderWidth: 1,
    borderRadius: 16,
  },
  
  // Sidebar navigation
  sidebarContainer: {
    backgroundColor: ultraModernColors.surface,
    borderRightColor: ultraModernColors.outline,
    borderRightWidth: 1,
  },
  
  // Card styles
  ultraCard: {
    backgroundColor: ultraModernColors.surfaceVariant,
    borderColor: ultraModernColors.outline,
    borderWidth: 1,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  
  // Button styles
  primaryButton: {
    backgroundColor: ultraModernColors.primary,
    borderRadius: 8,
  },
  
  secondaryButton: {
    backgroundColor: ultraModernColors.surfaceContainer,
    borderColor: ultraModernColors.outlineVariant,
    borderWidth: 1,
    borderRadius: 8,
  },
  
  // Input styles
  ultraInput: {
    backgroundColor: ultraModernColors.surfaceVariant,
    borderColor: ultraModernColors.outline,
    borderWidth: 1,
    borderRadius: 8,
    color: ultraModernColors.onSurface,
  },
  
  // Status indicators
  statusActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: ultraModernColors.success,
    color: ultraModernColors.success,
  },
  
  statusInactive: {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    borderColor: ultraModernColors.tertiary,
    color: ultraModernColors.tertiary,
  },
  
  statusError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: ultraModernColors.error,
    color: ultraModernColors.error,
  },
  
  // Spacing system
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius system
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
  },
};

// Type definitions for theme extensions
declare global {
  namespace ReactNativePaper {
    interface ThemeColors {
      risk: string;
      riskContainer: string;
      issue: string;
      issueContainer: string;
      assumption: string;
      assumptionContainer: string;
      dependency: string;
      dependencyContainer: string;
      p0: string;
      p1: string;
      p2: string;
      p3: string;
      success: string;
      warning: string;
      info: string;
      glassBackground: string;
      glassBorder: string;
    }
  }
}