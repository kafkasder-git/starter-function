/**
 * Design System Index
 * 
 * Central export point for all design system components and utilities.
 */

// Export all tokens
export * from './tokens.js';

// Export all variants
export * from './variants.js';

// Export all animations
export * from './animations.js';

// Re-export commonly used utilities
export {
  designTokens,
  getSemanticColor,
  getSpacing,
  getTypography,
  generateCSSVariables,
} from './tokens.js';

export {
  buttonVariants,
  inputVariants,
  cardVariants,
  badgeVariants,
  alertVariants,
  toastVariants,
  skeletonVariants,
  spinnerVariants,
  formFieldVariants,
  labelVariants,
  helperTextVariants,
  cn,
} from './variants.js';

export {
  animations,
  transitions,
  animationUtils,
  staggerAnimations,
  performanceUtils,
  tailwindAnimationConfig,
} from './animations.js';

// Type exports
export type {
  ColorToken,
  SpacingToken,
  TypographyToken,
  FontWeightToken,
  RadiusToken,
  ShadowToken,
  ZIndexToken,
  BreakpointToken,
} from './tokens.js';

export type {
  ButtonVariants,
  InputVariants,
  CardVariants,
  BadgeVariants,
  AlertVariants,
  ToastVariants,
  SkeletonVariants,
  SpinnerVariants,
  FormFieldVariants,
  LabelVariants,
  HelperTextVariants,
} from './variants.js';

export type {
  AnimationDuration,
  EasingFunction,
  KeyframeName,
  AnimationName,
  TransitionName,
} from './animations.js';