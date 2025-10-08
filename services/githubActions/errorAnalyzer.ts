/**
 * Error Analyzer Service
 *
 * Analyzes parsed errors to categorize them, assess their impact,
 * calculate priority, and generate fix suggestions.
 */

import {
  ErrorType,
  ErrorCategory,
  type ParsedError,
  type ErrorAnalysis,
  type ErrorImpact,
  type FixSuggestion,
} from '@/types/githubActions';

/**
 * ErrorAnalyzer class
 *
 * Responsible for analyzing parsed errors and providing actionable insights.
 * Categorizes errors, calculates priority, assesses impact, and generates fix suggestions.
 */
export class ErrorAnalyzer {
  /**
   * Main analyze method
   *
   * Analyzes an array of parsed errors and returns detailed analysis for each.
   * Groups related errors and generates comprehensive fix suggestions.
   *
   * @param errors - Array of parsed errors to analyze
   * @returns Array of error analyses with suggestions
   *
   * @example
   * ```typescript
   * const analyzer = new ErrorAnalyzer();
   * const analyses = analyzer.analyze(parsedErrors);
   * analyses.forEach(analysis => {
   *   console.log(`${analysis.error.message} - Priority: ${analysis.priority}`);
   * });
   * ```
   */
  analyze(errors: ParsedError[]): ErrorAnalysis[] {
    if (!errors || errors.length === 0) {
      return [];
    }

    const analyses: ErrorAnalysis[] = [];

    for (const error of errors) {
      const category = this.categorizeError(error);
      const priority = this.calculatePriority(error);
      const impact = this.assessImpact(error);
      const relatedErrors = this.findRelatedErrors(error, errors);
      const suggestions = this.generateSuggestions(error);
      const fixable = suggestions.some((s) => s.autoFixable);

      const analysis: ErrorAnalysis = {
        error,
        category,
        priority,
        impact,
        fixable,
        relatedErrors,
        suggestions,
      };

      analyses.push(analysis);
    }

    // Sort by priority (higher priority first)
    return analyses.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Categorizes an error into a specific category
   *
   * Maps error types to broader categories for better organization
   * and filtering.
   *
   * @param error - Parsed error to categorize
   * @returns Error category
   *
   * @example
   * ```typescript
   * const category = analyzer.categorizeError(eslintError);
   * // Returns: ErrorCategory.CODE_QUALITY
   * ```
   */
  private categorizeError(error: ParsedError): ErrorCategory {
    switch (error.type) {
      case ErrorType.ESLINT:
        return ErrorCategory.CODE_QUALITY;

      case ErrorType.TYPESCRIPT:
        return ErrorCategory.TYPE_SAFETY;

      case ErrorType.BUILD:
        return ErrorCategory.BUILD_FAILURE;

      case ErrorType.DEPLOY:
        return ErrorCategory.DEPLOYMENT;

      case ErrorType.SECURITY:
        return ErrorCategory.SECURITY_VULNERABILITY;

      case ErrorType.CONFIGURATION:
        return ErrorCategory.CONFIGURATION;

      case ErrorType.DEPENDENCY:
        return ErrorCategory.DEPENDENCY;

      case ErrorType.TEST:
        // Tests can be code quality issues
        return ErrorCategory.CODE_QUALITY;

      case ErrorType.UNKNOWN:
      default:
        // Try to infer from message
        const lowerMessage = error.message.toLowerCase();
        if (lowerMessage.includes('type') || lowerMessage.includes('interface')) {
          return ErrorCategory.TYPE_SAFETY;
        }
        if (lowerMessage.includes('build') || lowerMessage.includes('compile')) {
          return ErrorCategory.BUILD_FAILURE;
        }
        if (lowerMessage.includes('deploy') || lowerMessage.includes('publish')) {
          return ErrorCategory.DEPLOYMENT;
        }
        return ErrorCategory.CODE_QUALITY;
    }
  }

  /**
   * Calculates priority score for an error
   *
   * Priority is calculated based on:
   * - Error severity (error > warning > info)
   * - Error type (security > build > deploy > type > lint)
   * - Impact on workflow (blocking vs non-blocking)
   *
   * @param error - Parsed error to evaluate
   * @returns Priority score (0-100, higher is more urgent)
   *
   * @example
   * ```typescript
   * const priority = analyzer.calculatePriority(securityError);
   * // Returns: 95 (very high priority)
   * ```
   */
  private calculatePriority(error: ParsedError): number {
    let priority = 0;

    // Base priority by severity
    switch (error.severity) {
      case 'error':
        priority += 50;
        break;
      case 'warning':
        priority += 30;
        break;
      case 'info':
        priority += 10;
        break;
    }

    // Additional priority by error type
    switch (error.type) {
      case ErrorType.SECURITY:
        priority += 40; // Security issues are critical
        break;
      case ErrorType.BUILD:
        priority += 35; // Build failures block everything
        break;
      case ErrorType.DEPLOY:
        priority += 30; // Deploy issues prevent releases
        break;
      case ErrorType.TYPESCRIPT:
        priority += 25; // Type errors can cause runtime issues
        break;
      case ErrorType.DEPENDENCY:
        priority += 20; // Dependency issues can cascade
        break;
      case ErrorType.CONFIGURATION:
        priority += 15; // Config issues affect functionality
        break;
      case ErrorType.ESLINT:
        priority += 10; // Lint issues are important but less critical
        break;
      case ErrorType.TEST:
        priority += 15; // Test failures indicate bugs
        break;
      default:
        priority += 5;
    }

    // Boost priority for specific critical patterns
    const lowerMessage = error.message.toLowerCase();
    if (lowerMessage.includes('critical') || lowerMessage.includes('severe')) {
      priority += 10;
    }
    if (lowerMessage.includes('vulnerability')) {
      priority += 15;
    }
    if (lowerMessage.includes('cannot find') || lowerMessage.includes('not found')) {
      priority += 5;
    }

    // Cap at 100
    return Math.min(priority, 100);
  }

  /**
   * Assesses the impact level of an error
   *
   * Impact is determined by how much the error affects the workflow
   * and the application functionality.
   *
   * @param error - Parsed error to assess
   * @returns Impact level
   *
   * @example
   * ```typescript
   * const impact = analyzer.assessImpact(buildError);
   * // Returns: 'critical' (blocks entire workflow)
   * ```
   */
  private assessImpact(error: ParsedError): ErrorImpact {
    const priority = this.calculatePriority(error);

    // Map priority to impact levels
    if (priority >= 80) {
      return 'critical';
    } else if (priority >= 60) {
      return 'high';
    } else if (priority >= 40) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Finds errors related to the given error
   *
   * Related errors are those that:
   * - Occur in the same file
   * - Have the same error type
   * - Have similar messages
   *
   * @param error - Error to find relations for
   * @param allErrors - All errors to search through
   * @returns Array of related errors
   *
   * @example
   * ```typescript
   * const related = analyzer.findRelatedErrors(error, allErrors);
   * console.log(`Found ${related.length} related errors`);
   * ```
   */
  private findRelatedErrors(error: ParsedError, allErrors: ParsedError[]): ParsedError[] {
    const related: ParsedError[] = [];

    for (const otherError of allErrors) {
      // Skip the same error
      if (otherError === error) {
        continue;
      }

      // Same file
      if (error.file && otherError.file === error.file) {
        related.push(otherError);
        continue;
      }

      // Same error type
      if (otherError.type === error.type) {
        related.push(otherError);
        continue;
      }

      // Similar message (simple similarity check)
      if (this.areSimilarMessages(error.message, otherError.message)) {
        related.push(otherError);
      }
    }

    return related;
  }

  /**
   * Checks if two error messages are similar
   *
   * @param message1 - First message
   * @param message2 - Second message
   * @returns True if messages are similar
   */
  private areSimilarMessages(message1: string, message2: string): boolean {
    // Simple similarity: check if they share significant words
    const words1 = message1
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const words2 = message2
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);

    if (words1.length === 0 || words2.length === 0) {
      return false;
    }

    const commonWords = words1.filter((w) => words2.includes(w));
    const similarity = commonWords.length / Math.max(words1.length, words2.length);

    return similarity > 0.5; // 50% similarity threshold
  }

  /**
   * Generates fix suggestions for an error
   *
   * Creates actionable suggestions based on error type and content.
   * Includes both automatic and manual fix options.
   *
   * @param error - Parsed error to generate suggestions for
   * @returns Array of fix suggestions
   *
   * @example
   * ```typescript
   * const suggestions = analyzer.generateSuggestions(eslintError);
   * suggestions.forEach(s => console.log(s.title));
   * ```
   */
  private generateSuggestions(error: ParsedError): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];

