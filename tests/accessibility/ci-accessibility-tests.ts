#!/usr/bin/env node

import type { AccessibilityTestReport } from './accessibility-test-runner';
import { runReportingAccessibilityTests } from './accessibility-test-runner';
import { logger } from '../../lib/logging';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

// CI/CD Accessibility Testing Script
class CIAccessibilityTester {
  private readonly outputDir: string;
  private readonly thresholds: AccessibilityThresholds;

  constructor(outputDir = './accessibility-reports', thresholds: AccessibilityThresholds = {}) {
    this.outputDir = outputDir;
    this.thresholds = {
      minScore: 80,
      maxErrors: 0,
      maxWarnings: 10,
      requireWCAGAA: true,
      ...thresholds,
    };

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  // Run accessibility tests for CI/CD pipeline
  async runCITests(): Promise<CITestResult> {
    logger.info('🔍 Starting CI Accessibility Tests...');

    const results: CITestResult = {
      success: true,
      reports: [],
      summary: {
        totalComponents: 0,
        passedComponents: 0,
        failedComponents: 0,
        overallScore: 0,
        wcagCompliance: false,
      },
      errors: [],
      warnings: [],
    };

    try {
      // Test reporting components
      const reportingComponents = await this.testReportingComponents();
      results.reports.push(...reportingComponents);

      // Calculate overall results
      this.calculateOverallResults(results);

      // Check against thresholds
      this.checkThresholds(results);

      // Generate reports
      await this.generateReports(results);

      // Log results
      this.logResults(results);
    } catch (error) {
      results.success = false;
      results.errors.push(`CI test execution failed: ${error}`);
      logger.error('❌ CI Accessibility Tests Failed', error);
    }

    return results;
  }

  // Test all reporting system components
  private async testReportingComponents(): Promise<AccessibilityTestReport[]> {
    const reports: AccessibilityTestReport[] = [];

    // Mock reporting components for testing
    const components = [
      {
        name: 'ReportingDashboard',
        html: this.getMockReportingDashboardHTML(),
      },
      {
        name: 'ReportBuilder',
        html: this.getMockReportBuilderHTML(),
      },
      {
        name: 'ChartViewer',
        html: this.getMockChartViewerHTML(),
      },
      {
        name: 'ExportDialog',
        html: this.getMockExportDialogHTML(),
      },
    ];

    for (const component of components) {
      logger.info(`🧪 Testing ${component.name}...`);

      try {
        // Create DOM environment
        const dom = new JSDOM(component.html, {
          pretendToBeVisual: true,
          resources: 'usable',
        });

        global.document = dom.window.document;
        global.window = dom.window as any;
        global.navigator = dom.window.navigator;

        // Run accessibility tests
        const report = await runReportingAccessibilityTests(dom.window.document.body);
        report.componentName = component.name;

        reports.push(report);

        logger.info(`✅ ${component.name}: Score ${report.overall.score}/100`);
      } catch (error) {
        logger.error(`❌ ${component.name} test failed`, error);

        // Create error report
        const errorReport: AccessibilityTestReport = {
          componentName: component.name,
          timestamp: new Date().toISOString(),
          duration: 0,
          overall: {
            success: false,
            score: 0,
            totalTests: 0,
            passedTests: 0,
            failedTests: 1,
            warnings: 0,
            errors: 1,
          },
          testResults: {},
          summary: {
            criticalIssues: [`Component test failed: ${error}`],
            warnings: [],
            recommendations: ['Fix component test setup and retry'],
            compliance: {
              wcagA: false,
              wcagAA: false,
              wcagAAA: false,
            },
          },
        };

        reports.push(errorReport);
      }
    }

    return reports;
  }

  // Calculate overall test results
  private calculateOverallResults(results: CITestResult) {
    results.summary.totalComponents = results.reports.length;
    results.summary.passedComponents = results.reports.filter((r) => r.overall.success).length;
    results.summary.failedComponents =
      results.summary.totalComponents - results.summary.passedComponents;

    // Calculate average score
    const totalScore = results.reports.reduce((sum, report) => sum + report.overall.score, 0);
    results.summary.overallScore =
      results.summary.totalComponents > 0
        ? Math.round(totalScore / results.summary.totalComponents)
        : 0;

    // Check WCAG compliance
    results.summary.wcagCompliance = results.reports.every((r) => r.summary.compliance.wcagAA);

    // Collect all errors and warnings
    results.errors = results.reports.flatMap((r) => r.summary.criticalIssues);
    results.warnings = results.reports.flatMap((r) => r.summary.warnings);
  }

  // Check results against CI thresholds
  private checkThresholds(results: CITestResult) {
    const failures: string[] = [];

    if (results.summary.overallScore < this.thresholds.minScore) {
      failures.push(
        `Overall score ${results.summary.overallScore} below threshold ${this.thresholds.minScore}`,
      );
    }

    if (results.errors.length > this.thresholds.maxErrors) {
      failures.push(
        `Error count ${results.errors.length} exceeds threshold ${this.thresholds.maxErrors}`,
      );
    }

    if (results.warnings.length > this.thresholds.maxWarnings) {
      failures.push(
        `Warning count ${results.warnings.length} exceeds threshold ${this.thresholds.maxWarnings}`,
      );
    }

    if (this.thresholds.requireWCAGAA && !results.summary.wcagCompliance) {
      failures.push('WCAG AA compliance required but not achieved');
    }

    if (failures.length > 0) {
      results.success = false;
      results.errors.push(...failures);
    }
  }

  // Generate various report formats
  private async generateReports(results: CITestResult) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // JSON Report
    const jsonReport = {
      ...results,
      generatedAt: new Date().toISOString(),
      thresholds: this.thresholds,
    };

    fs.writeFileSync(
      path.join(this.outputDir, `accessibility-report-${timestamp}.json`),
      JSON.stringify(jsonReport, null, 2),
    );

    // JUnit XML Report (for CI integration)
    const junitXml = this.generateJUnitXML(results);
    fs.writeFileSync(path.join(this.outputDir, `accessibility-junit-${timestamp}.xml`), junitXml);

    // HTML Summary Report
    const htmlReport = this.generateHTMLSummary(results);
    fs.writeFileSync(
      path.join(this.outputDir, `accessibility-summary-${timestamp}.html`),
      htmlReport,
    );

    // CSV Report for analysis
    const csvReport = this.generateCSVReport(results);
    fs.writeFileSync(path.join(this.outputDir, `accessibility-data-${timestamp}.csv`), csvReport);

    console.log(`📊 Reports generated in ${this.outputDir}`);
  }

