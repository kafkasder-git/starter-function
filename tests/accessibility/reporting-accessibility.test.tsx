/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { AccessibilityTestSuite, runComprehensiveAccessibilityTests } from './automated-testing';
import { testKeyboardNavigation } from './keyboard-navigation';
import { testScreenReaderAccessibility } from './screen-reader';
import { testColorContrast } from './color-contrast';

// Mock reporting components for testing
const MockReportingDashboard = () => (
  <div role="main" aria-label="Reporting Dashboard">
    <h1>Reporting Dashboard</h1>

    {/* Navigation */}
    <nav aria-label="Report navigation">
      <ul>
        <li>
          <a href="#financial">Financial Reports</a>
        </li>
        <li>
          <a href="#donations">Donation Analytics</a>
        </li>
        <li>
          <a href="#members">Member Analytics</a>
        </li>
        <li>
          <a href="#impact">Impact Measurement</a>
        </li>
      </ul>
    </nav>

    {/* Filter Panel */}
    <section aria-label="Report Filters">
      <h2>Filters</h2>
      <form>
        <div>
          <label htmlFor="date-range">Date Range</label>
          <select id="date-range" name="dateRange">
            <option value="last-month">Last Month</option>
            <option value="last-quarter">Last Quarter</option>
            <option value="last-year">Last Year</option>
          </select>
        </div>

        <div>
          <label htmlFor="report-type">Report Type</label>
          <select id="report-type" name="reportType">
            <option value="summary">Summary</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>

        <button type="submit">Apply Filters</button>
      </form>
    </section>

    {/* Charts Section */}
    <section aria-label="Report Charts">
      <h2>Analytics Charts</h2>

      {/* Mock chart with accessibility features */}
      <div role="img" aria-label="Monthly donation trends showing 15% increase over last quarter">
        <svg width="400" height="200" aria-hidden="true">
          <title>Monthly Donation Trends</title>
          <desc>Bar chart showing donation amounts from January to December</desc>
          <rect x="10" y="50" width="30" height="100" fill="#3b82f6" />
          <rect x="50" y="40" width="30" height="110" fill="#3b82f6" />
          <rect x="90" y="30" width="30" height="120" fill="#3b82f6" />
        </svg>
      </div>

      {/* Data table for chart data */}
      <table>
        <caption>Monthly Donation Data</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Amount (TL)</th>
            <th scope="col">Change</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>January</td>
            <td>50,000</td>
            <td>+5%</td>
          </tr>
          <tr>
            <td>February</td>
            <td>55,000</td>
            <td>+10%</td>
          </tr>
          <tr>
            <td>March</td>
            <td>60,000</td>
            <td>+9%</td>
          </tr>
        </tbody>
      </table>
    </section>

    {/* Export Section */}
    <section aria-label="Export Options">
      <h2>Export Report</h2>
      <div role="group" aria-labelledby="export-format">
        <h3 id="export-format">Export Format</h3>
        <label>
          <input type="radio" name="format" value="pdf" defaultChecked />
          PDF
        </label>
        <label>
          <input type="radio" name="format" value="excel" />
          Excel
        </label>
        <label>
          <input type="radio" name="format" value="csv" />
          CSV
        </label>
      </div>

      <button type="button" aria-describedby="export-help">
        Export Report
      </button>
      <div id="export-help">Click to download the report in the selected format</div>
    </section>

    {/* Status Messages */}
    <div role="status" aria-live="polite" id="status-messages">
      {/* Dynamic status messages will appear here */}
    </div>

    <div role="alert" aria-live="assertive" id="error-messages">
      {/* Error messages will appear here */}
    </div>
  </div>
);

const MockReportBuilder = () => (
  <div role="main" aria-label="Report Builder">
    <h1>Custom Report Builder</h1>

    {/* Drag and Drop Interface */}
    <div className="report-builder-layout">
      <aside aria-label="Data Sources">
        <h2>Data Sources</h2>
        <ul role="list">
          <li>
            <button type="button" draggable="true" aria-describedby="donations-desc">
              Donations
            </button>
            <div id="donations-desc" className="sr-only">
              Drag to add donation data to your report
            </div>
          </li>
          <li>
            <button type="button" draggable="true" aria-describedby="members-desc">
              Members
            </button>
            <div id="members-desc" className="sr-only">
              Drag to add member data to your report
            </div>
          </li>
        </ul>
      </aside>

      <main aria-label="Report Canvas">
        <h2>Report Canvas</h2>
        <div
          role="application"
          aria-label="Report design area"
          tabIndex={0}
          onKeyDown={(e) => {
            // Handle keyboard navigation for drag and drop
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              // Add component logic here
            }
          }}
        >
          <p>Drop components here to build your report</p>
        </div>
      </main>
    </div>
  </div>
);

