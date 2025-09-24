import { configureAxe } from 'jest-axe';
import axeCore from 'axe-core';

// Configure axe-core for accessibility testing
export const axe = configureAxe({
  rules: {
    // Enable all WCAG 2.1 AA rules
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'focus-management': { enabled: true },
    'aria-labels': { enabled: true },
    'semantic-markup': { enabled: true },

    // Custom rules for our application
    'landmark-one-main': { enabled: true },
    'page-has-heading-one': { enabled: true },
    region: { enabled: true },
    'skip-link': { enabled: true },

    // Form accessibility
    label: { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    'required-attr': { enabled: true },
    'aria-required-attr': { enabled: true },

    // Image accessibility
    'image-alt': { enabled: true },
    'image-redundant-alt': { enabled: true },

    // Link accessibility
    'link-name': { enabled: true },
    'link-in-text-block': { enabled: true },

    // Button accessibility
    'button-name': { enabled: true },
    'button-has-visible-text': { enabled: true },

    // Table accessibility
    'table-fake-caption': { enabled: true },
    'td-headers-attr': { enabled: true },
    'th-has-data-cells': { enabled: true },

    // Disable rules that might be too strict for our use case
    'color-contrast-enhanced': { enabled: false }, // WCAG AAA level
    'focus-order-semantics': { enabled: false }, // Can be overly strict
  },
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'],

  // Configure for different environments
  environment: {
    // Disable rules that don't work well in test environment
    bypass: { enabled: false },
    'meta-refresh': { enabled: false },
    'meta-viewport': { enabled: false },
  },
});

// Custom accessibility test utilities
export const accessibilityTestOptions = {
  // Standard test configuration
  standard: {
    rules: {
      'color-contrast': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'aria-labels': { enabled: true },
      'semantic-markup': { enabled: true },
    },
    tags: ['wcag2a', 'wcag2aa'],
  },

  // Comprehensive test configuration
  comprehensive: {
    rules: {
      'color-contrast': { enabled: true },
      'color-contrast-enhanced': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'focus-management': { enabled: true },
      'aria-labels': { enabled: true },
      'semantic-markup': { enabled: true },
      'landmark-one-main': { enabled: true },
      'page-has-heading-one': { enabled: true },
    },
    tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'],
  },

  // Form-specific test configuration
  forms: {
    rules: {
      label: { enabled: true },
      'form-field-multiple-labels': { enabled: true },
      'required-attr': { enabled: true },
      'aria-required-attr': { enabled: true },
      'aria-invalid-attr': { enabled: true },
    },
    tags: ['wcag2a', 'wcag2aa', 'forms'],
  },

  // Chart and data visualization specific
  charts: {
    rules: {
      'color-contrast': { enabled: true },
      'aria-labels': { enabled: true },
      'role-img-alt': { enabled: true },
      'svg-img-alt': { enabled: true },
    },
    tags: ['wcag2a', 'wcag2aa', 'data-viz'],
  },
};

// Helper function to run accessibility tests with custom configuration
export const runAccessibilityTest = async (
  container: Element,
  config: keyof typeof accessibilityTestOptions = 'standard',
) => {
  const testConfig = accessibilityTestOptions[config];
  const customAxe = configureAxe(testConfig);

  const results = await customAxe(container);
  return results;
};

// Helper to check specific accessibility concerns
export const checkAccessibilityConcerns = {
  colorContrast: (container: Element) => runAccessibilityTest(container, 'standard'),

  keyboardNavigation: async (container: Element) => {
    const customAxe = configureAxe({
      rules: {
        'keyboard-navigation': { enabled: true },
        'focus-management': { enabled: true },
        tabindex: { enabled: true },
      },
    });
    return await customAxe(container);
  },

  screenReader: async (container: Element) => {
    const customAxe = configureAxe({
      rules: {
        'aria-labels': { enabled: true },
        'aria-required-attr': { enabled: true },
        'aria-roles': { enabled: true },
        'aria-valid-attr': { enabled: true },
        'landmark-one-main': { enabled: true },
        region: { enabled: true },
      },
    });
    return await customAxe(container);
  },

  forms: (container: Element) => runAccessibilityTest(container, 'forms'),

  charts: (container: Element) => runAccessibilityTest(container, 'charts'),
};
