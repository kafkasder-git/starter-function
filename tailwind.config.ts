import type { Config } from 'tailwindcss';
import { tailwindAnimationConfig } from './lib/design-system/animations.js';
import { colorTokens } from './lib/design-system/tokens.js';

export default {
  content: [
    './index.html',
    './**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Design Tokens - Spacing Scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // Typography Scale
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },

      // Animation system from design tokens
      ...tailwindAnimationConfig,

      // Enhanced Color Palette with Design Tokens
      colors: {
        // Design token-based colors
        ...Object.entries(colorTokens).reduce((acc, [colorName, shades]) => {
          const colorShades = shades as Record<string, string>;
          acc[colorName] = Object.entries(colorShades).reduce((shadeAcc, [shade, value]) => {
            shadeAcc[shade] = `hsl(${value})`;
            return shadeAcc;
          }, {} as Record<string, string>);
          
          // Add alpha variants for semantic colors
          if (['primary', 'success', 'error', 'warning', 'info'].includes(colorName)) {
            acc[colorName]['alpha-10'] = `hsl(${colorShades['500']} / 0.1)`;
            acc[colorName]['alpha-20'] = `hsl(${colorShades['500']} / 0.2)`;
            acc[colorName]['alpha-30'] = `hsl(${colorShades['500']} / 0.3)`;
            acc[colorName]['alpha-40'] = `hsl(${colorShades['500']} / 0.4)`;
            acc[colorName]['alpha-50'] = `hsl(${colorShades['500']} / 0.5)`;
          }
          
          return acc;
        }, {} as Record<string, Record<string, string>>),
        
        // Compatibility with existing shadcn/ui colors
        destructive: {
          DEFAULT: `hsl(${colorTokens.error[500]})`,
          foreground: `hsl(${colorTokens.error[50]})`,
        },
        muted: {
          DEFAULT: `hsl(${colorTokens.neutral[100]})`,
          foreground: `hsl(${colorTokens.neutral[600]})`,
        },
        accent: {
          DEFAULT: `hsl(${colorTokens.neutral[100]})`,
          foreground: `hsl(${colorTokens.neutral[900]})`,
        },
        popover: {
          DEFAULT: 'hsl(0 0% 100%)',
          foreground: `hsl(${colorTokens.neutral[900]})`,
        },
        card: {
          DEFAULT: 'hsl(0 0% 100%)',
          foreground: `hsl(${colorTokens.neutral[900]})`,
        },
        border: `hsl(${colorTokens.neutral[200]})`,
        input: `hsl(${colorTokens.neutral[200]})`,
        ring: `hsl(${colorTokens.primary[500]})`,
        background: 'hsl(0 0% 100%)',
        foreground: `hsl(${colorTokens.neutral[900]})`,
        secondary: {
          DEFAULT: `hsl(${colorTokens.neutral[100]})`,
          foreground: `hsl(${colorTokens.neutral[900]})`,
        },
      },

      // Enhanced Shadows
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'elevation-1': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'elevation-2': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'elevation-3': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'elevation-4': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'elevation-5': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      },

      // Container Queries Support
      container: {
        center: true,
        padding: '2rem',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1400px',
        },
      },

      // Custom Utilities
      backdropBlur: {
        xs: '2px',
      },

      // Transition Timing Functions from design tokens
      // (Already included in tailwindAnimationConfig)

      // Typography Utilities
      textWrap: {
        'balance': 'balance',
        'pretty': 'pretty',
      },
    },
  },
  plugins: [
    // Design token CSS variables injection
    function({ addBase }: { addBase: any }) {
      const cssVariables: Record<string, Record<string, string>> = {};
      
      // Generate CSS variables for colors
      Object.entries(colorTokens).forEach(([colorName, shades]) => {
        const colorShades = shades as Record<string, string>;
        Object.entries(colorShades).forEach(([shade, value]) => {
          if (!cssVariables[':root']) {
            cssVariables[':root'] = {};
          }
          cssVariables[':root'][`--${colorName}-${shade}`] = value;
        });
      });
      
      addBase(cssVariables);
    },
    
    // Typography utilities plugin
    function({ addUtilities }: { addUtilities: any }) {
      const newUtilities = {
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.text-pretty': {
          'text-wrap': 'pretty',
        },
        // Fallbacks for browsers that don't support text-wrap
        '@supports not (text-wrap: balance)': {
          '.text-balance': {
            'hyphens': 'auto',
            'word-break': 'break-word',
          },
        },
        '@supports not (text-wrap: pretty)': {
          '.text-pretty': {
            'orphans': '2',
            'widows': '2',
            'word-break': 'break-word',
          },
        },
        
        // Accessibility utilities
        '.sr-only': {
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
        '.not-sr-only': {
          position: 'static',
          width: 'auto',
          height: 'auto',
          padding: '0',
          margin: '0',
          overflow: 'visible',
          clip: 'auto',
          whiteSpace: 'normal',
        },
        
        // Focus utilities
        '.focus-ring': {
          '&:focus-visible': {
            outline: '2px solid hsl(var(--primary-500))',
            outlineOffset: '2px',
          },
        },
        
        // Touch target utilities
        '.touch-target': {
          minHeight: '44px',
          minWidth: '44px',
        },
        '.touch-target-comfortable': {
          minHeight: '48px',
          minWidth: '48px',
        },
        
        // Animation utilities with reduced motion support
        '.animate-with-motion-preference': {
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none !important',
          },
        },
      };
      addUtilities(newUtilities);
    },
  ],
} satisfies Config;
