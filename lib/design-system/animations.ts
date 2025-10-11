/**
 * Animation System
 *
 * Centralized animation configurations for consistent motion design.
 * Includes keyframes, transitions, and animation utilities.
 *
 * This file is the single source of truth for all animations in the application.
 * Animations are automatically integrated into Tailwind via tailwindAnimationConfig.
 *
 * Key Animation Features:
 * - Success checkmark animation for LoadingButton success states
 * - Shake animation for LoadingButton error states
 * - Scale-in animation for LoadingButton state transitions
 * - All animations respect prefers-reduced-motion preference
 *
 * Usage in LoadingButton:
 * - checkmark: Applied to success icon when state is 'success'
 * - shake: Applied to button content when state is 'error'
 * - scaleIn: Applied to button wrapper during success transition
 *
 * @example
 * ```tsx
 * // Tailwind class usage
 * <div className="animate-checkmark">Success!</div>
 * <div className="animate-shake">Error!</div>
 * <div className="animate-scale-in">Appearing!</div>
 * ```
 */

// Animation Duration Constants
export const animationDuration = {
  instant: '0ms',
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '700ms',
  slowest: '1000ms',
} as const;

// Easing Functions
export const easingFunctions = {
  // Standard easing curves
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',

  // Custom easing curves
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  snappy: 'cubic-bezier(0.4, 0, 0.6, 1)',
  elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',

  // Material Design easing
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
} as const;

