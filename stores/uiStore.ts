import { create } from 'zustand';
import { subscribeWithSelector, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface UIState {
  // Layout state
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  headerHeight: number;

  // Theme and appearance
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;

  // Mobile specific
  isMobile: boolean;
  showMobileNav: boolean;
  mobileNavTab: string;
  keyboardHeight: number;

  // Modal and overlay state
  activeModal: string | null;
  modalStack: string[];
  overlayVisible: boolean;

  // Page state
  activeModule: string;
  currentPage: string;
  currentSubPage: string;
  pageHistory: string[];

  // Search and filters
  globalSearchQuery: string;
  globalSearchVisible: boolean;
  filtersVisible: boolean;
  activeFilters: Record<string, any>;

  // Loading states
  globalLoading: boolean;
  moduleLoading: Record<string, boolean>;
  componentLoading: Record<string, boolean>;

  // Toast and notifications UI
  toastPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  maxToasts: number;

  // Performance settings
  animationsEnabled: boolean;
  reducedMotion: boolean;
  preloadData: boolean;
  cacheEnabled: boolean;

  // Accessibility
  highContrast: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
  focusVisible: boolean;

  // Developer tools
  debugMode: boolean;
  performanceMonitoring: boolean;
  showGridOverlay: boolean;
}

interface UIActions {
  // Layout actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarWidth: (width: number) => void;
  setHeaderHeight: (height: number) => void;

  // Theme actions
  setTheme: (theme: UIState['theme']) => void;
  setAccentColor: (color: string) => void;
  setFontSize: (size: UIState['fontSize']) => void;
  toggleCompactMode: () => void;

  // Mobile actions
  setIsMobile: (isMobile: boolean) => void;
  setShowMobileNav: (show: boolean) => void;
  setMobileNavTab: (tab: string) => void;
  setKeyboardHeight: (height: number) => void;

  // Modal and overlay actions
  openModal: (modalId: string) => void;
  closeModal: (modalId?: string) => void;
  closeAllModals: () => void;
  setOverlayVisible: (visible: boolean) => void;

  // Navigation actions
  setActiveModule: (module: string) => void;
  setCurrentPage: (page: string) => void;
  setCurrentSubPage: (subPage: string) => void;
  navigateBack: () => void;
  clearPageHistory: () => void;

  // Search and filter actions
  setGlobalSearchQuery: (query: string) => void;
  setGlobalSearchVisible: (visible: boolean) => void;
  setFiltersVisible: (visible: boolean) => void;
  setActiveFilters: (filters: Record<string, any>) => void;
  updateFilter: (key: string, value: any) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;

  // Loading actions
  setGlobalLoading: (loading: boolean) => void;
  setModuleLoading: (module: string, loading: boolean) => void;
  setComponentLoading: (component: string, loading: boolean) => void;
  clearAllLoading: () => void;

  // Settings actions
  updateSettings: (settings: Partial<Omit<UIState, keyof UIActions>>) => void;
  resetSettings: () => void;

  // Toast actions
  setToastPosition: (position: UIState['toastPosition']) => void;
  setMaxToasts: (max: number) => void;

  // Performance actions
  setAnimationsEnabled: (enabled: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  togglePerformanceMode: () => void;

  // Accessibility actions
  setHighContrast: (enabled: boolean) => void;
  setScreenReaderMode: (enabled: boolean) => void;
  setKeyboardNavigation: (enabled: boolean) => void;
  setFocusVisible: (visible: boolean) => void;

  // Developer actions
  setDebugMode: (enabled: boolean) => void;
  setPerformanceMonitoring: (enabled: boolean) => void;
  toggleGridOverlay: () => void;
}

type UIStore = UIState & UIActions;

// Default settings
const defaultSettings: UIState = {
  // Layout
  sidebarCollapsed: false,
  sidebarWidth: 280,
  headerHeight: 64,

  // Theme
  theme: 'system',
  accentColor: '#2563eb',
  fontSize: 'medium',
  compactMode: false,

  // Mobile
  isMobile: false,
  showMobileNav: false,
  mobileNavTab: 'genel',
  keyboardHeight: 0,

  // Modals
  activeModal: null,
  modalStack: [],
  overlayVisible: false,

  // Navigation
  activeModule: 'genel',
  currentPage: 'list',
  currentSubPage: '',
  pageHistory: [],

  // Search
  globalSearchQuery: '',
  globalSearchVisible: false,
  filtersVisible: false,
  activeFilters: {},

  // Loading
  globalLoading: false,
  moduleLoading: {},
  componentLoading: {},

  // Toast
  toastPosition: 'bottom-right',
  maxToasts: 5,

  // Performance
  animationsEnabled: true,
  reducedMotion: false,
  preloadData: true,
  cacheEnabled: true,

  // Accessibility
  highContrast: false,
  screenReaderMode: false,
  keyboardNavigation: false,
  focusVisible: false,

  // Developer
  debugMode: false,
  performanceMonitoring: false,
  showGridOverlay: false,
};

export const useUIStore = create<UIStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer((set, _get) => ({
          ...defaultSettings,

          // Layout actions
          toggleSidebar: () => {
            set((state) => {
              state.sidebarCollapsed = !state.sidebarCollapsed;
            });
          },

          setSidebarCollapsed: (collapsed: boolean) => {
            set((state) => {
              state.sidebarCollapsed = collapsed;
            });
          },

          setSidebarWidth: (width: number) => {
            set((state) => {
              state.sidebarWidth = Math.max(200, Math.min(400, width));
            });
          },

          setHeaderHeight: (height: number) => {
            set((state) => {
              state.headerHeight = Math.max(48, Math.min(80, height));
            });
          },

          // Theme actions
          setTheme: (theme: UIState['theme']) => {
            set((state) => {
              state.theme = theme;
            });

            // Apply theme to document
            const root = document.documentElement;
            if (theme === 'dark') {
              root.classList.add('dark');
            } else if (theme === 'light') {
              root.classList.remove('dark');
            } else {
              // System theme
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (prefersDark) {
                root.classList.add('dark');
              } else {
                root.classList.remove('dark');
              }
            }
          },

          setAccentColor: (color: string) => {
            set((state) => {
              state.accentColor = color;
            });

            // Apply accent color to CSS variables
            document.documentElement.style.setProperty('--color-primary', color);
            document.documentElement.style.setProperty('--color-accent', color);
          },

          setFontSize: (size: UIState['fontSize']) => {
            set((state) => {
              state.fontSize = size;
            });

            // Apply font size to document
            const fontSizes = {
              small: '14px',
              medium: '16px',
              large: '18px',
            };
            document.documentElement.style.setProperty('--font-size', fontSizes[size]);
          },

          toggleCompactMode: () => {
            set((state) => {
              state.compactMode = !state.compactMode;
            });
          },

          // Mobile actions
          setIsMobile: (isMobile: boolean) => {
            set((state) => {
              state.isMobile = isMobile;
              // Auto-collapse sidebar on mobile
              if (isMobile && !state.sidebarCollapsed) {
                state.sidebarCollapsed = true;
              }
            });
          },

          setShowMobileNav: (show: boolean) => {
            set((state) => {
              state.showMobileNav = show;
            });
          },

          setMobileNavTab: (tab: string) => {
            set((state) => {
              state.mobileNavTab = tab;
            });
          },

          setKeyboardHeight: (height: number) => {
            set((state) => {
              state.keyboardHeight = Math.max(0, height);
            });
          },

          // Modal actions
          openModal: (modalId: string) => {
            set((state) => {
              // Close existing modal if any
              if (state.activeModal) {
                state.modalStack.push(state.activeModal);
              }
              state.activeModal = modalId;
              state.overlayVisible = true;
            });
          },

          closeModal: (modalId?: string) => {
            set((state) => {
              if (modalId && state.activeModal !== modalId) {
                // Remove from stack if it exists
                const index = state.modalStack.indexOf(modalId);
                if (index > -1) {
                  state.modalStack.splice(index, 1);
                }
                return;
              }

              // Close current modal
              if (state.modalStack.length > 0) {
                state.activeModal = state.modalStack.pop() || null;
              } else {
                state.activeModal = null;
                state.overlayVisible = false;
              }
            });
          },

          closeAllModals: () => {
            set((state) => {
              state.activeModal = null;
              state.modalStack = [];
              state.overlayVisible = false;
            });
          },

          setOverlayVisible: (visible: boolean) => {
            set((state) => {
              state.overlayVisible = visible;
            });
          },

          // Navigation actions
          setActiveModule: (module: string) => {
            set((state) => {
              if (state.activeModule !== module) {
                state.pageHistory.push(state.activeModule);
                state.activeModule = module;
                state.currentPage = 'list'; // Reset to list view
                state.currentSubPage = '';
              }
            });
          },

          setCurrentPage: (page: string) => {
            set((state) => {
              if (state.currentPage !== page) {
                state.pageHistory.push(state.currentPage);
                state.currentPage = page;
              }
            });
          },

          setCurrentSubPage: (subPage: string) => {
            set((state) => {
              state.currentSubPage = subPage;
            });
          },

          navigateBack: () => {
            set((state) => {
              if (state.pageHistory.length > 0) {
                const previousPage = state.pageHistory.pop();
                if (previousPage) {
                  state.currentPage = previousPage;
                }
              }
            });
          },

          clearPageHistory: () => {
            set((state) => {
              state.pageHistory = [];
            });
          },

          // Search and filter actions
          setGlobalSearchQuery: (query: string) => {
            set((state) => {
              state.globalSearchQuery = query;
            });
          },

          setGlobalSearchVisible: (visible: boolean) => {
            set((state) => {
              state.globalSearchVisible = visible;
            });
          },

          setFiltersVisible: (visible: boolean) => {
            set((state) => {
              state.filtersVisible = visible;
            });
          },

          setActiveFilters: (filters: Record<string, any>) => {
            set((state) => {
              state.activeFilters = { ...filters };
            });
          },

          updateFilter: (key: string, value: any) => {
            set((state) => {
              if (value === null || value === undefined || value === '') {
                delete state.activeFilters[key];
              } else {
                state.activeFilters[key] = value;
              }
            });
          },

          clearFilter: (key: string) => {
            set((state) => {
              delete state.activeFilters[key];
            });
          },

          clearAllFilters: () => {
            set((state) => {
              state.activeFilters = {};
            });
          },

          // Loading actions
          setGlobalLoading: (loading: boolean) => {
            set((state) => {
              state.globalLoading = loading;
            });
          },

          setModuleLoading: (module: string, loading: boolean) => {
            set((state) => {
              if (loading) {
                state.moduleLoading[module] = true;
              } else {
                delete state.moduleLoading[module];
              }
            });
          },

          setComponentLoading: (component: string, loading: boolean) => {
            set((state) => {
              if (loading) {
                state.componentLoading[component] = true;
              } else {
                delete state.componentLoading[component];
              }
            });
          },

          clearAllLoading: () => {
            set((state) => {
              state.globalLoading = false;
              state.moduleLoading = {};
              state.componentLoading = {};
            });
          },

          // Settings actions
          updateSettings: (settings: Partial<Omit<UIState, keyof UIActions>>) => {
            set((state) => {
              Object.assign(state, settings);
            });
          },

          resetSettings: () => {
            set((state) => {
              Object.assign(state, defaultSettings);
            });
          },

          // Toast actions
          setToastPosition: (position: UIState['toastPosition']) => {
            set((state) => {
              state.toastPosition = position;
            });
          },

          setMaxToasts: (max: number) => {
            set((state) => {
              state.maxToasts = Math.max(1, Math.min(10, max));
            });
          },

          // Performance actions
          setAnimationsEnabled: (enabled: boolean) => {
            set((state) => {
              state.animationsEnabled = enabled;
            });
          },

          setReducedMotion: (reduced: boolean) => {
            set((state) => {
              state.reducedMotion = reduced;
              state.animationsEnabled = !reduced;
            });
          },

          togglePerformanceMode: () => {
            set((state) => {
              const isPerformanceMode = !state.animationsEnabled && !state.preloadData;
              state.animationsEnabled = isPerformanceMode;
              state.preloadData = isPerformanceMode;
              state.cacheEnabled = true; // Always keep cache enabled
            });
          },

          // Accessibility actions
          setHighContrast: (enabled: boolean) => {
            set((state) => {
              state.highContrast = enabled;
            });

            // Apply high contrast mode
            const root = document.documentElement;
            if (enabled) {
              root.classList.add('high-contrast');
            } else {
              root.classList.remove('high-contrast');
            }
          },

          setScreenReaderMode: (enabled: boolean) => {
            set((state) => {
              state.screenReaderMode = enabled;
            });
          },

          setKeyboardNavigation: (enabled: boolean) => {
            set((state) => {
              state.keyboardNavigation = enabled;
            });
          },

          setFocusVisible: (visible: boolean) => {
            set((state) => {
              state.focusVisible = visible;
            });
          },

          // Developer actions
          setDebugMode: (enabled: boolean) => {
            set((state) => {
              state.debugMode = enabled;
            });
          },

          setPerformanceMonitoring: (enabled: boolean) => {
            set((state) => {
              state.performanceMonitoring = enabled;
            });
          },

          toggleGridOverlay: () => {
            set((state) => {
              state.showGridOverlay = !state.showGridOverlay;
            });
          },
        })),
        {
          name: 'ui-store',
          partialize: (state) => ({
            // Persist user preferences
            theme: state.theme,
            accentColor: state.accentColor,
            fontSize: state.fontSize,
            compactMode: state.compactMode,
            sidebarCollapsed: state.sidebarCollapsed,
            sidebarWidth: state.sidebarWidth,
            toastPosition: state.toastPosition,
            maxToasts: state.maxToasts,
            animationsEnabled: state.animationsEnabled,
            reducedMotion: state.reducedMotion,
            preloadData: state.preloadData,
            cacheEnabled: state.cacheEnabled,
            highContrast: state.highContrast,
            screenReaderMode: state.screenReaderMode,
            keyboardNavigation: state.keyboardNavigation,
            debugMode: state.debugMode,
            performanceMonitoring: state.performanceMonitoring,
          }),
          version: 1,
        }
      ),
      'ui-store'
    )
  )
);

