/**
 * ErrorAnalyzer Unit Tests
 *
 * Tests for error categorization, priority calculation, and suggestion generation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ErrorAnalyzer } from '../githubActions/errorAnalyzer';
import { ErrorType, ErrorCategory, type ParsedError } from '@/types/githubActions';

describe('ErrorAnalyzer', () => {
  let analyzer: ErrorAnalyzer;

  beforeEach(() => {
    analyzer = new ErrorAnalyzer();
  });

  // ============================================================================
  // Categorization Tests
  // ============================================================================

  describe('categorizeError', () => {
    it('should categorize ESLint errors as CODE_QUALITY', () => {
      const error: ParsedError = {
        type: ErrorType.ESLINT,
        message: 'Unexpected console statement',
        severity: 'error',
        rawLog: 'test log',
        rule: 'no-console',
      };

      const analyses = analyzer.analyze([error]);
      expect(analyses[0].category).toBe(ErrorCategory.CODE_QUALITY);
    });

    it('should categorize TypeScript errors as TYPE_SAFETY', () => {
      const error: ParsedError = {
        type: ErrorType.TYPESCRIPT,
        message: 'Type string is not assignable to type number',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      expect(analyses[0].category).toBe(ErrorCategory.TYPE_SAFETY);
    });

    it('should categorize build errors as BUILD_FAILURE', () => {
      const error: ParsedError = {
        type: ErrorType.BUILD,
        message: 'Module not found',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      expect(analyses[0].category).toBe(ErrorCategory.BUILD_FAILURE);
    });

    it('should categorize deploy errors as DEPLOYMENT', () => {
      const error: ParsedError = {
        type: ErrorType.DEPLOY,
        message: 'Appwrite API token invalid',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      expect(analyses[0].category).toBe(ErrorCategory.DEPLOYMENT);
    });

    it('should categorize security errors as SECURITY_VULNERABILITY', () => {
      const error: ParsedError = {
        type: ErrorType.SECURITY,
        message: 'High severity vulnerability found',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      expect(analyses[0].category).toBe(ErrorCategory.SECURITY_VULNERABILITY);
    });

    it('should categorize configuration errors as CONFIGURATION', () => {
      const error: ParsedError = {
        type: ErrorType.CONFIGURATION,
        message: 'Missing environment variable',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      expect(analyses[0].category).toBe(ErrorCategory.CONFIGURATION);
    });

    it('should categorize dependency errors as DEPENDENCY', () => {
      const error: ParsedError = {
        type: ErrorType.DEPENDENCY,
        message: 'Peer dependency not installed',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      expect(analyses[0].category).toBe(ErrorCategory.DEPENDENCY);
    });

    it('should categorize test errors as CODE_QUALITY', () => {
      const error: ParsedError = {
        type: ErrorType.TEST,
        message: 'Test failed: expected true to be false',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      expect(analyses[0].category).toBe(ErrorCategory.CODE_QUALITY);
    });

    it('should infer TYPE_SAFETY for unknown errors with type keywords', () => {
      const error: ParsedError = {
        type: ErrorType.UNKNOWN,
        message: 'Type interface mismatch detected',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      expect(analyses[0].category).toBe(ErrorCategory.TYPE_SAFETY);
    });

    it('should infer BUILD_FAILURE for unknown errors with build keywords', () => {
      const error: ParsedError = {
        type: ErrorType.UNKNOWN,
        message: 'Build compilation failed',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      expect(analyses[0].category).toBe(ErrorCategory.BUILD_FAILURE);
    });

    it('should infer DEPLOYMENT for unknown errors with deploy keywords', () => {
      const error: ParsedError = {
        type: ErrorType.UNKNOWN,
        message: 'Deploy publish failed',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      expect(analyses[0].category).toBe(ErrorCategory.DEPLOYMENT);
    });

    it('should default to CODE_QUALITY for truly unknown errors', () => {
      const error: ParsedError = {
        type: ErrorType.UNKNOWN,
        message: 'Something went wrong',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      expect(analyses[0].category).toBe(ErrorCategory.CODE_QUALITY);
    });
  });

  // ============================================================================
  // Priority Calculation Tests
  // ============================================================================

  describe('calculatePriority', () => {
    it('should assign higher priority to error severity than warning', () => {
      const errorSeverity: ParsedError = {
        type: ErrorType.ESLINT,
        message: 'Error message',
        severity: 'error',
        rawLog: 'test log',
      };

      const warningSeverity: ParsedError = {
        type: ErrorType.ESLINT,
        message: 'Warning message',
        severity: 'warning',
        rawLog: 'test log',
      };

      const errorAnalysis = analyzer.analyze([errorSeverity]);
      const warningAnalysis = analyzer.analyze([warningSeverity]);

      expect(errorAnalysis[0].priority).toBeGreaterThan(warningAnalysis[0].priority);
    });

    it('should assign higher priority to warning than info', () => {
      const warningSeverity: ParsedError = {
        type: ErrorType.ESLINT,
        message: 'Warning message',
        severity: 'warning',
        rawLog: 'test log',
      };

      const infoSeverity: ParsedError = {
        type: ErrorType.ESLINT,
        message: 'Info message',
        severity: 'info',
        rawLog: 'test log',
      };

      const warningAnalysis = analyzer.analyze([warningSeverity]);
      const infoAnalysis = analyzer.analyze([infoSeverity]);

      expect(warningAnalysis[0].priority).toBeGreaterThan(infoAnalysis[0].priority);
    });

    it('should assign highest priority to security errors', () => {
      const securityError: ParsedError = {
        type: ErrorType.SECURITY,
        message: 'Security vulnerability',
        severity: 'error',
        rawLog: 'test log',
      };

      const eslintError: ParsedError = {
        type: ErrorType.ESLINT,
        message: 'Lint error',
        severity: 'error',
        rawLog: 'test log',
      };

      const securityAnalysis = analyzer.analyze([securityError]);
      const eslintAnalysis = analyzer.analyze([eslintError]);

      expect(securityAnalysis[0].priority).toBeGreaterThan(eslintAnalysis[0].priority);
    });

    it('should prioritize build errors over lint errors', () => {
      const buildError: ParsedError = {
        type: ErrorType.BUILD,
        message: 'Build failed',
        severity: 'error',
        rawLog: 'test log',
      };

      const lintError: ParsedError = {
        type: ErrorType.ESLINT,
        message: 'Lint error',
        severity: 'error',
        rawLog: 'test log',
      };

      const buildAnalysis = analyzer.analyze([buildError]);
      const lintAnalysis = analyzer.analyze([lintError]);

      expect(buildAnalysis[0].priority).toBeGreaterThan(lintAnalysis[0].priority);
    });

    it('should boost priority for critical keywords', () => {
      const criticalError: ParsedError = {
        type: ErrorType.BUILD,
        message: 'Critical build failure',
        severity: 'error',
        rawLog: 'test log',
      };

      const normalError: ParsedError = {
        type: ErrorType.BUILD,
        message: 'Build failure',
        severity: 'error',
        rawLog: 'test log',
      };

      const criticalAnalysis = analyzer.analyze([criticalError]);
      const normalAnalysis = analyzer.analyze([normalError]);

      expect(criticalAnalysis[0].priority).toBeGreaterThan(normalAnalysis[0].priority);
    });

    it('should boost priority for vulnerability keywords', () => {
      const vulnerabilityError: ParsedError = {
        type: ErrorType.DEPENDENCY,
        message: 'Package has vulnerability',
        severity: 'error',
        rawLog: 'test log',
      };

      const normalError: ParsedError = {
        type: ErrorType.DEPENDENCY,
        message: 'Package error',
        severity: 'error',
        rawLog: 'test log',
      };

      const vulnerabilityAnalysis = analyzer.analyze([vulnerabilityError]);
      const normalAnalysis = analyzer.analyze([normalError]);

      expect(vulnerabilityAnalysis[0].priority).toBeGreaterThan(normalAnalysis[0].priority);
    });

    it('should cap priority at 100', () => {
      const maxPriorityError: ParsedError = {
        type: ErrorType.SECURITY,
        message: 'Critical severe vulnerability cannot find module',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([maxPriorityError]);
      expect(analyses[0].priority).toBeLessThanOrEqual(100);
    });

    it('should calculate different priorities for different error types', () => {
      const errors: ParsedError[] = [
        {
          type: ErrorType.SECURITY,
          message: 'Security issue',
          severity: 'error',
          rawLog: 'log1',
        },
        {
          type: ErrorType.BUILD,
          message: 'Build issue',
          severity: 'error',
          rawLog: 'log2',
        },
        {
          type: ErrorType.ESLINT,
          message: 'Lint issue',
          severity: 'error',
          rawLog: 'log3',
        },
      ];

      const analyses = analyzer.analyze(errors);

      // Security should be first (highest priority)
      expect(analyses[0].error.type).toBe(ErrorType.SECURITY);
      // Build should be second
      expect(analyses[1].error.type).toBe(ErrorType.BUILD);
      // ESLint should be last (lowest priority)
      expect(analyses[2].error.type).toBe(ErrorType.ESLINT);
    });
  });

  // ============================================================================
  // Impact Assessment Tests
  // ============================================================================

  describe('assessImpact', () => {
    it('should assess critical impact for high priority errors', () => {
      const error: ParsedError = {
        type: ErrorType.SECURITY,
        message: 'Critical vulnerability',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      expect(analyses[0].impact).toBe('critical');
    });

    it('should assess high impact for medium-high priority errors', () => {
      const error: ParsedError = {
        type: ErrorType.DEPLOY,
        message: 'Deploy failed',
        severity: 'warning',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      expect(analyses[0].impact).toBe('high');
    });

    it('should assess medium impact for moderate priority errors', () => {
      const error: ParsedError = {
        type: ErrorType.TYPESCRIPT,
        message: 'Type error',
        severity: 'warning',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      expect(analyses[0].impact).toBe('medium');
    });

    it('should assess low impact for low priority errors', () => {
      const error: ParsedError = {
        type: ErrorType.ESLINT,
        message: 'Lint warning',
        severity: 'info',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      expect(analyses[0].impact).toBe('low');
    });
  });

  // ============================================================================
  // Related Errors Tests
  // ============================================================================

  describe('findRelatedErrors', () => {
    it('should find errors in the same file', () => {
      const errors: ParsedError[] = [
        {
          type: ErrorType.BUILD,
          message: 'Error 1',
          severity: 'error',
          rawLog: 'log1',
          file: 'src/test.ts',
          line: 10,
        },
        {
          type: ErrorType.BUILD,
          message: 'Different error message',
          severity: 'error',
          rawLog: 'log2',
          file: 'src/test.ts',
          line: 20,
        },
        {
          type: ErrorType.BUILD,
          message: 'Error 3',
          severity: 'error',
          rawLog: 'log3',
          file: 'src/other.ts',
          line: 5,
        },
      ];

      const analyses = analyzer.analyze(errors);
      const firstErrorAnalysis = analyses.find((a) => a.error.line === 10);

      // Should find at least one related error (same file or same type)
      expect(firstErrorAnalysis?.relatedErrors.length).toBeGreaterThan(0);
      expect(
        firstErrorAnalysis?.relatedErrors.some((e) => e.file === 'src/test.ts' && e.line === 20)
      ).toBe(true);
    });

    it('should find errors of the same type', () => {
      const errors: ParsedError[] = [
        {
          type: ErrorType.ESLINT,
          message: 'Lint error 1',
          severity: 'error',
          rawLog: 'log1',
          file: 'src/file1.ts',
        },
        {
          type: ErrorType.ESLINT,
          message: 'Lint error 2',
          severity: 'error',
          rawLog: 'log2',
          file: 'src/file2.ts',
        },
        {
          type: ErrorType.TYPESCRIPT,
          message: 'Type error',
          severity: 'error',
          rawLog: 'log3',
          file: 'src/file3.ts',
        },
      ];

      const analyses = analyzer.analyze(errors);
      const eslintAnalysis = analyses.find((a) => a.error.file === 'src/file1.ts');

      expect(eslintAnalysis?.relatedErrors.length).toBeGreaterThan(0);
      expect(eslintAnalysis?.relatedErrors.some((e) => e.type === ErrorType.ESLINT)).toBe(true);
    });

    it('should find errors with similar messages', () => {
      const errors: ParsedError[] = [
        {
          type: ErrorType.BUILD,
          message: 'Cannot find module react in node_modules',
          severity: 'error',
          rawLog: 'log1',
          file: 'src/file1.ts',
        },
        {
          type: ErrorType.BUILD,
          message: 'Cannot find module lodash in node_modules',
          severity: 'error',
          rawLog: 'log2',
          file: 'src/file2.ts',
        },
        {
          type: ErrorType.ESLINT,
          message: 'Unexpected token',
          severity: 'error',
          rawLog: 'log3',
          file: 'src/file3.ts',
        },
      ];

      const analyses = analyzer.analyze(errors);
      const firstBuildError = analyses.find((a) => a.error.message.includes('react'));

      expect(firstBuildError?.relatedErrors.length).toBeGreaterThan(0);
      expect(firstBuildError?.relatedErrors.some((e) => e.message.includes('lodash'))).toBe(true);
    });

    it('should not include the error itself in related errors', () => {
      const errors: ParsedError[] = [
        {
          type: ErrorType.ESLINT,
          message: 'Error message',
          severity: 'error',
          rawLog: 'log1',
          file: 'src/test.ts',
        },
      ];

      const analyses = analyzer.analyze(errors);
      expect(analyses[0].relatedErrors).toHaveLength(0);
    });

    it('should handle errors with no file information', () => {
      const errors: ParsedError[] = [
        {
          type: ErrorType.BUILD,
          message: 'Build failed',
          severity: 'error',
          rawLog: 'log1',
        },
        {
          type: ErrorType.BUILD,
          message: 'Build error',
          severity: 'error',
          rawLog: 'log2',
        },
      ];

      const analyses = analyzer.analyze(errors);
      expect(analyses[0].relatedErrors.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Suggestion Generation Tests - ESLint
  // ============================================================================

  describe('generateSuggestions - ESLint', () => {
    it('should generate auto-fix suggestion for ESLint errors', () => {
      const error: ParsedError = {
        type: ErrorType.ESLINT,
        message: 'Unexpected console statement',
        severity: 'error',
        rawLog: 'test log',
        rule: 'no-console',
        file: 'src/test.ts',
        line: 10,
      };

      const analyses = analyzer.analyze([error]);
      const suggestions = analyses[0].suggestions;

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.autoFixable)).toBe(true);
      expect(suggestions.some((s) => s.command === 'npm run lint:fix')).toBe(true);
    });

    it('should include manual fix suggestion with file and line info', () => {
      const error: ParsedError = {
        type: ErrorType.ESLINT,
        message: 'Unexpected console statement',
        severity: 'error',
        rawLog: 'test log',
        rule: 'no-console',
        file: 'src/test.ts',
        line: 10,
      };

      const analyses = analyzer.analyze([error]);
      const manualSuggestion = analyses[0].suggestions.find((s) => !s.autoFixable);

      expect(manualSuggestion).toBeDefined();
      expect(manualSuggestion?.steps).toBeDefined();
      expect(manualSuggestion?.steps?.some((step) => step.includes('src/test.ts'))).toBe(true);
      expect(manualSuggestion?.steps?.some((step) => step.includes('10'))).toBe(true);
    });

    it('should include rule information in suggestions', () => {
      const error: ParsedError = {
        type: ErrorType.ESLINT,
        message: 'Unexpected console statement',
        severity: 'error',
        rawLog: 'test log',
        rule: 'no-console',
        file: 'src/test.ts',
        line: 10,
      };

      const analyses = analyzer.analyze([error]);
      const manualSuggestion = analyses[0].suggestions.find((s) => !s.autoFixable);

      expect(manualSuggestion?.steps?.some((step) => step.includes('no-console'))).toBe(true);
    });
  });

  // ============================================================================
  // Suggestion Generation Tests - TypeScript
  // ============================================================================

  describe('generateSuggestions - TypeScript', () => {
    it('should generate fix suggestion for TypeScript errors', () => {
      const error: ParsedError = {
        type: ErrorType.TYPESCRIPT,
        message: 'Type string is not assignable to type number',
        severity: 'error',
        rawLog: 'test log',
        file: 'src/test.ts',
        line: 15,
      };

      const analyses = analyzer.analyze([error]);
      const suggestions = analyses[0].suggestions;

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].title).toContain('Type Error');
      expect(suggestions[0].steps).toBeDefined();
    });

    it('should suggest adding import for missing name errors', () => {
      const error: ParsedError = {
        type: ErrorType.TYPESCRIPT,
        message: 'Cannot find name React',
        severity: 'error',
        rawLog: 'test log',
        file: 'src/test.ts',
        line: 1,
      };

      const analyses = analyzer.analyze([error]);
      const importSuggestion = analyses[0].suggestions.find((s) =>
        s.title.toLowerCase().includes('import')
      );

      expect(importSuggestion).toBeDefined();
      expect(importSuggestion?.steps).toBeDefined();
    });

    it('should suggest replacing any type', () => {
      const error: ParsedError = {
        type: ErrorType.TYPESCRIPT,
        message: 'Unexpected any. Specify a different type',
        severity: 'error',
        rawLog: 'test log',
        file: 'src/test.ts',
        line: 20,
      };

      const analyses = analyzer.analyze([error]);
      const anySuggestion = analyses[0].suggestions.find((s) =>
        s.title.toLowerCase().includes('any')
      );

      expect(anySuggestion).toBeDefined();
      expect(anySuggestion?.description).toContain('specific');
    });
  });

  // ============================================================================
  // Suggestion Generation Tests - Build
  // ============================================================================

  describe('generateSuggestions - Build', () => {
    it('should generate clean and rebuild suggestion', () => {
      const error: ParsedError = {
        type: ErrorType.BUILD,
        message: 'Build failed with unknown error',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      const cleanSuggestion = analyses[0].suggestions.find((s) =>
        s.title.toLowerCase().includes('clean')
      );

      expect(cleanSuggestion).toBeDefined();
      expect(cleanSuggestion?.command).toBeDefined();
      expect(cleanSuggestion?.autoFixable).toBe(true);
    });

    it('should suggest installing dependencies for module not found', () => {
      const error: ParsedError = {
        type: ErrorType.BUILD,
        message: 'Module not found: Cannot resolve module',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      const installSuggestion = analyses[0].suggestions.find((s) => s.command === 'npm install');

      expect(installSuggestion).toBeDefined();
      expect(installSuggestion?.autoFixable).toBe(true);
    });

    it('should suggest clearing Vite cache for Vite errors', () => {
      const error: ParsedError = {
        type: ErrorType.BUILD,
        message: 'Vite build error: cache corruption',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      const viteSuggestion = analyses[0].suggestions.find((s) =>
        s.title.toLowerCase().includes('vite')
      );

      expect(viteSuggestion).toBeDefined();
      expect(viteSuggestion?.steps).toBeDefined();
    });
  });

  // ============================================================================
  // Suggestion Generation Tests - Deploy
  // ============================================================================

  describe('generateSuggestions - Deploy', () => {
    it('should suggest updating API token for authentication errors', () => {
      const error: ParsedError = {
        type: ErrorType.DEPLOY,
        message: 'Authentication failed: Invalid API token',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      const tokenSuggestion = analyses[0].suggestions.find((s) =>
        s.title.toLowerCase().includes('token')
      );

      expect(tokenSuggestion).toBeDefined();
      expect(tokenSuggestion?.steps).toBeDefined();
      expect(tokenSuggestion?.steps?.some((step) => step.includes('Appwrite'))).toBe(true);
    });

    it('should suggest verifying configuration for project not found', () => {
      const error: ParsedError = {
        type: ErrorType.DEPLOY,
        message: 'Project not found in Appwrite',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      const configSuggestion = analyses[0].suggestions.find((s) =>
        s.title.toLowerCase().includes('configuration')
      );

      expect(configSuggestion).toBeDefined();
      expect(configSuggestion?.steps).toBeDefined();
    });

    it('should suggest checking build output for build-related deploy errors', () => {
      const error: ParsedError = {
        type: ErrorType.DEPLOY,
        message: 'Build output directory not found',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      const buildSuggestion = analyses[0].suggestions.find((s) =>
        s.title.toLowerCase().includes('build')
      );

      expect(buildSuggestion).toBeDefined();
      expect(buildSuggestion?.steps?.some((step) => step.includes('dist/'))).toBe(true);
    });
  });

  // ============================================================================
  // Suggestion Generation Tests - Security
  // ============================================================================

  describe('generateSuggestions - Security', () => {
    it('should generate audit fix suggestion for security errors', () => {
      const error: ParsedError = {
        type: ErrorType.SECURITY,
        message: 'Moderate severity vulnerability found',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      const auditSuggestion = analyses[0].suggestions.find((s) => s.command === 'npm audit fix');

      expect(auditSuggestion).toBeDefined();
      expect(auditSuggestion?.autoFixable).toBe(true);
    });

    it('should suggest force update for high/critical vulnerabilities', () => {
      const error: ParsedError = {
        type: ErrorType.SECURITY,
        message: 'High severity vulnerability in package',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      const forceSuggestion = analyses[0].suggestions.find(
        (s) => s.command === 'npm audit fix --force'
      );

      expect(forceSuggestion).toBeDefined();
      expect(forceSuggestion?.autoFixable).toBe(true);
    });

    it('should include manual review suggestion for critical vulnerabilities', () => {
      const error: ParsedError = {
        type: ErrorType.SECURITY,
        message: 'Critical vulnerability detected',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      const manualSuggestion = analyses[0].suggestions.find((s) =>
        s.title.toLowerCase().includes('manual')
      );

      expect(manualSuggestion).toBeDefined();
      expect(manualSuggestion?.autoFixable).toBe(false);
      expect(manualSuggestion?.steps).toBeDefined();
    });
  });

  // ============================================================================
  // Suggestion Generation Tests - Dependency
  // ============================================================================

  describe('generateSuggestions - Dependency', () => {
    it('should suggest installing dependencies', () => {
      const error: ParsedError = {
        type: ErrorType.DEPENDENCY,
        message: 'Missing dependency: react',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      const installSuggestion = analyses[0].suggestions.find((s) => s.command === 'npm install');

      expect(installSuggestion).toBeDefined();
      expect(installSuggestion?.autoFixable).toBe(true);
    });

    it('should provide peer dependency fix steps', () => {
      const error: ParsedError = {
        type: ErrorType.DEPENDENCY,
        message: 'Peer dependency warning: react@18 required',
        severity: 'warning',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      const peerSuggestion = analyses[0].suggestions.find((s) =>
        s.title.toLowerCase().includes('peer')
      );

      expect(peerSuggestion).toBeDefined();
      expect(peerSuggestion?.steps).toBeDefined();
    });
  });

  // ============================================================================
  // Suggestion Generation Tests - Configuration
  // ============================================================================

  describe('generateSuggestions - Configuration', () => {
    it('should suggest configuring environment variables', () => {
      const error: ParsedError = {
        type: ErrorType.CONFIGURATION,
        message: 'Missing environment variable: API_KEY',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      const envSuggestion = analyses[0].suggestions.find((s) =>
        s.title.toLowerCase().includes('environment')
      );

      expect(envSuggestion).toBeDefined();
      expect(envSuggestion?.steps).toBeDefined();
      expect(envSuggestion?.steps?.some((step) => step.includes('.env'))).toBe(true);
    });

    it('should suggest reviewing configuration files', () => {
      const error: ParsedError = {
        type: ErrorType.CONFIGURATION,
        message: 'Invalid configuration in vite.config.ts',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      const configSuggestion = analyses[0].suggestions.find((s) =>
        s.title.toLowerCase().includes('configuration')
      );

      expect(configSuggestion).toBeDefined();
      expect(configSuggestion?.steps).toBeDefined();
    });
  });

  // ============================================================================
  // Suggestion Generation Tests - Test
  // ============================================================================

  describe('generateSuggestions - Test', () => {
    it('should generate test fix suggestion', () => {
      const error: ParsedError = {
        type: ErrorType.TEST,
        message: 'Test failed: expected true to be false',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      const testSuggestion = analyses[0].suggestions[0];

      expect(testSuggestion).toBeDefined();
      expect(testSuggestion.title).toContain('Test');
      expect(testSuggestion.steps).toBeDefined();
      expect(testSuggestion.autoFixable).toBe(false);
    });
  });

  // ============================================================================
  // Suggestion Generation Tests - Unknown
  // ============================================================================

  describe('generateSuggestions - Unknown', () => {
    it('should generate generic suggestion for unknown error types', () => {
      const error: ParsedError = {
        type: ErrorType.UNKNOWN,
        message: 'Something went wrong',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      const genericSuggestion = analyses[0].suggestions[0];

      expect(genericSuggestion).toBeDefined();
      expect(genericSuggestion.title).toContain('Investigate');
      expect(genericSuggestion.autoFixable).toBe(false);
      expect(genericSuggestion.steps).toBeDefined();
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe('analyze - Integration', () => {
    it('should return empty array for empty input', () => {
      const analyses = analyzer.analyze([]);
      expect(analyses).toEqual([]);
    });

    it('should handle null/undefined input gracefully', () => {
      const analyses = analyzer.analyze(null as any);
      expect(analyses).toEqual([]);
    });

    it('should analyze multiple errors and sort by priority', () => {
      const errors: ParsedError[] = [
        {
          type: ErrorType.ESLINT,
          message: 'Lint error',
          severity: 'warning',
          rawLog: 'log1',
        },
        {
          type: ErrorType.SECURITY,
          message: 'Security vulnerability',
          severity: 'error',
          rawLog: 'log2',
        },
        {
          type: ErrorType.BUILD,
          message: 'Build failed',
          severity: 'error',
          rawLog: 'log3',
        },
      ];

      const analyses = analyzer.analyze(errors);

      expect(analyses).toHaveLength(3);
      // Should be sorted by priority (security > build > eslint)
      expect(analyses[0].error.type).toBe(ErrorType.SECURITY);
      expect(analyses[1].error.type).toBe(ErrorType.BUILD);
      expect(analyses[2].error.type).toBe(ErrorType.ESLINT);
    });

    it('should mark errors as fixable if they have auto-fixable suggestions', () => {
      const error: ParsedError = {
        type: ErrorType.ESLINT,
        message: 'Lint error',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      expect(analyses[0].fixable).toBe(true);
    });

    it('should mark errors as not fixable if they have no auto-fixable suggestions', () => {
      const error: ParsedError = {
        type: ErrorType.UNKNOWN,
        message: 'Unknown error',
        severity: 'error',
        rawLog: 'test log',
      };

      const analyses = analyzer.analyze([error]);
      expect(analyses[0].fixable).toBe(false);
    });

    it('should provide complete analysis with all fields', () => {
      const error: ParsedError = {
        type: ErrorType.TYPESCRIPT,
        message: 'Type error',
        severity: 'error',
        rawLog: 'test log',
        file: 'src/test.ts',
        line: 10,
      };

      const analyses = analyzer.analyze([error]);
      const analysis = analyses[0];

      expect(analysis.error).toBeDefined();
      expect(analysis.category).toBeDefined();
      expect(analysis.priority).toBeGreaterThan(0);
      expect(analysis.impact).toBeDefined();
      expect(typeof analysis.fixable).toBe('boolean');
      expect(Array.isArray(analysis.relatedErrors)).toBe(true);
      expect(Array.isArray(analysis.suggestions)).toBe(true);
      expect(analysis.suggestions.length).toBeGreaterThan(0);
    });

    it('should handle complex real-world scenario', () => {
      const errors: ParsedError[] = [
        {
          type: ErrorType.ESLINT,
          message: 'Unexpected console statement',
          severity: 'error',
          rawLog: 'log1',
          file: 'src/utils.ts',
          line: 15,
          rule: 'no-console',
        },
        {
          type: ErrorType.ESLINT,
          message: 'Missing semicolon',
          severity: 'error',
          rawLog: 'log2',
          file: 'src/utils.ts',
          line: 20,
          rule: 'semi',
        },
        {
          type: ErrorType.TYPESCRIPT,
          message: 'Cannot find name React',
          severity: 'error',
          rawLog: 'log3',
          file: 'src/App.tsx',
          line: 1,
        },
        {
          type: ErrorType.BUILD,
          message: 'Module not found: Cannot resolve react',
          severity: 'error',
          rawLog: 'log4',
        },
        {
          type: ErrorType.SECURITY,
          message: 'High severity vulnerability in lodash',
          severity: 'error',
          rawLog: 'log5',
        },
      ];

      const analyses = analyzer.analyze(errors);

      expect(analyses).toHaveLength(5);

      // Security should be highest priority
      expect(analyses[0].error.type).toBe(ErrorType.SECURITY);
      expect(analyses[0].impact).toBe('critical');

      // ESLint errors in same file should be related
      const eslintAnalysis = analyses.find((a) => a.error.line === 15);
      expect(eslintAnalysis?.relatedErrors.some((e) => e.line === 20)).toBe(true);

      // All should have suggestions
      analyses.forEach((analysis) => {
        expect(analysis.suggestions.length).toBeGreaterThan(0);
      });
    });
  });
});