// Keyframe Definitions
export const keyframes = {
  // Fade animations
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  fadeOut: {
    '0%': { opacity: '1' },
    '100%': { opacity: '0' },
  },

  // Slide animations
  slideInFromTop: {
    '0%': { transform: 'translateY(-100%)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  slideInFromBottom: {
    '0%': { transform: 'translateY(100%)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  slideInFromLeft: {
    '0%': { transform: 'translateX(-100%)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' },
  },
  slideInFromRight: {
    '0%': { transform: 'translateX(100%)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' },
  },
  slideOutToTop: {
    '0%': { transform: 'translateY(0)', opacity: '1' },
    '100%': { transform: 'translateY(-100%)', opacity: '0' },
  },
  slideOutToBottom: {
    '0%': { transform: 'translateY(0)', opacity: '1' },
    '100%': { transform: 'translateY(100%)', opacity: '0' },
  },
  slideOutToLeft: {
    '0%': { transform: 'translateX(0)', opacity: '1' },
    '100%': { transform: 'translateX(-100%)', opacity: '0' },
  },
  slideOutToRight: {
    '0%': { transform: 'translateX(0)', opacity: '1' },
    '100%': { transform: 'translateX(100%)', opacity: '0' },
  },

  // Scale animations
  scaleIn: {
    '0%': { transform: 'scale(0.95)', opacity: '0' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  },
  scaleOut: {
    '0%': { transform: 'scale(1)', opacity: '1' },
    '100%': { transform: 'scale(0.95)', opacity: '0' },
  },

  // Zoom animations
  zoomIn: {
    '0%': { transform: 'scale(0)', opacity: '0' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  },
  zoomOut: {
    '0%': { transform: 'scale(1)', opacity: '1' },
    '100%': { transform: 'scale(0)', opacity: '0' },
  },

  // Bounce animations
  bounceIn: {
    '0%': { transform: 'scale(0.3)', opacity: '0' },
    '50%': { transform: 'scale(1.05)', opacity: '1' },
    '70%': { transform: 'scale(0.9)' },
    '100%': { transform: 'scale(1)' },
  },
  bounceOut: {
    '0%': { transform: 'scale(1)' },
    '25%': { transform: 'scale(0.95)' },
    '50%': { transform: 'scale(1.02)' },
    '100%': { transform: 'scale(0)', opacity: '0' },
  },

  // Shake animation for errors
  shake: {
    '0%, 100%': { transform: 'translateX(0)' },
    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
    '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
  },

  // Pulse animations
  pulse: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.5' },
  },
  pulseSubtle: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.8' },
  },

  // Spin animation
  spin: {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },

  // Shimmer effect for skeleton loaders
  shimmer: {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' },
  },

  // Progress bar animation
  progress: {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(0%)' },
  },

  // Accordion animations
  accordionDown: {
    '0%': { height: '0', opacity: '0' },
    '100%': { height: 'var(--radix-accordion-content-height)', opacity: '1' },
  },
  accordionUp: {
    '0%': { height: 'var(--radix-accordion-content-height)', opacity: '1' },
    '100%': { height: '0', opacity: '0' },
  },

  // Collapsible animations
  collapsibleDown: {
    '0%': { height: '0' },
    '100%': { height: 'var(--radix-collapsible-content-height)' },
  },
  collapsibleUp: {
    '0%': { height: 'var(--radix-collapsible-content-height)' },
    '100%': { height: '0' },
  },

  // Toast animations
  toastSlideInFromTop: {
    '0%': { transform: 'translateY(-100%)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  toastSlideInFromBottom: {
    '0%': { transform: 'translateY(100%)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  toastSlideOutToTop: {
    '0%': { transform: 'translateY(0)', opacity: '1' },
    '100%': { transform: 'translateY(-100%)', opacity: '0' },
  },
  toastSlideOutToBottom: {
    '0%': { transform: 'translateY(0)', opacity: '1' },
    '100%': { transform: 'translateY(100%)', opacity: '0' },
  },

  // Success checkmark animation
  checkmark: {
    '0%': { strokeDashoffset: '16' },
    '100%': { strokeDashoffset: '0' },
  },

  // Loading dots animation
  loadingDots: {
    '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0.5' },
    '40%': { transform: 'scale(1)', opacity: '1' },
  },
} as const;

// Pre-configured Animation Classes
export const animations = {
  // Entrance animations
  fadeIn: `fadeIn ${animationDuration.normal} ${easingFunctions.easeOut}`,
  slideInFromTop: `slideInFromTop ${animationDuration.normal} ${easingFunctions.easeOut}`,
  slideInFromBottom: `slideInFromBottom ${animationDuration.normal} ${easingFunctions.easeOut}`,
  slideInFromLeft: `slideInFromLeft ${animationDuration.normal} ${easingFunctions.easeOut}`,
  slideInFromRight: `slideInFromRight ${animationDuration.normal} ${easingFunctions.easeOut}`,
  scaleIn: `scaleIn ${animationDuration.fast} ${easingFunctions.easeOut}`,
  zoomIn: `zoomIn ${animationDuration.normal} ${easingFunctions.bounce}`,
  bounceIn: `bounceIn ${animationDuration.slow} ${easingFunctions.easeOut}`,

  // Exit animations
  fadeOut: `fadeOut ${animationDuration.fast} ${easingFunctions.easeIn}`,
  slideOutToTop: `slideOutToTop ${animationDuration.fast} ${easingFunctions.easeIn}`,
  slideOutToBottom: `slideOutToBottom ${animationDuration.fast} ${easingFunctions.easeIn}`,
  slideOutToLeft: `slideOutToLeft ${animationDuration.fast} ${easingFunctions.easeIn}`,
  slideOutToRight: `slideOutToRight ${animationDuration.fast} ${easingFunctions.easeIn}`,
  scaleOut: `scaleOut ${animationDuration.fast} ${easingFunctions.easeIn}`,
  zoomOut: `zoomOut ${animationDuration.fast} ${easingFunctions.easeIn}`,
  bounceOut: `bounceOut ${animationDuration.normal} ${easingFunctions.easeIn}`,

  // Feedback animations
  shake: `shake ${animationDuration.slow} ${easingFunctions.easeInOut}`,
  pulse: `pulse ${animationDuration.slower} ${easingFunctions.easeInOut} infinite`,
  pulseSubtle: `pulseSubtle 2s ${easingFunctions.easeInOut} infinite`,

  // Loading animations
  spin: `spin 1s ${easingFunctions.linear} infinite`,
  shimmer: `shimmer 2s ${easingFunctions.linear} infinite`,
  loadingDots: `loadingDots 1.4s ${easingFunctions.easeInOut} infinite`,

  // Component-specific animations
  accordionDown: `accordionDown ${animationDuration.normal} ${easingFunctions.easeOut}`,
  accordionUp: `accordionUp ${animationDuration.normal} ${easingFunctions.easeOut}`,
  collapsibleDown: `collapsibleDown ${animationDuration.normal} ${easingFunctions.easeOut}`,
  collapsibleUp: `collapsibleUp ${animationDuration.normal} ${easingFunctions.easeOut}`,

  // Toast animations
  toastSlideInFromTop: `toastSlideInFromTop ${animationDuration.normal} ${easingFunctions.easeOut}`,
  toastSlideInFromBottom: `toastSlideInFromBottom ${animationDuration.normal} ${easingFunctions.easeOut}`,
  toastSlideOutToTop: `toastSlideOutToTop ${animationDuration.fast} ${easingFunctions.easeIn}`,
  toastSlideOutToBottom: `toastSlideOutToBottom ${animationDuration.fast} ${easingFunctions.easeIn}`,

  // Success animation
  checkmark: `checkmark ${animationDuration.slow} ${easingFunctions.easeOut}`,
} as const;

// Transition Utilities
export const transitions = {
  // Common transitions
  all: `all ${animationDuration.normal} ${easingFunctions.easeInOut}`,
  colors: `color ${animationDuration.fast} ${easingFunctions.easeInOut}, background-color ${animationDuration.fast} ${easingFunctions.easeInOut}, border-color ${animationDuration.fast} ${easingFunctions.easeInOut}`,
  opacity: `opacity ${animationDuration.fast} ${easingFunctions.easeInOut}`,
  shadow: `box-shadow ${animationDuration.fast} ${easingFunctions.easeInOut}`,
  transform: `transform ${animationDuration.fast} ${easingFunctions.easeInOut}`,

  // Hover transitions
  hover: `all ${animationDuration.fast} ${easingFunctions.easeOut}`,
  hoverSlow: `all ${animationDuration.normal} ${easingFunctions.easeOut}`,

  // Focus transitions
  focus: `all ${animationDuration.fast} ${easingFunctions.easeOut}`,
} as const;

// Animation Utilities
export const animationUtils = {
  // Reduced motion support
  respectMotionPreference: (animation: string) => `
    @media (prefers-reduced-motion: no-preference) {
      animation: ${animation};
    }
    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,

  // Animation delay utilities
  delay: {
    none: '0ms',
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },

  // Animation fill modes
  fillMode: {
    none: 'none',
    forwards: 'forwards',
    backwards: 'backwards',
    both: 'both',
  },

  // Animation iteration counts
  iterationCount: {
    1: '1',
    2: '2',
    3: '3',
    infinite: 'infinite',
  },

  // Animation play states
  playState: {
    running: 'running',
    paused: 'paused',
  },
} as const;

// Stagger Animation Utilities
export const staggerAnimations = {
  // Stagger delays for list items
  staggerDelay: (index: number, baseDelay: number = 50) => `${index * baseDelay}ms`,

  // Stagger animation for multiple elements
  createStaggeredAnimation: (
    animation: string,
    itemCount: number,
    staggerDelay: number = 50
  ) => {
    const animations: Record<string, string> = {};
    for (let i = 0; i < itemCount; i++) {
      animations[`.stagger-${i}`] = `${animation} ${i * staggerDelay}ms`;
    }
    return animations;
  },
} as const;

// Performance Optimization Utilities
export const performanceUtils = {
  // GPU acceleration
  gpuAcceleration: 'transform: translateZ(0)',

  // Will-change optimization
  willChange: {
    auto: 'auto',
    scroll: 'scroll-position',
    contents: 'contents',
    transform: 'transform',
    opacity: 'opacity',
  },

  // Contain property for performance
  contain: {
    none: 'none',
    strict: 'strict',
    content: 'content',
    size: 'size',
    layout: 'layout',
    style: 'style',
    paint: 'paint',
  },
} as const;

// Export animation configuration for Tailwind
export const tailwindAnimationConfig = {
  keyframes,
  animation: {
    // Entrance animations
    'fade-in': animations.fadeIn,
    'slide-in-from-top': animations.slideInFromTop,
    'slide-in-from-bottom': animations.slideInFromBottom,
    'slide-in-from-left': animations.slideInFromLeft,
    'slide-in-from-right': animations.slideInFromRight,
    'scale-in': animations.scaleIn,
    'zoom-in': animations.zoomIn,
    'bounce-in': animations.bounceIn,

    // Exit animations
    'fade-out': animations.fadeOut,
    'slide-out-to-top': animations.slideOutToTop,
    'slide-out-to-bottom': animations.slideOutToBottom,
    'slide-out-to-left': animations.slideOutToLeft,
    'slide-out-to-right': animations.slideOutToRight,
    'scale-out': animations.scaleOut,
    'zoom-out': animations.zoomOut,
    'bounce-out': animations.bounceOut,

    // Feedback animations
    'shake': animations.shake,
    'pulse': animations.pulse,
    'pulse-subtle': animations.pulseSubtle,

    // Loading animations
    'spin': animations.spin,
    'shimmer': animations.shimmer,
    'loading-dots': animations.loadingDots,

    // Component animations
    'accordion-down': animations.accordionDown,
    'accordion-up': animations.accordionUp,
    'collapsible-down': animations.collapsibleDown,
    'collapsible-up': animations.collapsibleUp,

    // Toast animations
    'toast-slide-in-from-top': animations.toastSlideInFromTop,
    'toast-slide-in-from-bottom': animations.toastSlideInFromBottom,
    'toast-slide-out-to-top': animations.toastSlideOutToTop,
    'toast-slide-out-to-bottom': animations.toastSlideOutToBottom,

    // Success animation
    'checkmark': animations.checkmark,
  },
  transitionTimingFunction: easingFunctions,
  transitionDuration: animationDuration,
};

// Type definitions
export type AnimationDuration = keyof typeof animationDuration;
export type EasingFunction = keyof typeof easingFunctions;
export type KeyframeName = keyof typeof keyframes;
export type AnimationName = keyof typeof animations;
export type TransitionName = keyof typeof transitions;