  // Generate JUnit XML for CI integration
  private generateJUnitXML(results: CITestResult): string {
    const testCases = results.reports
      .map((report) => {
        const errors = report.summary.criticalIssues
          .map((issue) => `<error message="${this.escapeXML(issue)}" type="AccessibilityError" />`)
          .join('\n');

        const failures = report.overall.success
          ? ''
          : `<failure message="Accessibility test failed" type="AccessibilityFailure">
          Score: ${report.overall.score}/100
          Errors: ${report.overall.errors}
          Warnings: ${report.overall.warnings}
        </failure>`;

        return `
        <testcase 
          classname="AccessibilityTests" 
          name="${report.componentName || 'Unknown'}" 
          time="${report.duration / 1000}"
        >
          ${errors}
          ${failures}
        </testcase>
      `;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<testsuite 
  name="Accessibility Tests" 
  tests="${results.summary.totalComponents}"
  failures="${results.summary.failedComponents}"
  errors="${results.errors.length}"
  time="${results.reports.reduce((sum, r) => sum + r.duration, 0) / 1000}"
>
  ${testCases}
</testsuite>`;
  }

  // Generate HTML summary report
  private generateHTMLSummary(results: CITestResult): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Test Summary</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: ${results.success ? '#dcfce7' : '#fef2f2'}; padding: 20px; border-radius: 8px; }
        .score { font-size: 2em; font-weight: bold; color: ${results.summary.overallScore >= 80 ? '#22c55e' : '#ef4444'}; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; }
        .success { border-left: 4px solid #22c55e; }
        .failure { border-left: 4px solid #ef4444; }
        .error { color: #ef4444; }
        .warning { color: #f59e0b; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Accessibility Test Summary</h1>
        <div class="score">Overall Score: ${results.summary.overallScore}/100</div>
        <p>Status: ${results.success ? '✅ PASSED' : '❌ FAILED'}</p>
        <p>Components: ${results.summary.passedComponents}/${results.summary.totalComponents} passed</p>
        <p>WCAG AA Compliance: ${results.summary.wcagCompliance ? '✅ Compliant' : '❌ Non-compliant'}</p>
    </div>
    
    <div class="grid">
        ${results.reports
          .map(
            (report) => `
            <div class="card ${report.overall.success ? 'success' : 'failure'}">
                <h3>${report.componentName || 'Unknown Component'}</h3>
                <p><strong>Score:</strong> ${report.overall.score}/100</p>
                <p><strong>Status:</strong> ${report.overall.success ? '✅ PASSED' : '❌ FAILED'}</p>
                <p><strong>Errors:</strong> <span class="error">${report.overall.errors}</span></p>
                <p><strong>Warnings:</strong> <span class="warning">${report.overall.warnings}</span></p>
                <p><strong>WCAG AA:</strong> ${report.summary.compliance.wcagAA ? '✅' : '❌'}</p>
            </div>
        `,
          )
          .join('')}
    </div>
    
    ${
      results.errors.length > 0
        ? `
    <div class="card failure">
        <h2>❌ Critical Issues</h2>
        <ul>
            ${results.errors.map((error) => `<li class="error">${error}</li>`).join('')}
        </ul>
    </div>
    `
        : ''
    }
    
    ${
      results.warnings.length > 0
        ? `
    <div class="card">
        <h2>⚠️ Warnings</h2>
        <ul>
            ${results.warnings
              .slice(0, 10)
              .map((warning) => `<li class="warning">${warning}</li>`)
              .join('')}
            ${results.warnings.length > 10 ? `<li>... and ${results.warnings.length - 10} more warnings</li>` : ''}
        </ul>
    </div>
    `
        : ''
    }
</body>
</html>
    `;
  }

  // Generate CSV report for data analysis
  private generateCSVReport(results: CITestResult): string {
    const headers = 'Component,Score,Success,Errors,Warnings,WCAG_AA,Duration';
    const rows = results.reports.map(
      (report) =>
        `"${report.componentName || 'Unknown'}",${report.overall.score},${report.overall.success},${report.overall.errors},${report.overall.warnings},${report.summary.compliance.wcagAA},${report.duration}`,
    );

    return [headers, ...rows].join('\n');
  }

  // Log results to console
  private logResults(results: CITestResult) {
    console.log('\n📊 Accessibility Test Results:');
    console.log(`Overall Score: ${results.summary.overallScore}/100`);
    console.log(`Components Tested: ${results.summary.totalComponents}`);
    console.log(`Passed: ${results.summary.passedComponents}`);
    console.log(`Failed: ${results.summary.failedComponents}`);
    console.log(`WCAG AA Compliance: ${results.summary.wcagCompliance ? '✅' : '❌'}`);

    if (results.errors.length > 0) {
      console.log('\n❌ Critical Issues:');
      results.errors.forEach((error) => {
        console.log(`  - ${error}`);
      });
    }

    if (results.warnings.length > 0) {
      console.log(`\n⚠️  Warnings: ${results.warnings.length}`);
    }

    console.log(`\n${results.success ? '✅ All tests passed!' : '❌ Some tests failed!'}`);
  }

  // Helper method to escape XML
  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // Mock HTML for testing components
  private getMockReportingDashboardHTML(): string {
    return `
      <div role="main" aria-label="Reporting Dashboard">
        <h1>Reporting Dashboard</h1>
        <nav aria-label="Report navigation">
          <ul>
            <li><a href="#financial">Financial Reports</a></li>
            <li><a href="#donations">Donation Analytics</a></li>
          </ul>
        </nav>
        <section aria-label="Report Filters">
          <h2>Filters</h2>
          <form>
            <label for="date-range">Date Range</label>
            <select id="date-range">
              <option>Last Month</option>
            </select>
            <button type="submit">Apply</button>
          </form>
        </section>
      </div>
    `;
  }

  private getMockReportBuilderHTML(): string {
    return `
      <div role="main" aria-label="Report Builder">
        <h1>Report Builder</h1>
        <aside aria-label="Data Sources">
          <h2>Data Sources</h2>
          <button draggable="true" aria-describedby="donations-desc">Donations</button>
          <div id="donations-desc" class="sr-only">Drag to add donation data</div>
        </aside>
        <main aria-label="Report Canvas">
          <div role="application" tabindex="0">Drop components here</div>
        </main>
      </div>
    `;
  }

  private getMockChartViewerHTML(): string {
    return `
      <div role="main" aria-label="Chart Viewer">
        <h1>Chart Viewer</h1>
        <div role="img" aria-label="Monthly donation trends">
          <svg><title>Donation Chart</title></svg>
        </div>
        <table>
          <caption>Chart Data</caption>
          <thead>
            <tr><th>Month</th><th>Amount</th></tr>
          </thead>
          <tbody>
            <tr><td>Jan</td><td>1000</td></tr>
          </tbody>
        </table>
      </div>
    `;
  }

  private getMockExportDialogHTML(): string {
    return `
      <div role="dialog" aria-labelledby="export-title">
        <h2 id="export-title">Export Report</h2>
        <form>
          <fieldset>
            <legend>Export Format</legend>
            <label><input type="radio" name="format" value="pdf" checked> PDF</label>
            <label><input type="radio" name="format" value="excel"> Excel</label>
          </fieldset>
          <button type="submit">Export</button>
          <button type="button">Cancel</button>
        </form>
      </div>
    `;
  }
}

// Interfaces
interface AccessibilityThresholds {
  minScore?: number;
  maxErrors?: number;
  maxWarnings?: number;
  requireWCAGAA?: boolean;
}

interface CITestResult {
  success: boolean;
  reports: (AccessibilityTestReport & { componentName?: string })[];
  summary: {
    totalComponents: number;
    passedComponents: number;
    failedComponents: number;
    overallScore: number;
    wcagCompliance: boolean;
  };
  errors: string[];
  warnings: string[];
}

// Export for use in CI/CD
export type { AccessibilityThresholds, CITestResult };
export { CIAccessibilityTester };

// CLI execution
if (require.main === module) {
  const tester = new CIAccessibilityTester();

  tester
    .runCITests()
    .then((results) => {
      process.exit(results.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('CI Accessibility Tests failed:', error);
      process.exit(1);
    });
}
