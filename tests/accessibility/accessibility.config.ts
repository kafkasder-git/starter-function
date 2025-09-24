// Accessibility testing configuration
export const accessibilityConfig = {
  // Test execution settings
  execution: {
    timeout: 30000, // 30 seconds per test
    retries: 2,
    parallel: false, // Run tests sequentially for stability
    headless: true,
    slowMo: 100, // Slow down for better reliability
  },

  // WCAG compliance levels and rules
  wcag: {
    level: 'AA' as const,
    version: '2.1',
    rules: {
      // Color and contrast
      'color-contrast': { enabled: true, level: 'AA' },
      'color-contrast-enhanced': { enabled: false, level: 'AAA' },

      // Keyboard accessibility
      keyboard: { enabled: true },
      'focus-order-semantics': { enabled: true },
      tabindex: { enabled: true },

      // Screen reader accessibility
      'aria-allowed-attr': { enabled: true },
      'aria-required-attr': { enabled: true },
      'aria-valid-attr': { enabled: true },
      'aria-valid-attr-value': { enabled: true },
      'aria-roles': { enabled: true },

      // Semantic markup
      'landmark-one-main': { enabled: true },
      'page-has-heading-one': { enabled: true },
      'heading-order': { enabled: true },
      region: { enabled: true },

      // Form accessibility
      label: { enabled: true },
      'form-field-multiple-labels': { enabled: true },
      'required-attr': { enabled: true },

      // Image accessibility
      'image-alt': { enabled: true },
      'image-redundant-alt': { enabled: true },

      // Link accessibility
      'link-name': { enabled: true },
      'link-in-text-block': { enabled: true },

      // Table accessibility
      'table-fake-caption': { enabled: true },
      'td-headers-attr': { enabled: true },
      'th-has-data-cells': { enabled: true },
    },
  },

  // Test thresholds for CI/CD
  thresholds: {
    // Overall score threshold (0-100)
    minScore: 85,

    // Maximum allowed violations
    maxCriticalErrors: 0,
    maxMajorErrors: 2,
    maxMinorErrors: 5,
    maxWarnings: 10,

    // Compliance requirements
    requireWCAGAA: true,
    requireWCAGAAA: false,

    // Performance thresholds
    maxTestDuration: 60000, // 1 minute
    maxMemoryUsage: 512, // MB
  },

  // Component-specific test configurations
  components: {
    ReportingDashboard: {
      priority: 'high',
      customRules: {
        'landmark-one-main': { enabled: true },
        region: { enabled: true },
      },
      testTypes: ['axe', 'keyboard', 'screenReader', 'colorContrast'],
    },

    ReportBuilder: {
      priority: 'high',
      customRules: {
        'aria-roles': { enabled: true },
        keyboard: { enabled: true },
      },
      testTypes: ['axe', 'keyboard', 'screenReader'],
    },

    ChartViewer: {
      priority: 'medium',
      customRules: {
        'image-alt': { enabled: true },
        'color-contrast': { enabled: true },
      },
      testTypes: ['axe', 'screenReader', 'colorContrast'],
    },

    ExportDialog: {
      priority: 'medium',
      customRules: {
        'aria-roles': { enabled: true },
        keyboard: { enabled: true },
      },
      testTypes: ['axe', 'keyboard', 'screenReader'],
    },

    FilterPanel: {
      priority: 'medium',
      customRules: {
        label: { enabled: true },
        'form-field-multiple-labels': { enabled: true },
      },
      testTypes: ['axe', 'keyboard', 'screenReader'],
    },
  },

  // Reporting configuration
  reporting: {
    formats: ['json', 'html', 'junit', 'csv'],
    outputDir: './accessibility-reports',
    includeScreenshots: true,
    includeDetailedResults: true,
    generateTrends: true,

    // Report customization
    branding: {
      title: 'Dernek Yönetim Sistemi - Accessibility Report',
      logo: './assets/logo.png',
      organization: 'Dernek Yönetim Sistemi',
    },
  },

  // Browser and environment settings
  environment: {
    browsers: ['chromium'], // Focus on Chromium for CI
    viewports: [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 },
    ],

    // Accessibility tools simulation
    screenReaders: ['nvda', 'jaws', 'voiceover'],
    colorBlindness: ['protanopia', 'deuteranopia', 'tritanopia'],

    // Performance settings
    networkConditions: 'fast3g',
    cpuThrottling: 1,
  },

  // Integration settings
  integrations: {
    // CI/CD platforms
    github: {
      enabled: true,
      commentOnPR: true,
      failOnRegression: true,
    },

    // Issue tracking
    jira: {
      enabled: false,
      createIssues: false,
      project: 'ACCESSIBILITY',
    },

    // Monitoring
    monitoring: {
      enabled: true,
      alertOnFailure: true,
      webhookUrl: process.env.ACCESSIBILITY_WEBHOOK_URL,
    },
  },

  // Advanced settings
  advanced: {
    // Custom axe rules
    customAxeRules: [],

    // Test data
    testData: {
      sampleTexts: ['Bu bir örnek metin', 'Sample English text', 'نص عربي للاختبار'],
      sampleNumbers: [1000, 50000, 1500000],
      sampleDates: ['2024-01-01', '2024-12-31'],
    },

    // Experimental features
    experimental: {
      aiPoweredTesting: false,
      visualRegression: false,
      performanceAccessibility: true,
    },
  },
};

// Environment-specific configurations
export const getEnvironmentConfig = (env: 'development' | 'staging' | 'production') => {
  const baseConfig = { ...accessibilityConfig };

  switch (env) {
    case 'development':
      return {
        ...baseConfig,
        thresholds: {
          ...baseConfig.thresholds,
          minScore: 70, // Lower threshold for development
          maxWarnings: 20,
        },
        execution: {
          ...baseConfig.execution,
          timeout: 60000, // Longer timeout for debugging
          retries: 1,
        },
      };

    case 'staging':
      return {
        ...baseConfig,
        thresholds: {
          ...baseConfig.thresholds,
          minScore: 80,
          maxWarnings: 15,
        },
      };

    case 'production':
      return {
        ...baseConfig,
        thresholds: {
          ...baseConfig.thresholds,
          minScore: 90, // Higher threshold for production
          maxCriticalErrors: 0,
          maxMajorErrors: 0,
          maxWarnings: 5,
        },
      };

    default:
      return baseConfig;
  }
};

// Test suite configurations
export const testSuites = {
  // Quick smoke test
  smoke: {
    components: ['ReportingDashboard'],
    testTypes: ['axe'],
    timeout: 10000,
  },

  // Core functionality test
  core: {
    components: ['ReportingDashboard', 'ReportBuilder', 'ChartViewer'],
    testTypes: ['axe', 'keyboard', 'screenReader'],
    timeout: 30000,
  },

  // Comprehensive test
  full: {
    components: Object.keys(accessibilityConfig.components),
    testTypes: ['axe', 'keyboard', 'screenReader', 'colorContrast'],
    timeout: 60000,
  },

  // Regression test
  regression: {
    components: Object.keys(accessibilityConfig.components),
    testTypes: ['axe', 'keyboard'],
    timeout: 45000,
    compareWithBaseline: true,
  },
};

export default accessibilityConfig;
