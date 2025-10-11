/**
 * Design Token System
 * 
 * Centralized design tokens for consistent styling across the application.
 * These tokens are injected into Tailwind CSS as CSS variables for theme support.
 */

// Semantic Color Tokens
export const colorTokens = {
  // Primary brand colors
  primary: {
    50: '210 40% 98%',
    100: '210 40% 96%',
    200: '214 32% 91%',
    300: '213 27% 84%',
    400: '215 20% 65%',
    500: '220 14% 46%',
    600: '215 25% 27%',
    700: '217 33% 17%',
    800: '222 47% 11%',
    900: '222 84% 5%',
    950: '224 71% 4%',
  },

  // Semantic status colors
  success: {
    50: '138 76% 97%',
    100: '141 84% 93%',
    200: '141 79% 85%',
    300: '142 77% 73%',
    400: '142 69% 58%',
    500: '142 76% 36%', // Main success color
    600: '142 72% 29%',
    700: '142 64% 24%',
    800: '142 53% 20%',
    900: '143 61% 20%',
    950: '144 60% 12%',
  },

  error: {
    50: '0 86% 97%',
    100: '0 93% 94%',
    200: '0 96% 89%',
    300: '0 94% 82%',
    400: '0 91% 71%',
    500: '0 84% 60%', // Main error color
    600: '0 72% 51%',
    700: '0 74% 42%',
    800: '0 70% 35%',
    900: '0 63% 31%',
    950: '0 75% 15%',
  },

  warning: {
    50: '54 92% 95%',
    100: '55 97% 88%',
    200: '53 98% 77%',
    300: '50 98% 64%',
    400: '48 96% 53%',
    500: '38 92% 50%', // Main warning color
    600: '32 95% 44%',
    700: '26 90% 37%',
    800: '23 83% 31%',
    900: '22 78% 26%',
    950: '21 92% 14%',
  },

  info: {
    50: '204 100% 97%',
    100: '204 94% 94%',
    200: '201 94% 86%',
    300: '199 95% 74%',
    400: '198 93% 60%',
    500: '199 89% 48%', // Main info color
    600: '200 98% 39%',
    700: '201 96% 32%',
    800: '201 90% 27%',
    900: '202 80% 24%',
    950: '202 80% 16%',
  },

  // Neutral colors for text, borders, backgrounds
  neutral: {
    50: '210 20% 98%',
    100: '220 14% 96%',
    200: '220 13% 91%',
    300: '216 12% 84%',
    400: '218 11% 65%',
    500: '220 9% 46%',
    600: '215 14% 34%',
    700: '217 19% 27%',
    800: '215 28% 17%',
    900: '221 39% 11%',
    950: '224 71% 4%',
  },
} as const;

// Spacing Scale (consistent with 8px grid)
export const spacingTokens = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',   // 48px
  '4xl': '4rem',   // 64px
  '5xl': '5rem',   // 80px
  '6xl': '6rem',   // 96px
} as const;

// Typography Scale
export const typographyTokens = {
  xs: {
    fontSize: '0.75rem',    // 12px
    lineHeight: '1rem',     // 16px
    letterSpacing: '0.025em',
  },
  sm: {
    fontSize: '0.875rem',   // 14px
    lineHeight: '1.25rem',  // 20px
    letterSpacing: '0.025em',
  },
  base: {
    fontSize: '1rem',       // 16px
    lineHeight: '1.5rem',   // 24px
    letterSpacing: '0',
  },
  lg: {
    fontSize: '1.125rem',   // 18px
    lineHeight: '1.75rem',  // 28px
    letterSpacing: '-0.025em',
  },
  xl: {
    fontSize: '1.25rem',    // 20px
    lineHeight: '1.75rem',  // 28px
    letterSpacing: '-0.025em',
  },
  '2xl': {
    fontSize: '1.5rem',     // 24px
    lineHeight: '2rem',     // 32px
    letterSpacing: '-0.025em',
  },
  '3xl': {
    fontSize: '1.875rem',   // 30px
    lineHeight: '2.25rem',  // 36px
    letterSpacing: '-0.025em',
  },
  '4xl': {
    fontSize: '2.25rem',    // 36px
    lineHeight: '2.5rem',   // 40px
    letterSpacing: '-0.025em',
  },
  '5xl': {
    fontSize: '3rem',       // 48px
    lineHeight: '1',
    letterSpacing: '-0.025em',
  },
  '6xl': {
    fontSize: '3.75rem',    // 60px
    lineHeight: '1',
    letterSpacing: '-0.025em',
  },
} as const;

