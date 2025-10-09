import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './**/*.{js,ts,jsx,tsx}',
  ],
  // Performance optimizations
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      './index.html',
      './**/*.{js,ts,jsx,tsx}',
    ],
    options: {
      safelist: [
        // Keep dynamic classes
        /^animate-/,
        /^transition-/,
        /^duration-/,
        /^ease-/,
        // Keep data attributes
        /^data-/,
        // Keep focus states
        /^focus-/,
        /^hover-/,
        /^active-/,
        // Keep responsive prefixes
        /^sm:/,
        /^md:/,
        /^lg:/,
        /^xl:/,
        /^2xl:/,
      ],
    },
  },
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
      
      // Animation Presets
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'fade-out': 'fadeOut 0.2s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-in',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-in',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      
      // Keyframes for animations
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-10px)', opacity: '0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      
      // Enhanced Color Palette
      colors: {
        // Semantic color scales
        primary: {
          50: 'hsl(var(--primary-50))',
          100: 'hsl(var(--primary-100))',
          200: 'hsl(var(--primary-200))',
          300: 'hsl(var(--primary-300))',
          400: 'hsl(var(--primary-400))',
          500: 'hsl(var(--primary-500))',
          600: 'hsl(var(--primary-600))',
          700: 'hsl(var(--primary-700))',
          800: 'hsl(var(--primary-800))',
          900: 'hsl(var(--primary-900))',
          950: 'hsl(var(--primary-950))',
        },
        success: {
          50: 'hsl(var(--success-50))',
          100: 'hsl(var(--success-100))',
          200: 'hsl(var(--success-200))',
          300: 'hsl(var(--success-300))',
          400: 'hsl(var(--success-400))',
          500: 'hsl(var(--success-500))',
          600: 'hsl(var(--success-600))',
          700: 'hsl(var(--success-700))',
          800: 'hsl(var(--success-800))',
          900: 'hsl(var(--success-900))',
          950: 'hsl(var(--success-950))',
        },
        warning: {
          50: 'hsl(var(--warning-50))',
          100: 'hsl(var(--warning-100))',
          200: 'hsl(var(--warning-200))',
          300: 'hsl(var(--warning-300))',
          400: 'hsl(var(--warning-400))',
          500: 'hsl(var(--warning-500))',
          600: 'hsl(var(--warning-600))',
          700: 'hsl(var(--warning-700))',
          800: 'hsl(var(--warning-800))',
          900: 'hsl(var(--warning-900))',
          950: 'hsl(var(--warning-950))',
        },
        error: {
          50: 'hsl(var(--error-50))',
          100: 'hsl(var(--error-100))',
          200: 'hsl(var(--error-200))',
          300: 'hsl(var(--error-300))',
          400: 'hsl(var(--error-400))',
          500: 'hsl(var(--error-500))',
          600: 'hsl(var(--error-600))',
          700: 'hsl(var(--error-700))',
          800: 'hsl(var(--error-800))',
          900: 'hsl(var(--error-900))',
          950: 'hsl(var(--error-950))',
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
      
      // Transition Timing Functions
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'snappy': 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
