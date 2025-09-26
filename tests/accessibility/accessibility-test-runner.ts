import { testKeyboardNavigation } from './keyboard-navigation';
import { testScreenReaderAccessibility } from './screen-reader';
import { testColorContrast } from './color-contrast';
import { runAccessibilityTest } from './axe-setup';

// Comprehensive accessibility test runner for the reporting system
export class ReportingAccessibilityTestRunner {
  private readonly container: Element;
  private readonly options: AccessibilityTestRunnerOptions;

  constructor(container: Element = document.body, options: AccessibilityTestRunnerOptions = {}) {
    this.container = container;
    this.options = {
      wcagLevel: 'AA',
      includeWarnings: true,
      generateReport: true,
      testTypes: ['axe', 'keyboard', 'screenReader', 'colorContrast'],
      ...options,
    };
  }

  // Run all accessibility tests for reporting components
  async runAllTests(): Promise<AccessibilityTestReport> {
    const startTime = Date.now();
    const report: AccessibilityTestReport = {
      timestamp: new Date().toISOString(),
      duration: 0,
      overall: {
        success: true,
        score: 0,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        warnings: 0,
        errors: 0,
      },
      testResults: {},
      summary: {
        criticalIssues: [],
        warnings: [],
        recommendations: [],
        compliance: {
          wcagA: false,
          wcagAA: false,
          wcagAAA: false,
        },
      },
    };

    try {
      // Run Axe-core tests
      if (this.options.testTypes.includes('axe')) {
        report.testResults.axeCore = await this.runAxeTests();
        this.updateOverallResults(report, report.testResults.axeCore);
      }

      // Run keyboard navigation tests
      if (this.options.testTypes.includes('keyboard')) {
        report.testResults.keyboardNavigation = await this.runKeyboardTests();
        this.updateOverallResults(report, report.testResults.keyboardNavigation);
      }

      // Run screen reader tests
      if (this.options.testTypes.includes('screenReader')) {
        report.testResults.screenReader = await this.runScreenReaderTests();
        this.updateOverallResults(report, report.testResults.screenReader);
      }

      // Run color contrast tests
      if (this.options.testTypes.includes('colorContrast')) {
        report.testResults.colorContrast = await this.runColorContrastTests();
        this.updateOverallResults(report, report.testResults.colorContrast);
      }

      // Calculate final score and compliance
      this.calculateFinalScore(report);
      this.assessCompliance(report);

      // Generate recommendations
      this.generateRecommendations(report);
    } catch (error) {
      report.overall.success = false;
      report.summary.criticalIssues.push(`Test execution failed: ${error}`);
    }

    report.duration = Date.now() - startTime;

    if (this.options.generateReport) {
      this.generateHTMLReport(report);
    }

    return report;
  }

  // Run Axe-core accessibility tests
  private async runAxeTests(): Promise<TestResult> {
    try {
      const axeResults = await runAccessibilityTest(this.container, 'comprehensive');

      const errors = axeResults.violations.map((violation: any) => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        nodes: violation.nodes.length,
        tags: violation.tags,
      }));

      const warnings = axeResults.incomplete.map((incomplete: any) => ({
        id: incomplete.id,
        description: incomplete.description,
        help: incomplete.help,
        nodes: incomplete.nodes.length,
      }));