    switch (error.type) {
      case ErrorType.ESLINT:
        suggestions.push(...this.generateESLintSuggestions(error));
        break;

      case ErrorType.TYPESCRIPT:
        suggestions.push(...this.generateTypeScriptSuggestions(error));
        break;

      case ErrorType.BUILD:
        suggestions.push(...this.generateBuildSuggestions(error));
        break;

      case ErrorType.DEPLOY:
        suggestions.push(...this.generateDeploySuggestions(error));
        break;

      case ErrorType.SECURITY:
        suggestions.push(...this.generateSecuritySuggestions(error));
        break;

      case ErrorType.DEPENDENCY:
        suggestions.push(...this.generateDependencySuggestions(error));
        break;

      case ErrorType.CONFIGURATION:
        suggestions.push(...this.generateConfigurationSuggestions(error));
        break;

      case ErrorType.TEST:
        suggestions.push(...this.generateTestSuggestions(error));
        break;

      default:
        suggestions.push(this.generateGenericSuggestion(error));
    }

    return suggestions;
  }

  /**
   * Generates ESLint-specific fix suggestions
   */
  private generateESLintSuggestions(error: ParsedError): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];

    // Auto-fixable ESLint errors
    suggestions.push({
      title: 'Run ESLint Auto-Fix',
      description: 'Automatically fix ESLint errors using the --fix flag',
      command: 'npm run lint:fix',
      autoFixable: true,
      estimatedTime: '1-2 minutes',
    });

    // Manual fix suggestion
    if (error.file && error.line) {
      suggestions.push({
        title: 'Manual Fix',
        description: `Fix the ESLint error in ${error.file} at line ${error.line}`,
        autoFixable: false,
        estimatedTime: '5-10 minutes',
        steps: [
          `Open ${error.file}`,
          `Navigate to line ${error.line}`,
          `Fix the issue: ${error.message}`,
          error.rule ? `Refer to ESLint rule: ${error.rule}` : 'Check ESLint documentation',
        ],
      });
    }

    return suggestions;
  }

  /**
   * Generates TypeScript-specific fix suggestions
   */
  private generateTypeScriptSuggestions(error: ParsedError): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];

    suggestions.push({
      title: 'Fix Type Error',
      description: 'Resolve the TypeScript type error',
      autoFixable: false,
      estimatedTime: '10-15 minutes',
      steps: [
        error.file ? `Open ${error.file}` : 'Open the affected file',
        error.line ? `Navigate to line ${error.line}` : 'Find the error location',
        'Check the expected type vs actual type',
        'Add proper type annotations or fix type mismatch',
        'Run type-check to verify: npm run type-check',
      ],
    });

    // Check for common TypeScript errors
    const lowerMessage = error.message.toLowerCase();

    if (lowerMessage.includes('cannot find name') || lowerMessage.includes('cannot find module')) {
      suggestions.push({
        title: 'Add Missing Import',
        description: 'Import the missing type or module',
        autoFixable: false,
        estimatedTime: '2-5 minutes',
        steps: [
          'Identify the missing type or module',
          'Add the appropriate import statement',
          "If it's a third-party type, install @types package: npm install --save-dev @types/package-name",
        ],
      });
    }

    if (lowerMessage.includes('any')) {
      suggestions.push({
        title: 'Replace "any" Type',
        description: 'Use specific types instead of "any"',
        autoFixable: false,
        estimatedTime: '5-10 minutes',
        steps: [
          'Analyze how the variable is used',
          'Determine the appropriate type',
          'Replace "any" with the specific type',
          'Consider using union types or generics if needed',
        ],
      });
    }

    return suggestions;
  }

  /**
   * Generates build-specific fix suggestions
   */
  private generateBuildSuggestions(error: ParsedError): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];

    suggestions.push({
      title: 'Clean and Rebuild',
      description: 'Clean build artifacts and rebuild the project',
      command: 'npm run clean && npm install && npm run build',
      autoFixable: true,
      estimatedTime: '3-5 minutes',
    });

    const lowerMessage = error.message.toLowerCase();

    if (lowerMessage.includes('module not found') || lowerMessage.includes('cannot find module')) {
      suggestions.push({
        title: 'Install Dependencies',
        description: 'Install missing dependencies',
        command: 'npm install',
        autoFixable: true,
        estimatedTime: '2-3 minutes',
      });
    }

    if (lowerMessage.includes('vite') || lowerMessage.includes('cache')) {
      suggestions.push({
        title: 'Clear Vite Cache',
        description: 'Clear Vite cache and rebuild',
        autoFixable: false,
        estimatedTime: '2-3 minutes',
        steps: [
          'Delete node_modules/.vite directory',
          'Run: npm run build',
          'If issue persists, try: npm run fresh',
        ],
      });
    }

    return suggestions;
  }

  /**
   * Generates deploy-specific fix suggestions
   */
  private generateDeploySuggestions(error: ParsedError): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];

    const lowerMessage = error.message.toLowerCase();

    if (lowerMessage.includes('api token') || lowerMessage.includes('authentication')) {
      suggestions.push({
        title: 'Update Cloudflare API Token',
        description: 'Generate and configure a new Cloudflare API token',
        autoFixable: false,
        estimatedTime: '5-10 minutes',
        steps: [
          'Go to Cloudflare Dashboard > My Profile > API Tokens',
          'Create a new API token with "Edit Cloudflare Pages" permissions',
          'Add token to GitHub Secrets as CLOUDFLARE_API_TOKEN',
          'Verify token has correct permissions',
        ],
      });
    }

    if (lowerMessage.includes('project') || lowerMessage.includes('not found')) {
      suggestions.push({
        title: 'Verify Cloudflare Configuration',
        description: 'Check Cloudflare Pages project configuration',
        autoFixable: false,
        estimatedTime: '5-10 minutes',
        steps: [
          'Verify project name in wrangler.toml or workflow file',
          'Check CLOUDFLARE_ACCOUNT_ID in GitHub Secrets',
          'Ensure project exists in Cloudflare Pages dashboard',
          'Verify account ID matches the project account',
        ],
      });
    }

    if (lowerMessage.includes('build') || lowerMessage.includes('output')) {
      suggestions.push({
        title: 'Check Build Output',
        description: 'Verify build output directory exists',
        autoFixable: false,
        estimatedTime: '3-5 minutes',
        steps: [
          'Ensure build step completes successfully',
          'Verify dist/ directory is created',
          'Check directory parameter in deploy step matches build output',
          'Review build logs for errors',
        ],
      });
    }

    return suggestions;
  }

  /**
   * Generates security-specific fix suggestions
   */
  private generateSecuritySuggestions(error: ParsedError): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];

    suggestions.push({
      title: 'Run Security Audit Fix',
      description: 'Automatically fix security vulnerabilities',
      command: 'npm audit fix',
      autoFixable: true,
      estimatedTime: '2-5 minutes',
    });

    const lowerMessage = error.message.toLowerCase();

    if (lowerMessage.includes('high') || lowerMessage.includes('critical')) {
      suggestions.push({
        title: 'Force Update Vulnerable Packages',
        description: 'Force update packages with security vulnerabilities',
        command: 'npm audit fix --force',
        autoFixable: true,
        estimatedTime: '3-5 minutes',
      });

      suggestions.push({
        title: 'Manual Security Review',
        description: 'Review and manually update vulnerable packages',
        autoFixable: false,
        estimatedTime: '15-30 minutes',
        steps: [
          'Run: npm audit to see detailed report',
          'Identify vulnerable packages and their versions',
          'Check if updates are available',
          'Update packages manually if needed',
          'Test application after updates',
          'Consider alternative packages if no fix available',
        ],
      });
    }

    return suggestions;
  }

  /**
   * Generates dependency-specific fix suggestions
   */
  private generateDependencySuggestions(error: ParsedError): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];
    const lowerMessage = error.message.toLowerCase();

    suggestions.push({
      title: 'Install Dependencies',
      description: 'Install all project dependencies',
      command: 'npm install',
      autoFixable: true,
      estimatedTime: '2-3 minutes',
    });

    if (lowerMessage.includes('peer')) {
      suggestions.push({
        title: 'Fix Peer Dependencies',
        description: 'Install missing peer dependencies',
        autoFixable: false,
        estimatedTime: '5-10 minutes',
        steps: [
          'Check npm warnings for peer dependency requirements',
          'Install required peer dependencies',
          'Verify version compatibility',
          'Run: npm install to complete installation',
        ],
      });
    }

    return suggestions;
  }

  /**
   * Generates configuration-specific fix suggestions
   */
  private generateConfigurationSuggestions(error: ParsedError): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];
    const lowerMessage = error.message.toLowerCase();

    if (lowerMessage.includes('env') || lowerMessage.includes('environment')) {
      suggestions.push({
        title: 'Configure Environment Variables',
        description: 'Set up required environment variables',
        autoFixable: false,
        estimatedTime: '5-10 minutes',
        steps: [
          'Check .env.example for required variables',
          'Create or update .env file',
          'Add variables to GitHub Secrets for CI/CD',
          'Verify all required variables are set',
        ],
      });
    }

    suggestions.push({
      title: 'Review Configuration Files',
      description: 'Check and update configuration files',
      autoFixable: false,
      estimatedTime: '10-15 minutes',
      steps: [
        'Review relevant config files (vite.config.ts, tsconfig.json, etc.)',
        'Verify all paths and settings are correct',
        'Check for syntax errors in config files',
        'Ensure config matches project structure',
      ],
    });

    return suggestions;
  }

  /**
   * Generates test-specific fix suggestions
   */
  private generateTestSuggestions(error: ParsedError): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];

    suggestions.push({
      title: 'Fix Failing Test',
      description: `Update test or fix the code causing test failure: ${error.message}`,
      autoFixable: false,
      estimatedTime: '10-20 minutes',
      steps: [
        'Run tests locally to reproduce: npm test',
        'Identify the failing test case',
        'Determine if test needs updating or code needs fixing',
        'Fix the issue and verify test passes',
        'Run full test suite to ensure no regressions',
      ],
    });

    return suggestions;
  }

  /**
   * Generates a generic fix suggestion for unknown error types
   */
  private generateGenericSuggestion(error: ParsedError): FixSuggestion {
    return {
      title: 'Investigate Error',
      description: `Manually investigate and fix the error: ${error.message}`,
      autoFixable: false,
      estimatedTime: '15-30 minutes',
      steps: [
        'Review the error message carefully',
        'Check the workflow logs for more context',
        'Search for similar issues online',
        'Try to reproduce the error locally',
        'Apply appropriate fix based on findings',
      ],
    };
  }
}

/**
 * Create a singleton instance for convenience
 */
export const errorAnalyzer = new ErrorAnalyzer();
