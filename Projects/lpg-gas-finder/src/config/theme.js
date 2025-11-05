/**
 * Modern Professional Theme Configuration
 *
 * A contemporary design system with pleasing gradients and colors
 * Optimized for readability, accessibility, and user experience
 */

const theme = {
  // ============================================
  // COLOR PALETTE
  // ============================================
  colors: {
    // Primary Brand Colors - Modern Blue/Teal Gradient
    primary: '#0EA5E9',           // Vibrant Sky Blue - Main brand color
    primaryLight: '#38BDF8',      // Lighter Sky Blue - Hover states
    primaryDark: '#0284C7',       // Deep Sky Blue - Pressed states
    primaryGradient: ['#0EA5E9', '#06B6D4'], // Blue to Cyan gradient

    // Secondary Accent Colors - Warm Coral/Orange
    secondary: '#F97316',         // Modern Orange - Call-to-action
    secondaryLight: '#FB923C',    // Light Orange - Hover states
    secondaryDark: '#EA580C',     // Deep Orange - Active states
    secondaryGradient: ['#F97316', '#FB923C'], // Orange gradient

    // Semantic Colors
    success: '#10B981',           // Emerald Green - Success states
    successLight: '#34D399',      // Light Emerald - Success hover
    successGradient: ['#10B981', '#34D399'],

    warning: '#F59E0B',           // Amber - Warning states
    warningLight: '#FBBF24',      // Light Amber
    warningGradient: ['#F59E0B', '#FBBF24'],

    error: '#EF4444',             // Red - Error states
    errorLight: '#F87171',        // Light Red
    errorGradient: ['#EF4444', '#F87171'],

    info: '#3B82F6',              // Blue - Info states
    infoLight: '#60A5FA',         // Light Blue
    infoGradient: ['#3B82F6', '#60A5FA'],

    // Neutral Colors - Modern Gray Scale
    white: '#FFFFFF',             // Pure white
    black: '#000000',             // Pure black

    background: '#F8FAFC',        // Soft Light Blue-Gray
    backgroundAlt: '#F1F5F9',     // Alternative background
    surface: '#FFFFFF',           // Card/surface color
    surfaceAlt: '#F8FAFC',        // Alternative surface

    // Border Colors
    border: '#E2E8F0',            // Light Gray border
    borderLight: '#F1F5F9',       // Very Light border
    borderDark: '#CBD5E1',        // Medium Gray border

    // Text Colors
    textPrimary: '#0F172A',       // Slate 900 - Primary text
    textSecondary: '#475569',     // Slate 600 - Secondary text
    textTertiary: '#94A3B8',      // Slate 400 - Tertiary text
    textDisabled: '#CBD5E1',      // Slate 300 - Disabled text
    textOnPrimary: '#FFFFFF',     // Text on primary color
    textOnSecondary: '#FFFFFF',   // Text on secondary color

    // Gray Scale (Slate) for UI elements
    gray50: '#F8FAFC',
    gray100: '#F1F5F9',
    gray200: '#E2E8F0',
    gray300: '#CBD5E1',
    gray400: '#94A3B8',
    gray500: '#64748B',
    gray600: '#475569',
    gray700: '#334155',
    gray800: '#1E293B',
    gray900: '#0F172A',

    // Overlay & Shadow Colors
    overlay: 'rgba(15, 23, 42, 0.5)',      // Dark overlay
    overlayLight: 'rgba(15, 23, 42, 0.3)', // Light overlay
    shadowColor: 'rgba(15, 23, 42, 0.1)',  // Shadow color

    // Status Badge Colors
    statusOpen: '#10B981',        // Green for open status
    statusClosed: '#EF4444',      // Red for closed status
    statusPending: '#F59E0B',     // Amber for pending
  },

  // ============================================
  // GRADIENTS
  // ============================================
  gradients: {
    // Primary Gradients
    primary: {
      colors: ['#0EA5E9', '#06B6D4'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    primaryVertical: {
      colors: ['#0EA5E9', '#06B6D4'],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },

    // Secondary Gradients
    secondary: {
      colors: ['#F97316', '#FB923C'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    secondaryVertical: {
      colors: ['#F97316', '#FB923C'],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },

    // Success Gradient
    success: {
      colors: ['#10B981', '#34D399'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },

    // Sunset Gradient (Decorative)
    sunset: {
      colors: ['#F97316', '#EF4444', '#EC4899'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },

    // Ocean Gradient (Decorative)
    ocean: {
      colors: ['#0EA5E9', '#3B82F6', '#8B5CF6'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },

    // Glass Morphism Background
    glassMorphism: {
      colors: ['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.3)'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================
  typography: {
    fontSize: {
      xs: 11,
      sm: 13,
      base: 15,
      lg: 17,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 32,
      '5xl': 40,
    },
    fontWeight: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },

  // ============================================
  // SPACING
  // ============================================
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
    '6xl': 64,
  },

  // ============================================
  // BORDER RADIUS
  // ============================================
  radius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999,
  },

  // ============================================
  // SHADOWS
  // ============================================
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 12,
    },
    colored: {
      shadowColor: '#0EA5E9',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
  },

  // ============================================
  // ANIMATION TIMINGS
  // ============================================
  animation: {
    duration: {
      fast: 150,
      normal: 250,
      slow: 350,
    },
    easing: {
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },

  // ============================================
  // BUTTON STYLES
  // ============================================
  button: {
    primary: {
      backgroundColor: '#0EA5E9',
      color: '#FFFFFF',
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
      shadowColor: '#0EA5E9',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    secondary: {
      backgroundColor: '#F97316',
      color: '#FFFFFF',
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
      shadowColor: '#F97316',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: '#0EA5E9',
      color: '#0EA5E9',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 20,
    },
    ghost: {
      backgroundColor: 'rgba(14, 165, 233, 0.1)',
      color: '#0EA5E9',
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
    },
  },

  // ============================================
  // CARD STYLES
  // ============================================
  card: {
    default: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    elevated: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

export default theme;
