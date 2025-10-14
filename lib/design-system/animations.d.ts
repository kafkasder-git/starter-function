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
export declare const animationDuration: {
    readonly instant: "0ms";
    readonly fast: "150ms";
    readonly normal: "300ms";
    readonly slow: "500ms";
    readonly slower: "700ms";
    readonly slowest: "1000ms";
};
export declare const easingFunctions: {
    readonly linear: "linear";
    readonly easeIn: "cubic-bezier(0.4, 0, 1, 1)";
    readonly easeOut: "cubic-bezier(0, 0, 0.2, 1)";
    readonly easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)";
    readonly bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)";
    readonly smooth: "cubic-bezier(0.4, 0, 0.2, 1)";
    readonly snappy: "cubic-bezier(0.4, 0, 0.6, 1)";
    readonly elastic: "cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    readonly standard: "cubic-bezier(0.4, 0.0, 0.2, 1)";
    readonly decelerate: "cubic-bezier(0.0, 0.0, 0.2, 1)";
    readonly accelerate: "cubic-bezier(0.4, 0.0, 1, 1)";
    readonly sharp: "cubic-bezier(0.4, 0.0, 0.6, 1)";
};
export declare const keyframes: {
    readonly fadeIn: {
        readonly '0%': {
            readonly opacity: "0";
        };
        readonly '100%': {
            readonly opacity: "1";
        };
    };
    readonly fadeOut: {
        readonly '0%': {
            readonly opacity: "1";
        };
        readonly '100%': {
            readonly opacity: "0";
        };
    };
    readonly slideInFromTop: {
        readonly '0%': {
            readonly transform: "translateY(-100%)";
            readonly opacity: "0";
        };
        readonly '100%': {
            readonly transform: "translateY(0)";
            readonly opacity: "1";
        };
    };
    readonly slideInFromBottom: {
        readonly '0%': {
            readonly transform: "translateY(100%)";
            readonly opacity: "0";
        };
        readonly '100%': {
            readonly transform: "translateY(0)";
            readonly opacity: "1";
        };
    };
    readonly slideInFromLeft: {
        readonly '0%': {
            readonly transform: "translateX(-100%)";
            readonly opacity: "0";
        };
        readonly '100%': {
            readonly transform: "translateX(0)";
            readonly opacity: "1";
        };
    };
    readonly slideInFromRight: {
        readonly '0%': {
            readonly transform: "translateX(100%)";
            readonly opacity: "0";
        };
        readonly '100%': {
            readonly transform: "translateX(0)";
            readonly opacity: "1";
        };
    };
    readonly slideOutToTop: {
        readonly '0%': {
            readonly transform: "translateY(0)";
            readonly opacity: "1";
        };
        readonly '100%': {
            readonly transform: "translateY(-100%)";
            readonly opacity: "0";
        };
    };
    readonly slideOutToBottom: {
        readonly '0%': {
            readonly transform: "translateY(0)";
            readonly opacity: "1";
        };
        readonly '100%': {
            readonly transform: "translateY(100%)";
            readonly opacity: "0";
        };
    };
    readonly slideOutToLeft: {
        readonly '0%': {
            readonly transform: "translateX(0)";
            readonly opacity: "1";
        };
        readonly '100%': {
            readonly transform: "translateX(-100%)";
            readonly opacity: "0";
        };
    };
    readonly slideOutToRight: {
        readonly '0%': {
            readonly transform: "translateX(0)";
            readonly opacity: "1";
        };
        readonly '100%': {
            readonly transform: "translateX(100%)";
            readonly opacity: "0";
        };
    };
    readonly scaleIn: {
        readonly '0%': {
            readonly transform: "scale(0.95)";
            readonly opacity: "0";
        };
        readonly '100%': {
            readonly transform: "scale(1)";
            readonly opacity: "1";
        };
    };
    readonly scaleOut: {
        readonly '0%': {
            readonly transform: "scale(1)";
            readonly opacity: "1";
        };
        readonly '100%': {
            readonly transform: "scale(0.95)";
            readonly opacity: "0";
        };
    };
    readonly zoomIn: {
        readonly '0%': {
            readonly transform: "scale(0)";
            readonly opacity: "0";
        };
        readonly '100%': {
            readonly transform: "scale(1)";
            readonly opacity: "1";
        };
    };
    readonly zoomOut: {
        readonly '0%': {
            readonly transform: "scale(1)";
            readonly opacity: "1";
        };
        readonly '100%': {
            readonly transform: "scale(0)";
            readonly opacity: "0";
        };
    };
    readonly bounceIn: {
        readonly '0%': {
            readonly transform: "scale(0.3)";
            readonly opacity: "0";
        };
        readonly '50%': {
            readonly transform: "scale(1.05)";
            readonly opacity: "1";
        };
        readonly '70%': {
            readonly transform: "scale(0.9)";
        };
        readonly '100%': {
            readonly transform: "scale(1)";
        };
    };
    readonly bounceOut: {
        readonly '0%': {
            readonly transform: "scale(1)";
        };
        readonly '25%': {
            readonly transform: "scale(0.95)";
        };
        readonly '50%': {
            readonly transform: "scale(1.02)";
        };
        readonly '100%': {
            readonly transform: "scale(0)";
            readonly opacity: "0";
        };
    };
    readonly shake: {
        readonly '0%, 100%': {
            readonly transform: "translateX(0)";
        };
        readonly '10%, 30%, 50%, 70%, 90%': {
            readonly transform: "translateX(-4px)";
        };
        readonly '20%, 40%, 60%, 80%': {
            readonly transform: "translateX(4px)";
        };
    };
    readonly pulse: {
        readonly '0%, 100%': {
            readonly opacity: "1";
        };
        readonly '50%': {
            readonly opacity: "0.5";
        };
    };
    readonly pulseSubtle: {
        readonly '0%, 100%': {
            readonly opacity: "1";
        };
        readonly '50%': {
            readonly opacity: "0.8";
        };
    };
    readonly spin: {
        readonly '0%': {
            readonly transform: "rotate(0deg)";
        };
        readonly '100%': {
            readonly transform: "rotate(360deg)";
        };
    };
    readonly shimmer: {
        readonly '0%': {
            readonly transform: "translateX(-100%)";
        };
        readonly '100%': {
            readonly transform: "translateX(100%)";
        };
    };
    readonly progress: {
        readonly '0%': {
            readonly transform: "translateX(-100%)";
        };
        readonly '100%': {
            readonly transform: "translateX(0%)";
        };
    };
    readonly accordionDown: {
        readonly '0%': {
            readonly height: "0";
            readonly opacity: "0";
        };
        readonly '100%': {
            readonly height: "var(--radix-accordion-content-height)";
            readonly opacity: "1";
        };
    };
    readonly accordionUp: {
        readonly '0%': {
            readonly height: "var(--radix-accordion-content-height)";
            readonly opacity: "1";
        };
        readonly '100%': {
            readonly height: "0";
            readonly opacity: "0";
        };
    };
    readonly collapsibleDown: {
        readonly '0%': {
            readonly height: "0";
        };
        readonly '100%': {
            readonly height: "var(--radix-collapsible-content-height)";
        };
    };
    readonly collapsibleUp: {
        readonly '0%': {
            readonly height: "var(--radix-collapsible-content-height)";
        };
        readonly '100%': {
            readonly height: "0";
        };
    };
    readonly toastSlideInFromTop: {
        readonly '0%': {
            readonly transform: "translateY(-100%)";
            readonly opacity: "0";
        };
        readonly '100%': {
            readonly transform: "translateY(0)";
            readonly opacity: "1";
        };
    };
    readonly toastSlideInFromBottom: {
        readonly '0%': {
            readonly transform: "translateY(100%)";
            readonly opacity: "0";
        };
        readonly '100%': {
            readonly transform: "translateY(0)";
            readonly opacity: "1";
        };
    };
    readonly toastSlideOutToTop: {
        readonly '0%': {
            readonly transform: "translateY(0)";
            readonly opacity: "1";
        };
        readonly '100%': {
            readonly transform: "translateY(-100%)";
            readonly opacity: "0";
        };
    };
    readonly toastSlideOutToBottom: {
        readonly '0%': {
            readonly transform: "translateY(0)";
            readonly opacity: "1";
        };
        readonly '100%': {
            readonly transform: "translateY(100%)";
            readonly opacity: "0";
        };
    };
    readonly checkmark: {
        readonly '0%': {
            readonly strokeDashoffset: "16";
        };
        readonly '100%': {
            readonly strokeDashoffset: "0";
        };
    };
    readonly loadingDots: {
        readonly '0%, 80%, 100%': {
            readonly transform: "scale(0)";
            readonly opacity: "0.5";
        };
        readonly '40%': {
            readonly transform: "scale(1)";
            readonly opacity: "1";
        };
    };
};
export declare const animations: {
    readonly fadeIn: "fadeIn 300ms cubic-bezier(0, 0, 0.2, 1)";
    readonly slideInFromTop: "slideInFromTop 300ms cubic-bezier(0, 0, 0.2, 1)";
    readonly slideInFromBottom: "slideInFromBottom 300ms cubic-bezier(0, 0, 0.2, 1)";
    readonly slideInFromLeft: "slideInFromLeft 300ms cubic-bezier(0, 0, 0.2, 1)";
    readonly slideInFromRight: "slideInFromRight 300ms cubic-bezier(0, 0, 0.2, 1)";
    readonly scaleIn: "scaleIn 150ms cubic-bezier(0, 0, 0.2, 1)";
    readonly zoomIn: "zoomIn 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)";
    readonly bounceIn: "bounceIn 500ms cubic-bezier(0, 0, 0.2, 1)";
    readonly fadeOut: "fadeOut 150ms cubic-bezier(0.4, 0, 1, 1)";
    readonly slideOutToTop: "slideOutToTop 150ms cubic-bezier(0.4, 0, 1, 1)";
    readonly slideOutToBottom: "slideOutToBottom 150ms cubic-bezier(0.4, 0, 1, 1)";
    readonly slideOutToLeft: "slideOutToLeft 150ms cubic-bezier(0.4, 0, 1, 1)";
    readonly slideOutToRight: "slideOutToRight 150ms cubic-bezier(0.4, 0, 1, 1)";
    readonly scaleOut: "scaleOut 150ms cubic-bezier(0.4, 0, 1, 1)";
    readonly zoomOut: "zoomOut 150ms cubic-bezier(0.4, 0, 1, 1)";
    readonly bounceOut: "bounceOut 300ms cubic-bezier(0.4, 0, 1, 1)";
    readonly shake: "shake 500ms cubic-bezier(0.4, 0, 0.2, 1)";
    readonly pulse: "pulse 700ms cubic-bezier(0.4, 0, 0.2, 1) infinite";
    readonly pulseSubtle: "pulseSubtle 2s cubic-bezier(0.4, 0, 0.2, 1) infinite";
    readonly spin: "spin 1s linear infinite";
    readonly shimmer: "shimmer 2s linear infinite";
    readonly loadingDots: "loadingDots 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite";
    readonly accordionDown: "accordionDown 300ms cubic-bezier(0, 0, 0.2, 1)";
    readonly accordionUp: "accordionUp 300ms cubic-bezier(0, 0, 0.2, 1)";
    readonly collapsibleDown: "collapsibleDown 300ms cubic-bezier(0, 0, 0.2, 1)";
    readonly collapsibleUp: "collapsibleUp 300ms cubic-bezier(0, 0, 0.2, 1)";
    readonly toastSlideInFromTop: "toastSlideInFromTop 300ms cubic-bezier(0, 0, 0.2, 1)";
    readonly toastSlideInFromBottom: "toastSlideInFromBottom 300ms cubic-bezier(0, 0, 0.2, 1)";
    readonly toastSlideOutToTop: "toastSlideOutToTop 150ms cubic-bezier(0.4, 0, 1, 1)";
    readonly toastSlideOutToBottom: "toastSlideOutToBottom 150ms cubic-bezier(0.4, 0, 1, 1)";
    readonly checkmark: "checkmark 500ms cubic-bezier(0, 0, 0.2, 1)";
};
export declare const transitions: {
    readonly all: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)";
    readonly colors: "color 150ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)";
    readonly opacity: "opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)";
    readonly shadow: "box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)";
    readonly transform: "transform 150ms cubic-bezier(0.4, 0, 0.2, 1)";
    readonly hover: "all 150ms cubic-bezier(0, 0, 0.2, 1)";
    readonly hoverSlow: "all 300ms cubic-bezier(0, 0, 0.2, 1)";
    readonly focus: "all 150ms cubic-bezier(0, 0, 0.2, 1)";
};
export declare const animationUtils: {
    readonly respectMotionPreference: (animation: string) => string;
    readonly delay: {
        readonly none: "0ms";
        readonly 75: "75ms";
        readonly 100: "100ms";
        readonly 150: "150ms";
        readonly 200: "200ms";
        readonly 300: "300ms";
        readonly 500: "500ms";
        readonly 700: "700ms";
        readonly 1000: "1000ms";
    };
    readonly fillMode: {
        readonly none: "none";
        readonly forwards: "forwards";
        readonly backwards: "backwards";
        readonly both: "both";
    };
    readonly iterationCount: {
        readonly 1: "1";
        readonly 2: "2";
        readonly 3: "3";
        readonly infinite: "infinite";
    };
    readonly playState: {
        readonly running: "running";
        readonly paused: "paused";
    };
};
export declare const staggerAnimations: {
    readonly staggerDelay: (index: number, baseDelay?: number) => string;
    readonly createStaggeredAnimation: (animation: string, itemCount: number, staggerDelay?: number) => Record<string, string>;
};
export declare const performanceUtils: {
    readonly gpuAcceleration: "transform: translateZ(0)";
    readonly willChange: {
        readonly auto: "auto";
        readonly scroll: "scroll-position";
        readonly contents: "contents";
        readonly transform: "transform";
        readonly opacity: "opacity";
    };
    readonly contain: {
        readonly none: "none";
        readonly strict: "strict";
        readonly content: "content";
        readonly size: "size";
        readonly layout: "layout";
        readonly style: "style";
        readonly paint: "paint";
    };
};
export declare const tailwindAnimationConfig: {
    keyframes: {
        readonly fadeIn: {
            readonly '0%': {
                readonly opacity: "0";
            };
            readonly '100%': {
                readonly opacity: "1";
            };
        };
        readonly fadeOut: {
            readonly '0%': {
                readonly opacity: "1";
            };
            readonly '100%': {
                readonly opacity: "0";
            };
        };
        readonly slideInFromTop: {
            readonly '0%': {
                readonly transform: "translateY(-100%)";
                readonly opacity: "0";
            };
            readonly '100%': {
                readonly transform: "translateY(0)";
                readonly opacity: "1";
            };
        };
        readonly slideInFromBottom: {
            readonly '0%': {
                readonly transform: "translateY(100%)";
                readonly opacity: "0";
            };
            readonly '100%': {
                readonly transform: "translateY(0)";
                readonly opacity: "1";
            };
        };
        readonly slideInFromLeft: {
            readonly '0%': {
                readonly transform: "translateX(-100%)";
                readonly opacity: "0";
            };
            readonly '100%': {
                readonly transform: "translateX(0)";
                readonly opacity: "1";
            };
        };
        readonly slideInFromRight: {
            readonly '0%': {
                readonly transform: "translateX(100%)";
                readonly opacity: "0";
            };
            readonly '100%': {
                readonly transform: "translateX(0)";
                readonly opacity: "1";
            };
        };
        readonly slideOutToTop: {
            readonly '0%': {
                readonly transform: "translateY(0)";
                readonly opacity: "1";
            };
            readonly '100%': {
                readonly transform: "translateY(-100%)";
                readonly opacity: "0";
            };
        };
        readonly slideOutToBottom: {
            readonly '0%': {
                readonly transform: "translateY(0)";
                readonly opacity: "1";
            };
            readonly '100%': {
                readonly transform: "translateY(100%)";
                readonly opacity: "0";
            };
        };
        readonly slideOutToLeft: {
            readonly '0%': {
                readonly transform: "translateX(0)";
                readonly opacity: "1";
            };
            readonly '100%': {
                readonly transform: "translateX(-100%)";
                readonly opacity: "0";
            };
        };
        readonly slideOutToRight: {
            readonly '0%': {
                readonly transform: "translateX(0)";
                readonly opacity: "1";
            };
            readonly '100%': {
                readonly transform: "translateX(100%)";
                readonly opacity: "0";
            };
        };
        readonly scaleIn: {
            readonly '0%': {
                readonly transform: "scale(0.95)";
                readonly opacity: "0";
            };
            readonly '100%': {
                readonly transform: "scale(1)";
                readonly opacity: "1";
            };
        };
        readonly scaleOut: {
            readonly '0%': {
                readonly transform: "scale(1)";
                readonly opacity: "1";
            };
            readonly '100%': {
                readonly transform: "scale(0.95)";
                readonly opacity: "0";
            };
        };
        readonly zoomIn: {
            readonly '0%': {
                readonly transform: "scale(0)";
                readonly opacity: "0";
            };
            readonly '100%': {
                readonly transform: "scale(1)";
                readonly opacity: "1";
            };
        };
        readonly zoomOut: {
            readonly '0%': {
                readonly transform: "scale(1)";
                readonly opacity: "1";
            };
            readonly '100%': {
                readonly transform: "scale(0)";
                readonly opacity: "0";
            };
        };
        readonly bounceIn: {
            readonly '0%': {
                readonly transform: "scale(0.3)";
                readonly opacity: "0";
            };
            readonly '50%': {
                readonly transform: "scale(1.05)";
                readonly opacity: "1";
            };
            readonly '70%': {
                readonly transform: "scale(0.9)";
            };
            readonly '100%': {
                readonly transform: "scale(1)";
            };
        };
        readonly bounceOut: {
            readonly '0%': {
                readonly transform: "scale(1)";
            };
            readonly '25%': {
                readonly transform: "scale(0.95)";
            };
            readonly '50%': {
                readonly transform: "scale(1.02)";
            };
            readonly '100%': {
                readonly transform: "scale(0)";
                readonly opacity: "0";
            };
        };
        readonly shake: {
            readonly '0%, 100%': {
                readonly transform: "translateX(0)";
            };
            readonly '10%, 30%, 50%, 70%, 90%': {
                readonly transform: "translateX(-4px)";
            };
            readonly '20%, 40%, 60%, 80%': {
                readonly transform: "translateX(4px)";
            };
        };
        readonly pulse: {
            readonly '0%, 100%': {
                readonly opacity: "1";
            };
            readonly '50%': {
                readonly opacity: "0.5";
            };
        };
        readonly pulseSubtle: {
            readonly '0%, 100%': {
                readonly opacity: "1";
            };
            readonly '50%': {
                readonly opacity: "0.8";
            };
        };
        readonly spin: {
            readonly '0%': {
                readonly transform: "rotate(0deg)";
            };
            readonly '100%': {
                readonly transform: "rotate(360deg)";
            };
        };
        readonly shimmer: {
            readonly '0%': {
                readonly transform: "translateX(-100%)";
            };
            readonly '100%': {
                readonly transform: "translateX(100%)";
            };
        };
        readonly progress: {
            readonly '0%': {
                readonly transform: "translateX(-100%)";
            };
            readonly '100%': {
                readonly transform: "translateX(0%)";
            };
        };
        readonly accordionDown: {
            readonly '0%': {
                readonly height: "0";
                readonly opacity: "0";
            };
            readonly '100%': {
                readonly height: "var(--radix-accordion-content-height)";
                readonly opacity: "1";
            };
        };
        readonly accordionUp: {
            readonly '0%': {
                readonly height: "var(--radix-accordion-content-height)";
                readonly opacity: "1";
            };
            readonly '100%': {
                readonly height: "0";
                readonly opacity: "0";
            };
        };
        readonly collapsibleDown: {
            readonly '0%': {
                readonly height: "0";
            };
            readonly '100%': {
                readonly height: "var(--radix-collapsible-content-height)";
            };
        };
        readonly collapsibleUp: {
            readonly '0%': {
                readonly height: "var(--radix-collapsible-content-height)";
            };
            readonly '100%': {
                readonly height: "0";
            };
        };
        readonly toastSlideInFromTop: {
            readonly '0%': {
                readonly transform: "translateY(-100%)";
                readonly opacity: "0";
            };
            readonly '100%': {
                readonly transform: "translateY(0)";
                readonly opacity: "1";
            };
        };
        readonly toastSlideInFromBottom: {
            readonly '0%': {
                readonly transform: "translateY(100%)";
                readonly opacity: "0";
            };
            readonly '100%': {
                readonly transform: "translateY(0)";
                readonly opacity: "1";
            };
        };
        readonly toastSlideOutToTop: {
            readonly '0%': {
                readonly transform: "translateY(0)";
                readonly opacity: "1";
            };
            readonly '100%': {
                readonly transform: "translateY(-100%)";
                readonly opacity: "0";
            };
        };
        readonly toastSlideOutToBottom: {
            readonly '0%': {
                readonly transform: "translateY(0)";
                readonly opacity: "1";
            };
            readonly '100%': {
                readonly transform: "translateY(100%)";
                readonly opacity: "0";
            };
        };
        readonly checkmark: {
            readonly '0%': {
                readonly strokeDashoffset: "16";
            };
            readonly '100%': {
                readonly strokeDashoffset: "0";
            };
        };
        readonly loadingDots: {
            readonly '0%, 80%, 100%': {
                readonly transform: "scale(0)";
                readonly opacity: "0.5";
            };
            readonly '40%': {
                readonly transform: "scale(1)";
                readonly opacity: "1";
            };
        };
    };
    animation: {
        'fade-in': "fadeIn 300ms cubic-bezier(0, 0, 0.2, 1)";
        'slide-in-from-top': "slideInFromTop 300ms cubic-bezier(0, 0, 0.2, 1)";
        'slide-in-from-bottom': "slideInFromBottom 300ms cubic-bezier(0, 0, 0.2, 1)";
        'slide-in-from-left': "slideInFromLeft 300ms cubic-bezier(0, 0, 0.2, 1)";
        'slide-in-from-right': "slideInFromRight 300ms cubic-bezier(0, 0, 0.2, 1)";
        'scale-in': "scaleIn 150ms cubic-bezier(0, 0, 0.2, 1)";
        'zoom-in': "zoomIn 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)";
        'bounce-in': "bounceIn 500ms cubic-bezier(0, 0, 0.2, 1)";
        'fade-out': "fadeOut 150ms cubic-bezier(0.4, 0, 1, 1)";
        'slide-out-to-top': "slideOutToTop 150ms cubic-bezier(0.4, 0, 1, 1)";
        'slide-out-to-bottom': "slideOutToBottom 150ms cubic-bezier(0.4, 0, 1, 1)";
        'slide-out-to-left': "slideOutToLeft 150ms cubic-bezier(0.4, 0, 1, 1)";
        'slide-out-to-right': "slideOutToRight 150ms cubic-bezier(0.4, 0, 1, 1)";
        'scale-out': "scaleOut 150ms cubic-bezier(0.4, 0, 1, 1)";
        'zoom-out': "zoomOut 150ms cubic-bezier(0.4, 0, 1, 1)";
        'bounce-out': "bounceOut 300ms cubic-bezier(0.4, 0, 1, 1)";
        shake: "shake 500ms cubic-bezier(0.4, 0, 0.2, 1)";
        pulse: "pulse 700ms cubic-bezier(0.4, 0, 0.2, 1) infinite";
        'pulse-subtle': "pulseSubtle 2s cubic-bezier(0.4, 0, 0.2, 1) infinite";
        spin: "spin 1s linear infinite";
        shimmer: "shimmer 2s linear infinite";
        'loading-dots': "loadingDots 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite";
        'accordion-down': "accordionDown 300ms cubic-bezier(0, 0, 0.2, 1)";
        'accordion-up': "accordionUp 300ms cubic-bezier(0, 0, 0.2, 1)";
        'collapsible-down': "collapsibleDown 300ms cubic-bezier(0, 0, 0.2, 1)";
        'collapsible-up': "collapsibleUp 300ms cubic-bezier(0, 0, 0.2, 1)";
        'toast-slide-in-from-top': "toastSlideInFromTop 300ms cubic-bezier(0, 0, 0.2, 1)";
        'toast-slide-in-from-bottom': "toastSlideInFromBottom 300ms cubic-bezier(0, 0, 0.2, 1)";
        'toast-slide-out-to-top': "toastSlideOutToTop 150ms cubic-bezier(0.4, 0, 1, 1)";
        'toast-slide-out-to-bottom': "toastSlideOutToBottom 150ms cubic-bezier(0.4, 0, 1, 1)";
        checkmark: "checkmark 500ms cubic-bezier(0, 0, 0.2, 1)";
    };
    transitionTimingFunction: {
        readonly linear: "linear";
        readonly easeIn: "cubic-bezier(0.4, 0, 1, 1)";
        readonly easeOut: "cubic-bezier(0, 0, 0.2, 1)";
        readonly easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)";
        readonly bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)";
        readonly smooth: "cubic-bezier(0.4, 0, 0.2, 1)";
        readonly snappy: "cubic-bezier(0.4, 0, 0.6, 1)";
        readonly elastic: "cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        readonly standard: "cubic-bezier(0.4, 0.0, 0.2, 1)";
        readonly decelerate: "cubic-bezier(0.0, 0.0, 0.2, 1)";
        readonly accelerate: "cubic-bezier(0.4, 0.0, 1, 1)";
        readonly sharp: "cubic-bezier(0.4, 0.0, 0.6, 1)";
    };
    transitionDuration: {
        readonly instant: "0ms";
        readonly fast: "150ms";
        readonly normal: "300ms";
        readonly slow: "500ms";
        readonly slower: "700ms";
        readonly slowest: "1000ms";
    };
};
export type AnimationDuration = keyof typeof animationDuration;
export type EasingFunction = keyof typeof easingFunctions;
export type KeyframeName = keyof typeof keyframes;
export type AnimationName = keyof typeof animations;
export type TransitionName = keyof typeof transitions;
//# sourceMappingURL=animations.d.ts.map