      return {
        testName: 'Axe-core Accessibility',
        success: axeResults.violations.length === 0,
        errors: errors.map((e) => `${e.id}: ${e.description} (${e.nodes} instances)`),
        warnings: warnings.map((w) => `${w.id}: ${w.description} (${w.nodes} instances)`),
        details: {
          violations: errors,
          incomplete: warnings,
          passes: axeResults.passes.length,
        },
      };
    } catch (error) {
      return {
        testName: 'Axe-core Accessibility',
        success: false,
        errors: [`Axe-core test failed: ${error}`],
        warnings: [],
        details: { error: error.toString() },
      };
    }
  }

  // Run keyboard navigation tests
  private async runKeyboardTests(): Promise<TestResult> {
    try {
      const results = await testKeyboardNavigation(this.container);

      return {
        testName: 'Keyboard Navigation',
        success: results.overall.success,
        errors: results.overall.errors,
        warnings: [],
        details: {
          tabNavigation: results.tabNavigation,
          shiftTabNavigation: results.shiftTabNavigation,
          keyboardActivation: results.keyboardActivation,
          arrowKeyNavigation: results.arrowKeyNavigation,
          escapeKey: results.escapeKey,
        },
      };
    } catch (error) {
      return {
        testName: 'Keyboard Navigation',
        success: false,
        errors: [`Keyboard navigation test failed: ${error}`],
        warnings: [],
        details: { error: error.toString() },
      };
    }
  }

  // Run screen reader tests
  private async runScreenReaderTests(): Promise<TestResult> {
    try {
      const results = testScreenReaderAccessibility(this.container);

      const allErrors = [
        ...results.results.semanticStructure.errors,
        ...results.results.ariaLabels.errors,
        ...results.results.formAccessibility.errors,
        ...results.results.tableAccessibility.errors,
        ...results.results.liveRegions.errors,
      ];

      return {
        testName: 'Screen Reader Accessibility',
        success: results.success,
        errors: allErrors,
        warnings: [],
        details: results.results,
      };
    } catch (error) {
      return {
        testName: 'Screen Reader Accessibility',
        success: false,
        errors: [`Screen reader test failed: ${error}`],
        warnings: [],
        details: { error: error.toString() },
      };
    }
  }

  // Run color contrast tests
  private async runColorContrastTests(): Promise<TestResult> {
    try {
      const results = testColorContrast(this.container);

      return {
        testName: 'Color Contrast',
        success: results.success,
        errors: results.errors,
        warnings: results.warnings,
        details: results.results,
      };
    } catch (error) {
      return {
        testName: 'Color Contrast',
        success: false,
        errors: [`Color contrast test failed: ${error}`],
        warnings: [],
        details: { error: error.toString() },
      };
    }
  }

  // Update overall results with individual test results
  private updateOverallResults(report: AccessibilityTestReport, testResult: TestResult) {
    report.overall.totalTests++;

    if (testResult.success) {
      report.overall.passedTests++;
    } else {
      report.overall.failedTests++;
      report.overall.success = false;
    }

    report.overall.errors += testResult.errors.length;
    report.overall.warnings += testResult.warnings.length;

    // Add to summary
    report.summary.criticalIssues.push(...testResult.errors);
    report.summary.warnings.push(...testResult.warnings);
  }

  // Calculate final accessibility score
  private calculateFinalScore(report: AccessibilityTestReport) {
    const totalPossiblePoints = report.overall.totalTests * 100;
    const earnedPoints =
      report.overall.passedTests * 100 - report.overall.errors * 10 - report.overall.warnings * 2;

    report.overall.score = Math.max(0, Math.round((earnedPoints / totalPossiblePoints) * 100));
  }

  // Assess WCAG compliance levels
  private assessCompliance(report: AccessibilityTestReport) {
    const hasNoErrors = report.overall.errors === 0;
    const hasMinimalWarnings = report.overall.warnings <= 2;
    const hasGoodScore = report.overall.score >= 80;

    // WCAG A compliance (basic)
    report.summary.compliance.wcagA = hasNoErrors && report.overall.score >= 60;

    // WCAG AA compliance (standard)
    report.summary.compliance.wcagAA = hasNoErrors && hasGoodScore;

    // WCAG AAA compliance (enhanced)
    report.summary.compliance.wcagAAA =
      hasNoErrors && hasMinimalWarnings && report.overall.score >= 95;
  }

  // Generate actionable recommendations
  private generateRecommendations(report: AccessibilityTestReport) {
    const recommendations: string[] = [];

    // Analyze common issues and provide recommendations
    if (report.overall.errors > 0) {
      recommendations.push('Address all critical accessibility errors before deployment');
    }

    if (report.overall.warnings > 5) {
      recommendations.push('Review and address accessibility warnings to improve user experience');
    }

    if (!report.summary.compliance.wcagAA) {
      recommendations.push(
        'Implement WCAG 2.1 AA compliance measures for legal and usability requirements',
      );
    }

    // Specific recommendations based on test results
    if (report.testResults.colorContrast && !report.testResults.colorContrast.success) {
      recommendations.push('Improve color contrast ratios to meet WCAG standards');
    }

    if (report.testResults.keyboardNavigation && !report.testResults.keyboardNavigation.success) {
      recommendations.push('Ensure all interactive elements are keyboard accessible');
    }

    if (report.testResults.screenReader && !report.testResults.screenReader.success) {
      recommendations.push('Add proper ARIA labels and semantic markup for screen readers');
    }

    report.summary.recommendations = recommendations;
  }

  // Generate HTML report
  private generateHTMLReport(report: AccessibilityTestReport) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .score { font-size: 2em; font-weight: bold; color: ${report.overall.score >= 80 ? '#22c55e' : report.overall.score >= 60 ? '#f59e0b' : '#ef4444'}; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .error { color: #ef4444; }
        .warning { color: #f59e0b; }
        .success { color: #22c55e; }
        .compliance { display: flex; gap: 20px; }
        .compliance-item { padding: 10px; border-radius: 4px; }
        .compliant { background: #dcfce7; color: #166534; }
        .non-compliant { background: #fef2f2; color: #991b1b; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Accessibility Test Report</h1>
        <p>Generated: ${report.timestamp}</p>
        <p>Duration: ${report.duration}ms</p>
        <div class="score">Score: ${report.overall.score}/100</div>
    </div>
    
    <div class="section">
        <h2>Overall Results</h2>
        <p>Total Tests: ${report.overall.totalTests}</p>
        <p class="success">Passed: ${report.overall.passedTests}</p>
        <p class="error">Failed: ${report.overall.failedTests}</p>
        <p class="warning">Warnings: ${report.overall.warnings}</p>
        <p class="error">Errors: ${report.overall.errors}</p>
    </div>
    
    <div class="section">
        <h2>WCAG Compliance</h2>
        <div class="compliance">
            <div class="compliance-item ${report.summary.compliance.wcagA ? 'compliant' : 'non-compliant'}">
                WCAG A: ${report.summary.compliance.wcagA ? 'Compliant' : 'Non-compliant'}
            </div>
            <div class="compliance-item ${report.summary.compliance.wcagAA ? 'compliant' : 'non-compliant'}">
                WCAG AA: ${report.summary.compliance.wcagAA ? 'Compliant' : 'Non-compliant'}
            </div>
            <div class="compliance-item ${report.summary.compliance.wcagAAA ? 'compliant' : 'non-compliant'}">
                WCAG AAA: ${report.summary.compliance.wcagAAA ? 'Compliant' : 'Non-compliant'}
            </div>
        </div>
    </div>
    
    ${
      report.summary.criticalIssues.length > 0
        ? `
    <div class="section">
        <h2>Critical Issues</h2>
        <ul>
            ${report.summary.criticalIssues.map((issue) => `<li class="error">${issue}</li>`).join('')}
        </ul>
    </div>
    `
        : ''
    }
    
    ${
      report.summary.warnings.length > 0
        ? `
    <div class="section">
        <h2>Warnings</h2>
        <ul>
            ${report.summary.warnings.map((warning) => `<li class="warning">${warning}</li>`).join('')}
        </ul>
    </div>
    `
        : ''
    }
    
    <div class="section">
        <h2>Recommendations</h2>
        <ul>
            ${report.summary.recommendations.map((rec) => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
    
    <div class="section">
        <h2>Detailed Test Results</h2>
        ${Object.entries(report.testResults)
          .map(
            ([key, result]) => `
            <h3>${result.testName}</h3>
            <p class="${result.success ? 'success' : 'error'}">
                Status: ${result.success ? 'PASSED' : 'FAILED'}
            </p>
            ${
              result.errors.length > 0
                ? `
                <h4>Errors:</h4>
                <ul>${result.errors.map((error) => `<li class="error">${error}</li>`).join('')}</ul>
            `
                : ''
            }
            ${
              result.warnings.length > 0
                ? `
                <h4>Warnings:</h4>
                <ul>${result.warnings.map((warning) => `<li class="warning">${warning}</li>`).join('')}</ul>
            `
                : ''
            }
        `,
          )
          .join('')}
    </div>
</body>
</html>
    `;

    // In a real implementation, you would save this to a file
    console.log('HTML Report generated:', html.length, 'characters');
  }
}

// Test runner options interface
export interface AccessibilityTestRunnerOptions {
  wcagLevel?: 'A' | 'AA' | 'AAA';
  includeWarnings?: boolean;
  generateReport?: boolean;
  testTypes?: ('axe' | 'keyboard' | 'screenReader' | 'colorContrast')[];
}

// Test result interface
export interface TestResult {
  testName: string;
  success: boolean;
  errors: string[];
  warnings: string[];
  details: any;
}

// Comprehensive test report interface
export interface AccessibilityTestReport {
  timestamp: string;
  duration: number;
  overall: {
    success: boolean;
    score: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    warnings: number;
    errors: number;
  };
  testResults: {
    axeCore?: TestResult;
    keyboardNavigation?: TestResult;
    screenReader?: TestResult;
    colorContrast?: TestResult;
  };
  summary: {
    criticalIssues: string[];
    warnings: string[];
    recommendations: string[];
    compliance: {
      wcagA: boolean;
      wcagAA: boolean;
      wcagAAA: boolean;
    };
  };
}

// Convenience functions for different testing scenarios
export const runReportingAccessibilityTests = async (container: Element = document.body) => {
  const runner = new ReportingAccessibilityTestRunner(container, {
    wcagLevel: 'AA',
    includeWarnings: true,
    generateReport: true,
    testTypes: ['axe', 'keyboard', 'screenReader', 'colorContrast'],
  });

  return await runner.runAllTests();
};

export const runQuickAccessibilityCheck = async (container: Element = document.body) => {
  const runner = new ReportingAccessibilityTestRunner(container, {
    wcagLevel: 'AA',
    includeWarnings: false,
    generateReport: false,
    testTypes: ['axe', 'keyboard'],
  });

  return await runner.runAllTests();
};

export const runComplianceCheck = async (container: Element = document.body) => {
  const runner = new ReportingAccessibilityTestRunner(container, {
    wcagLevel: 'AAA',
    includeWarnings: true,
    generateReport: true,
    testTypes: ['axe', 'keyboard', 'screenReader', 'colorContrast'],
  });

  return await runner.runAllTests();
};

// Export already declared above
