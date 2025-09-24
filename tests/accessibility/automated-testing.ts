import { axe } from './axe-setup';
import { testKeyboardNavigation } from './keyboard-navigation';
import { testScreenReaderAccessibility } from './screen-reader';
import { testColorContrast } from './color-contrast';

// Comprehensive accessibility test suite
export class AccessibilityTestSuite {
  private readonly container: Element;
  private readonly options: AccessibilityTestOptions;

  constructor(container: Element = document.body, options: AccessibilityTestOptions = {}) {
    this.container = container;
    this.options = {
      includeAxeCore: true,
      includeKeyboardNavigation: true,
      includeScreenReader: true,
      includeColorContrast: true,
      wcagLevel: 'AA',
      reportWarnings: true,
      ...options,
    };
  }

  // Run all accessibility tests
  async runAllTests(): Promise<AccessibilityTestResults> {
    const results: AccessibilityTestResults = {
      overall: {
        success: true,
        errors: [],
        warnings: [],
      },
      axeCore: null,
      keyboardNavigation: null,
      screenReader: null,
      colorContrast: null,
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        warningCount: 0,
        errorCount: 0,
      },
    };

    try {
      // Run axe-core tests
      if (this.options.includeAxeCore) {
        results.axeCore = await this.runAxeCoreTests();
        results.summary.totalTests++;
        if (results.axeCore.success) {
          results.summary.passedTests++;
        } else {
          results.summary.failedTests++;
          results.overall.success = false;
        }
        results.summary.errorCount += results.axeCore.errors.length;
        results.summary.warningCount += results.axeCore.warnings?.length || 0;
      }

      // Run keyboard navigation tests
      if (this.options.includeKeyboardNavigation) {
        results.keyboardNavigation = await this.runKeyboardNavigationTests();
        results.summary.totalTests++;
        if (results.keyboardNavigation.overall.success) {
          results.summary.passedTests++;
        } else {
          results.summary.failedTests++;
          results.overall.success = false;
        }
        results.summary.errorCount += results.keyboardNavigation.overall.errors.length;
      }

      // Run screen reader tests
      if (this.options.includeScreenReader) {
        results.screenReader = await this.runScreenReaderTests();
        results.summary.totalTests++;
        if (results.screenReader.success) {
          results.summary.passedTests++;
        } else {
          results.summary.failedTests++;
          results.overall.success = false;
        }
        results.summary.errorCount += results.screenReader.errors.length;
      }

      // Run color contrast tests
      if (this.options.includeColorContrast) {
        results.colorContrast = await this.runColorContrastTests();
        results.summary.totalTests++;
        if (results.colorContrast.success) {
          results.summary.passedTests++;
        } else {
          results.summary.failedTests++;
          results.overall.success = false;
        }
        results.summary.errorCount += results.colorContrast.errors.length;
        results.summary.warningCount += results.colorContrast.warnings.length;
      }

      // Compile overall results
      results.overall.errors = this.compileAllErrors(results);
      results.overall.warnings = this.compileAllWarnings(results);
    } catch (error) {
      results.overall.success = false;
      results.overall.errors.push(`Test suite execution failed: ${error}`);
    }