describe('Reporting System Accessibility Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Automated Accessibility Testing', () => {
    it('should pass comprehensive accessibility tests for reporting dashboard', async () => {
      const { container } = render(<MockReportingDashboard />);

      const results = await runComprehensiveAccessibilityTests(container);

      expect(results.overall.success).toBe(true);
      expect(results.overall.errors).toHaveLength(0);

      // Log any warnings for review
      if (results.overall.warnings.length > 0) {
        console.warn('Accessibility warnings:', results.overall.warnings);
      }
    });

    it('should pass accessibility tests for report builder', async () => {
      const { container } = render(<MockReportBuilder />);

      const testSuite = new AccessibilityTestSuite(container, {
        includeAxeCore: true,
        includeKeyboardNavigation: true,
        includeScreenReader: true,
        includeColorContrast: true,
        wcagLevel: 'AA',
      });

      const results = await testSuite.runAllTests();

      expect(results.overall.success).toBe(true);
      expect(results.summary.failedTests).toBe(0);
    });
  });

  describe('Keyboard Navigation Tests', () => {
    it('should support full keyboard navigation in dashboard', async () => {
      const { container } = render(<MockReportingDashboard />);

      const results = await testKeyboardNavigation(container);

      expect(results.overall.success).toBe(true);
      expect(results.tabNavigation.success).toBe(true);
      expect(results.keyboardActivation.success).toBe(true);

      // Verify focus order includes all interactive elements
      expect(results.tabNavigation.focusOrder.length).toBeGreaterThan(0);
    });

    it('should handle escape key in modal dialogs', async () => {
      // This would test modal dialogs when they're implemented
      const { container } = render(<MockReportingDashboard />);

      const results = await testKeyboardNavigation(container);
      expect(results.escapeKey.success).toBe(true);
    });
  });

  describe('Screen Reader Accessibility Tests', () => {
    it('should have proper semantic structure', async () => {
      const { container } = render(<MockReportingDashboard />);

      const results = testScreenReaderAccessibility(container);

      expect(results.success).toBe(true);
      expect(results.results.semanticStructure.success).toBe(true);

      // Verify heading hierarchy
      const {headings} = results.results.semanticStructure.structure;
      expect(headings.length).toBeGreaterThan(0);
      expect(headings[0].tagName).toBe('H1');
    });

    it('should have proper ARIA labels and descriptions', async () => {
      const { container } = render(<MockReportingDashboard />);

      const results = testScreenReaderAccessibility(container);

      expect(results.results.ariaLabels.success).toBe(true);

      // Check that interactive elements have accessible names
      const unlabeledElements = results.results.ariaLabels.elements.filter((el) => !el.hasLabel);
      expect(unlabeledElements.length).toBeLessThanOrEqual(1);
    });

    it('should have accessible forms', async () => {
      const { container } = render(<MockReportingDashboard />);

      const results = testScreenReaderAccessibility(container);

      expect(results.results.formAccessibility.success).toBe(true);

      // Verify all form fields have labels
      results.results.formAccessibility.forms.forEach((form) => {
        form.fields.forEach((field) => {
          expect(field.hasLabel).toBe(true);
        });
      });
    });

    it('should have accessible tables', async () => {
      const { container } = render(<MockReportingDashboard />);

      const results = testScreenReaderAccessibility(container);

      expect(results.results.tableAccessibility.success).toBe(true);

      // Verify tables have captions and headers
      results.results.tableAccessibility.tables.forEach((table) => {
        expect(table.hasCaption).toBe(true);
        expect(table.hasHeaders).toBe(true);
      });
    });

    it('should have proper live regions for dynamic content', async () => {
      const { container } = render(<MockReportingDashboard />);

      const results = testScreenReaderAccessibility(container);

      expect(results.results.liveRegions.success).toBe(true);
      expect(results.results.liveRegions.liveRegions.length).toBeGreaterThan(0);
    });
  });

  describe('Color Contrast Tests', () => {
    it('should meet WCAG AA color contrast requirements', async () => {
      const { container } = render(<MockReportingDashboard />);

      const results = testColorContrast(container);

      expect(results.success).toBe(true);
      expect(results.results.textContrast.success).toBe(true);
      expect(results.results.interactiveContrast.success).toBe(true);

      // Log any contrast warnings
      if (results.warnings.length > 0) {
        console.warn('Color contrast warnings:', results.warnings);
      }
    });

    it('should not rely on color alone for information', async () => {
      const { container } = render(<MockReportingDashboard />);

      const results = testColorContrast(container);

      expect(results.results.colorOnlyInformation.success).toBe(true);

      // Warnings are acceptable for color-only information
      // as long as there are no errors
      expect(results.errors.length).toBe(0);
    });
  });

  describe('Chart Accessibility Tests', () => {
    it('should have accessible chart representations', async () => {
      const { container } = render(<MockReportingDashboard />);

      // Find chart elements
      const charts = container.querySelectorAll('[role="img"]');
      expect(charts.length).toBeGreaterThan(0);

      charts.forEach((chart) => {
        // Check for aria-label or aria-labelledby
        expect(
          chart.getAttribute('aria-label') || chart.getAttribute('aria-labelledby'),
        ).toBeTruthy();

        // Check for corresponding data table
        const table = container.querySelector('table');
        expect(table).toBeTruthy();
      });
    });
  });

  describe('Integration Tests', () => {
    it('should maintain accessibility during user interactions', async () => {
      const { container } = render(<MockReportingDashboard />);

      // Test filter interaction
      const dateSelect = screen.getByLabelText('Date Range');
      await user.selectOptions(dateSelect, 'last-quarter');

      // Run accessibility tests after interaction
      const results = await runComprehensiveAccessibilityTests(container);
      expect(results.overall.success).toBe(true);
    });

    it('should handle dynamic content updates accessibly', async () => {
      const { container } = render(<MockReportingDashboard />);

      // Simulate dynamic content update
      const statusRegion = container.querySelector('[role="status"]');
      if (statusRegion) {
        statusRegion.textContent = 'Report updated successfully';
      }

      // Verify live region is still accessible
      const results = testScreenReaderAccessibility(container);
      expect(results.results.liveRegions.success).toBe(true);
    });
  });
});
