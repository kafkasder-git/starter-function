declare const _default: {
    content: string[];
    theme: {
        extend: {
            colors: {
                destructive: {
                    DEFAULT: string;
                    foreground: string;
                };
                muted: {
                    DEFAULT: string;
                    foreground: string;
                };
                accent: {
                    DEFAULT: string;
                    foreground: string;
                };
                popover: {
                    DEFAULT: string;
                    foreground: string;
                };
                card: {
                    DEFAULT: string;
                    foreground: string;
                };
                border: string;
                input: string;
                ring: string;
                background: string;
                foreground: string;
                secondary: {
                    DEFAULT: string;
                    foreground: string;
                };
            };
            boxShadow: {
                xs: string;
                sm: string;
                md: string;
                lg: string;
                xl: string;
                '2xl': string;
                inner: string;
                'elevation-1': string;
                'elevation-2': string;
                'elevation-3': string;
                'elevation-4': string;
                'elevation-5': string;
            };
            container: {
                center: boolean;
                padding: string;
                screens: {
                    sm: string;
                    md: string;
                    lg: string;
                    xl: string;
                    '2xl': string;
                };
            };
            backdropBlur: {
                xs: string;
            };
            textWrap: {
                balance: string;
                pretty: string;
            };
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
            spacing: {
                '18': string;
                '88': string;
                '128': string;
            };
            zIndex: {
                readonly hide: "-1";
                readonly auto: "auto";
                readonly base: "0";
                readonly docked: "10";
                readonly dropdown: "1000";
                readonly sticky: "1100";
                readonly banner: "1200";
                readonly overlay: "1300";
                readonly modal: "1400";
                readonly popover: "1500";
                readonly skipLink: "1600";
                readonly toast: "1700";
                readonly tooltip: "1800";
            };
            fontSize: {
                xs: (string | {
                    lineHeight: string;
                })[];
                sm: (string | {
                    lineHeight: string;
                })[];
                base: (string | {
                    lineHeight: string;
                })[];
                lg: (string | {
                    lineHeight: string;
                })[];
                xl: (string | {
                    lineHeight: string;
                })[];
                '2xl': (string | {
                    lineHeight: string;
                })[];
                '3xl': (string | {
                    lineHeight: string;
                })[];
                '4xl': (string | {
                    lineHeight: string;
                })[];
                '5xl': (string | {
                    lineHeight: string;
                })[];
                '6xl': (string | {
                    lineHeight: string;
                })[];
            };
        };
    };
    plugins: ((({ addBase }: {
        addBase: any;
    }) => void) | (({ addUtilities }: {
        addUtilities: any;
    }) => void))[];
};
export default _default;
//# sourceMappingURL=tailwind.config.d.ts.map