    return results;
  }

  // Run axe-core accessibility tests
  private async runAxeCoreTests(): Promise<{
    success: boolean;
    errors: string[];
    warnings?: string[];
    violations: any[];
    passes: any[];
  }> {
    try {
      const axeResults = await axe(this.container);

      const errors = axeResults.violations.map(
        (violation: any) =>
          `${violation.id}: ${violation.description} (${violation.nodes.length} instances)`,
      );

      const warnings = axeResults.incomplete.map(
        (incomplete: any) => `${incomplete.id}: ${incomplete.description} (needs manual review)`,
      );

      return {
        success: axeResults.violations.length === 0,
        errors,
        warnings: this.options.reportWarnings ? warnings : undefined,
        violations: axeResults.violations,
        passes: axeResults.passes,
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Axe-core test failed: ${error}`],
        violations: [],
        passes: [],
      };
    }
  }

  // Run keyboard navigation tests
  private async runKeyboardNavigationTests() {
    try {
      return await testKeyboardNavigation(this.container);
    } catch (error) {
      return {
        tabNavigation: {
          success: false,
          errors: [`Tab navigation test failed: ${error}`],
          focusOrder: [],
        },
        shiftTabNavigation: {
          success: false,
          errors: [`Shift+Tab navigation test failed: ${error}`],
          focusOrder: [],
        },
        keyboardActivation: {
          success: false,
          errors: [`Keyboard activation test failed: ${error}`],
          results: [],
        },
        arrowKeyNavigation: {
          success: false,
          errors: [`Arrow key navigation test failed: ${error}`],
        },
        escapeKey: { success: false, errors: [`Escape key test failed: ${error}`] },
        overall: {
          success: false,
          errors: [`Keyboard navigation tests failed: ${error}`],
        },
      };
    }
  }

  // Run screen reader tests
  private async runScreenReaderTests() {
    try {
      return testScreenReaderAccessibility(this.container);
    } catch (error) {
      return {
        success: false,
        errors: [`Screen reader tests failed: ${error}`],
        results: {
          semanticStructure: {
            success: false,
            errors: [],
            structure: { headings: [], landmarks: [], lists: [], tables: [] },
          },
          ariaLabels: { success: false, errors: [], elements: [] },
          formAccessibility: { success: false, errors: [], forms: [] },
          tableAccessibility: { success: false, errors: [], tables: [] },
          liveRegions: { success: false, errors: [], liveRegions: [] },
        },
      };
    }
  }

  // Run color contrast tests
  private async runColorContrastTests() {
    try {
      return testColorContrast(this.container);
    } catch (error) {
      return {
        success: false,
        errors: [`Color contrast tests failed: ${error}`],
        warnings: [],
        results: {
          textContrast: { success: false, errors: [], warnings: [], results: [] },
          interactiveContrast: { success: false, errors: [], warnings: [], results: [] },
          colorOnlyInformation: { success: false, errors: [], warnings: [], elements: [] },
        },
      };
    }
  }

  // Compile all errors from different test categories
  private compileAllErrors(results: AccessibilityTestResults): string[] {
    const errors: string[] = [];

    if (results.axeCore?.errors) {
      errors.push(...results.axeCore.errors.map((e) => `[Axe-Core] ${e}`));
    }

    if (results.keyboardNavigation?.overall.errors) {
      errors.push(...results.keyboardNavigation.overall.errors.map((e) => `[Keyboard] ${e}`));
    }

    if (results.screenReader?.errors) {
      errors.push(...results.screenReader.errors.map((e) => `[Screen Reader] ${e}`));
    }

    if (results.colorContrast?.errors) {
      errors.push(...results.colorContrast.errors.map((e) => `[Color Contrast] ${e}`));
    }

    return errors;
  }

  // Compile all warnings from different test categories
  private compileAllWarnings(results: AccessibilityTestResults): string[] {
    const warnings: string[] = [];

    if (results.axeCore?.warnings) {
      warnings.push(...results.axeCore.warnings.map((w) => `[Axe-Core] ${w}`));
    }

    if (results.colorContrast?.warnings) {
      warnings.push(...results.colorContrast.warnings.map((w) => `[Color Contrast] ${w}`));
    }

    return warnings;
  }

  // Generate detailed report
  generateReport(): string {
    // This would be implemented to generate a comprehensive HTML or text report
    // For now, returning a placeholder
    return 'Detailed accessibility report would be generated here';
  }
}

// Test options interface
export interface AccessibilityTestOptions {
  includeAxeCore?: boolean;
  includeKeyboardNavigation?: boolean;
  includeScreenReader?: boolean;
  includeColorContrast?: boolean;
  wcagLevel?: 'A' | 'AA' | 'AAA';
  reportWarnings?: boolean;
}

// Test results interface
export interface AccessibilityTestResults {
  overall: {
    success: boolean;
    errors: string[];
    warnings: string[];
  };
  axeCore: {
    success: boolean;
    errors: string[];
    warnings?: string[];
    violations: any[];
    passes: any[];
  } | null;
  keyboardNavigation: Awaited<ReturnType<typeof testKeyboardNavigation>> | null;
  screenReader: ReturnType<typeof testScreenReaderAccessibility> | null;
  colorContrast: ReturnType<typeof testColorContrast> | null;
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    warningCount: number;
    errorCount: number;
  };
}

// Convenience functions for different types of accessibility testing
export const runBasicAccessibilityTests = async (container: Element = document.body) => {
  const suite = new AccessibilityTestSuite(container, {
    includeAxeCore: true,
    includeKeyboardNavigation: true,
    includeScreenReader: false,
    includeColorContrast: true,
    wcagLevel: 'AA',
  });

  return await suite.runAllTests();
};

export const runComprehensiveAccessibilityTests = async (container: Element = document.body) => {
  const suite = new AccessibilityTestSuite(container, {
    includeAxeCore: true,
    includeKeyboardNavigation: true,
    includeScreenReader: true,
    includeColorContrast: true,
    wcagLevel: 'AAA',
    reportWarnings: true,
  });

  return await suite.runAllTests();
};

export const runFormAccessibilityTests = async (container: Element = document.body) => {
  const suite = new AccessibilityTestSuite(container, {
    includeAxeCore: true,
    includeKeyboardNavigation: true,
    includeScreenReader: true,
    includeColorContrast: false,
    wcagLevel: 'AA',
  });

  return await suite.runAllTests();
};

export const runChartAccessibilityTests = async (container: Element = document.body) => {
  const suite = new AccessibilityTestSuite(container, {
    includeAxeCore: true,
    includeKeyboardNavigation: false,
    includeScreenReader: true,
    includeColorContrast: true,
    wcagLevel: 'AA',
  });

  return await suite.runAllTests();
};

// Export main class and utilities
export * from './axe-setup';
export * from './keyboard-navigation';
export * from './screen-reader';
export * from './color-contrast';