// Initialize theme on store creation
if (typeof window !== 'undefined') {
  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleThemeChange = () => {
    const { theme } = useUIStore.getState();
    if (theme === 'system') {
      useUIStore.getState().setTheme('system');
    }
  };

  mediaQuery.addEventListener('change', handleThemeChange);

  // Listen for reduced motion preference
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handleReducedMotionChange = () => {
    useUIStore.getState().setReducedMotion(reducedMotionQuery.matches);
  };

  reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

  // Initialize reduced motion
  useUIStore.getState().setReducedMotion(reducedMotionQuery.matches);
}

// Selectors for performance optimization
export const uiSelectors = {
  theme: (state: UIStore) => state.theme,
  isMobile: (state: UIStore) => state.isMobile,
  sidebarCollapsed: (state: UIStore) => state.sidebarCollapsed,
  activeModule: (state: UIStore) => state.activeModule,
  currentPage: (state: UIStore) => state.currentPage,
  globalLoading: (state: UIStore) => state.globalLoading,
  activeModal: (state: UIStore) => state.activeModal,
  globalSearchVisible: (state: UIStore) => state.globalSearchVisible,
  activeFilters: (state: UIStore) => state.activeFilters,
  animationsEnabled: (state: UIStore) => state.animationsEnabled,
  isModuleLoading: (module: string) => (state: UIStore) => state.moduleLoading[module] || false,
  isComponentLoading: (component: string) => (state: UIStore) =>
    state.componentLoading[component] || false,
};

// Export uiStore with getState method
export const uiStore = useUIStore;
