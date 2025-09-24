// Main accessibility testing exports
export * from './automated-testing';
export * from './accessibility-test-runner';
export * from './ci-accessibility-tests';
export * from './axe-setup';
export * from './keyboard-navigation';
export * from './screen-reader';
export * from './color-contrast';
export * from './accessibility.config';

// Re-export commonly used functions
export {
  AccessibilityTestSuite,
  runBasicAccessibilityTests,
  runComprehensiveAccessibilityTests,
  runFormAccessibilityTests,
  runChartAccessibilityTests,
} from './automated-testing';

export {
  ReportingAccessibilityTestRunner,
  runReportingAccessibilityTests,
  runQuickAccessibilityCheck,
  runComplianceCheck,
} from './accessibility-test-runner';

export { CIAccessibilityTester } from './ci-accessibility-tests';

export { testKeyboardNavigation, KeyboardNavigationTester } from './keyboard-navigation';

export { testScreenReaderAccessibility, ScreenReaderTester } from './screen-reader';

export { testColorContrast, ColorContrastTester } from './color-contrast';

export { axe, runAccessibilityTest, checkAccessibilityConcerns } from './axe-setup';

// Default export for convenience
import { ReportingAccessibilityTestRunner } from './accessibility-test-runner';
export default ReportingAccessibilityTestRunner;