// Font Weight Scale
export const fontWeightTokens = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

// Border Radius Scale
export const radiusTokens = {
  none: '0',
  xs: '0.125rem',  // 2px
  sm: '0.25rem',   // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
} as const;

// Shadow Scale
export const shadowTokens = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

// Z-Index Scale
export const zIndexTokens = {
  hide: '-1',
  auto: 'auto',
  base: '0',
  docked: '10',
  dropdown: '1000',
  sticky: '1100',
  banner: '1200',
  overlay: '1300',
  modal: '1400',
  popover: '1500',
  skipLink: '1600',
  toast: '1700',
  tooltip: '1800',
} as const;

// Accessibility Constants
export const accessibilityTokens = {
  // WCAG 2.1 Level AAA minimum touch target size
  touchTarget: {
    minimum: '44px',
    comfortable: '48px',
  },
  
  // Focus ring specifications
  focusRing: {
    width: '2px',
    offset: '2px',
    color: 'hsl(var(--primary-500))',
    style: 'solid',
  },
  
  // Color contrast ratios (WCAG AA compliance)
  contrast: {
    normal: '4.5', // 4.5:1 for normal text
    large: '3',    // 3:1 for large text (18pt+ or 14pt+ bold)
    ui: '3',       // 3:1 for UI components
  },
  
  // Animation preferences
  animation: {
    // Respect user's motion preferences
    reducedMotion: 'prefers-reduced-motion: reduce',
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
  },
  
  // Screen reader only utilities
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0',
  },
} as const;

// Breakpoint tokens for responsive design
export const breakpointTokens = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1400px',
} as const;

// Transition and easing tokens
export const transitionTokens = {
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },
  
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    snappy: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
} as const;

// Export all tokens as a single object for easy access
export const designTokens = {
  colors: colorTokens,
  spacing: spacingTokens,
  typography: typographyTokens,
  fontWeight: fontWeightTokens,
  radius: radiusTokens,
  shadow: shadowTokens,
  zIndex: zIndexTokens,
  accessibility: accessibilityTokens,
  breakpoints: breakpointTokens,
  transitions: transitionTokens,
} as const;

// Type definitions for design tokens
export type ColorToken = keyof typeof colorTokens;
export type SpacingToken = keyof typeof spacingTokens;
export type TypographyToken = keyof typeof typographyTokens;
export type FontWeightToken = keyof typeof fontWeightTokens;
export type RadiusToken = keyof typeof radiusTokens;
export type ShadowToken = keyof typeof shadowTokens;
export type ZIndexToken = keyof typeof zIndexTokens;
export type BreakpointToken = keyof typeof breakpointTokens;

// Utility function to generate CSS variables from tokens
export function generateCSSVariables() {
  const cssVars: Record<string, string> = {};
  
  // Generate color variables
  Object.entries(colorTokens).forEach(([colorName, shades]) => {
    Object.entries(shades).forEach(([shade, value]) => {
      cssVars[`--${colorName}-${shade}`] = value;
    });
  });
  
  return cssVars;
}

// Utility function to get semantic color for a given context
export function getSemanticColor(context: 'success' | 'error' | 'warning' | 'info', shade: keyof typeof colorTokens.success = 500) {
  return `hsl(var(--${context}-${shade}))`;
}

// Utility function to get spacing value
export function getSpacing(size: SpacingToken): string {
  return spacingTokens[size];
}

// Utility function to get typography styles
export function getTypography(size: TypographyToken) {
  return typographyTokens[size];
}