/**
 * @fileoverview GitHub Actions Error Parser
 * @description Service for parsing and extracting structured information from GitHub Actions error logs
 */

import { logger } from '@/lib/logging/logger';

export interface ParsedError {
  id: string;
  type:
    | 'compilation'
    | 'test'
    | 'dependency'
    | 'runtime'
    | 'security'
    | 'lint'
    | 'deployment'
    | 'unknown';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  location?: {
    file?: string;
    line?: number;
    column?: number;
    function?: string;
  };
  context: {
    workflow: string;
    job: string;
    step: string;
    runner?: string;
    timestamp: string;
  };
  metadata: {
    stackTrace?: string;
    command?: string;
    exitCode?: number;
    duration?: number;
    environment?: Record<string, string>;
  };
  suggestions: string[];
  relatedErrors?: string[];
}

export interface ParseResult {
  success: boolean;
  errors: ParsedError[];
  warnings: string[];
  statistics: {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    uniqueErrors: number;
  };
}

export interface ErrorPattern {
  name: string;
  regex: RegExp;
  type: ParsedError['type'];
  severity: ParsedError['severity'];
  extractors: {
    message?: RegExp;
    file?: RegExp;
    line?: RegExp;
    column?: RegExp;
    function?: RegExp;
    command?: RegExp;
    exitCode?: RegExp;
  };
  suggestions: string[];
}

class GitHubActionsErrorParser {
  private static instance: GitHubActionsErrorParser;
  private patterns: ErrorPattern[] = [];

  public static getInstance(): GitHubActionsErrorParser {
    if (!GitHubActionsErrorParser.instance) {
      GitHubActionsErrorParser.instance = new GitHubActionsErrorParser();
    }
    return GitHubActionsErrorParser.instance;
  }

  private constructor() {
    this.initializePatterns();
    logger.info('GitHubActionsErrorParser initialized');
  }

  /**
   * Initialize error parsing patterns
   */
  private initializePatterns(): void {
    this.patterns = [
      // TypeScript compilation errors
      {
        name: 'TypeScript Error',
        regex: /error TS\d+: .+/i,
        type: 'compilation',
        severity: 'error',
        extractors: {
          message: /error TS(\d+): (.+)/i,
          file: /^(.+?)\((\d+),(\d+)\): error TS\d+:/i,
          line: /^(.+?)\((\d+),(\d+)\): error TS\d+:/i,
          column: /^(.+?)\((\d+),(\d+)\): error TS\d+:/i,
        },
        suggestions: [
          'Check TypeScript configuration',
          'Verify type definitions',
          'Update dependencies if needed',
        ],
      },

      // JavaScript syntax errors
      {
        name: 'JavaScript Syntax Error',
        regex: /syntax error|unexpected token|parse error/i,
        type: 'compilation',
        severity: 'error',
        extractors: {
          message: /(.+)/i,
          file: /^(.+?):\d+:\d+: error:/i,
          line: /^(.+?):(\d+):\d+: error:/i,
          column: /^(.+?):\d+:(\d+): error:/i,
        },
        suggestions: [
          'Check syntax in the specified file',
          'Verify brackets and parentheses',
          'Check for missing semicolons',
        ],
      },

      // Test failures
      {
        name: 'Test Failure',
        regex: /FAIL|test failed|assertion failed/i,
        type: 'test',
        severity: 'error',
        extractors: {
          message: /(.+)/i,
          file: /at (.+?):\d+:\d+/i,
          line: /at .+?:(\d+):\d+/i,
          function: /at (.+?) \(.+?:\d+:\d+\)/i,
        },
        suggestions: ['Review test logic', 'Check test data and mocks', 'Verify expected outcomes'],
      },

      // Dependency errors
      {
        name: 'Dependency Error',
        regex: /npm error|yarn error|package not found|version not found/i,
        type: 'dependency',
        severity: 'error',
        extractors: {
          message: /(.+)/i,
          command: /npm|yarn|pnpm/i,
        },
        suggestions: [
          'Check package.json dependencies',
          'Clear node_modules and reinstall',
          'Verify package versions',
        ],
      },

      // Runtime errors
      {
        name: 'Runtime Error',
        regex: /Error:|Exception:|ReferenceError|TypeError|RangeError/i,
        type: 'runtime',
        severity: 'error',
        extractors: {
          message: /(.+)/i,
          file: /at (.+?):\d+:\d+/i,
          line: /at .+?:(\d+):\d+/i,
          function: /at (.+?) \(.+?:\d+:\d+\)/i,
        },
        suggestions: [
          'Check for null/undefined values',
          'Verify object properties',
          'Add error handling',
        ],
      },

      // Security vulnerabilities
      {
        name: 'Security Vulnerability',
        regex: /vulnerability|CVE-\d+-\d+|security audit/i,
        type: 'security',
        severity: 'critical',
        extractors: {
          message: /(.+)/i,
        },
        suggestions: [
          'Update vulnerable dependencies',
          'Review security patches',
          'Run npm audit fix',
        ],
      },

      // Lint errors
      {
        name: 'Lint Error',
        regex: /ESLint|Prettier|lint error|style error/i,
        type: 'lint',
        severity: 'warning',
        extractors: {
          message: /(.+)/i,
          file: /^(.+?):\d+:\d+:/i,
          line: /^(.+?):(\d+):\d+:/i,
          column: /^(.+?):\d+:(\d+):/i,
        },
        suggestions: [
          'Fix code style issues',
          'Run linting with --fix flag',
          'Update ESLint configuration',
        ],
      },

      // Deployment errors
      {
        name: 'Deployment Error',
        regex: /deploy.*failed|build.*failed|deployment.*error/i,
        type: 'deployment',
        severity: 'error',
        extractors: {
          message: /(.+)/i,
          command: /deploy|build|docker|kubectl/i,
        },
        suggestions: [
          'Check deployment configuration',
          'Verify build environment',
          'Review deployment logs',
        ],
      },
    ];
  }

  /**
   * Parse GitHub Actions log content
   */
  async parseLog(
    logContent: string,
    context: {
      workflow: string;
      job: string;
      step: string;
      runner?: string;
      timestamp: string;
    }
  ): Promise<ParseResult> {
    const errors: ParsedError[] = [];
    const warnings: string[] = [];
    const lines = logContent.split('\n');

    try {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip empty lines and GitHub Actions markers
        if (!line.trim() || line.startsWith('##[')) {
          continue;
        }

        // Check against each pattern
        for (const pattern of this.patterns) {
          if (pattern.regex.test(line)) {
            const parsedError = this.parseError(line, lines, i, pattern, context);
            if (parsedError) {
              errors.push(parsedError);
            }
            break; // Only match first pattern
          }
        }
      }

      // Generate statistics
      const statistics = this.generateStatistics(errors);

      logger.info(`Parsed log for ${context.workflow}, found ${errors.length} errors`);

      return {
        success: true,
        errors,
        warnings,
        statistics,
      };
    } catch (error) {
      logger.error('Failed to parse GitHub Actions log', error);
      return {
        success: false,
        errors: [],
        warnings: ['Failed to parse log content'],
        statistics: {
          totalErrors: 0,
          errorsByType: {},
          errorsBySeverity: {},
          uniqueErrors: 0,
        },
      };
    }
  }

  /**
   * Parse individual error from log line
   */
  private parseError(
    line: string,
    allLines: string[],
    lineIndex: number,
    pattern: ErrorPattern,
    context: ParsedError['context']
  ): ParsedError | null {
    try {
      const error: ParsedError = {
        id: this.generateErrorId(),
        type: pattern.type,
        severity: pattern.severity,
        message: this.extractMessage(line, pattern),
        context,
        metadata: {},
        suggestions: [...pattern.suggestions],
      };

      // Extract location information
      const location = this.extractLocation(line, allLines, lineIndex, pattern);
      if (location) {
        error.location = location;
      }

      // Extract metadata
      const metadata = this.extractMetadata(line, allLines, lineIndex, pattern);
      if (metadata) {
        error.metadata = { ...error.metadata, ...metadata };
      }

      // Extract stack trace if available
      const stackTrace = this.extractStackTrace(allLines, lineIndex);
      if (stackTrace) {
        error.metadata.stackTrace = stackTrace;
      }

      return error;
    } catch (error) {
      logger.error('Failed to parse individual error', error);
      return null;
    }
  }

  /**
   * Extract error message
   */
  private extractMessage(line: string, pattern: ErrorPattern): string {
    if (pattern.extractors.message) {
      const match = line.match(pattern.extractors.message);
      if (match) {
        return match[2] || match[1] || line.trim();
      }
    }
    return line.trim();
  }

  /**
   * Extract location information
   */
  private extractLocation(
    line: string,
    allLines: string[],
    lineIndex: number,
    pattern: ErrorPattern
  ): ParsedError['location'] | null {
    const location: ParsedError['location'] = {};

    // Extract file path
    if (pattern.extractors.file) {
      const match = line.match(pattern.extractors.file);
      if (match) {
        location.file = match[1];
      }
    }

    // Extract line number
    if (pattern.extractors.line) {
      const match = line.match(pattern.extractors.line);
      if (match) {
        location.line = parseInt(match[2] || match[1], 10);
      }
    }

    // Extract column number
    if (pattern.extractors.column) {
      const match = line.match(pattern.extractors.column);
      if (match) {
        location.column = parseInt(match[3] || match[2] || match[1], 10);
      }
    }

    // Extract function name
    if (pattern.extractors.function) {
      const match = line.match(pattern.extractors.function);
      if (match) {
        location.function = match[1];
      }
    }

    return Object.keys(location).length > 0 ? location : null;
  }

  /**
   * Extract metadata
   */
  private extractMetadata(
    line: string,
    allLines: string[],
    lineIndex: number,
    pattern: ErrorPattern
  ): Record<string, any> | null {
    const metadata: Record<string, any> = {};

    // Extract command
    if (pattern.extractors.command) {
      const match = line.match(pattern.extractors.command);
      if (match) {
        metadata.command = match[0];
      }
    }

    // Extract exit code
    if (pattern.extractors.exitCode) {
      const match = line.match(pattern.extractors.exitCode);
      if (match) {
        metadata.exitCode = parseInt(match[1], 10);
      }
    }

    // Look for exit code in surrounding lines
    for (let i = Math.max(0, lineIndex - 5); i < Math.min(allLines.length, lineIndex + 5); i++) {
      const exitMatch = allLines[i].match(/exit code (\d+)/i);
      if (exitMatch) {
        metadata.exitCode = parseInt(exitMatch[1], 10);
        break;
      }
    }

    return Object.keys(metadata).length > 0 ? metadata : null;
  }

  /**
   * Extract stack trace
   */
  private extractStackTrace(allLines: string[], lineIndex: number): string | null {
    const stackLines: string[] = [];

    // Look ahead for stack trace
    for (let i = lineIndex + 1; i < Math.min(allLines.length, lineIndex + 20); i++) {
      const line = allLines[i];

      if (line.trim() === '' || line.startsWith('##[')) {
        break;
      }

      if (line.includes('at ') || line.includes('Error:') || line.includes('Exception:')) {
        stackLines.push(line);
      }
    }

    return stackLines.length > 0 ? stackLines.join('\n') : null;
  }

  /**
   * Generate statistics
   */
  private generateStatistics(errors: ParsedError[]): ParseResult['statistics'] {
    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    const uniqueMessages = new Set<string>();

    errors.forEach((error) => {
      // Count by type
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;

      // Count by severity
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;

      // Count unique messages
      uniqueMessages.add(error.message);
    });

    return {
      totalErrors: errors.length,
      errorsByType,
      errorsBySeverity,
      uniqueErrors: uniqueMessages.size,
    };
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `parsed_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add custom error pattern
   */
  addCustomPattern(pattern: ErrorPattern): void {
    this.patterns.push(pattern);
    logger.info(`Added custom error pattern: ${pattern.name}`);
  }

  /**
   * Get all patterns
   */
  getPatterns(): ErrorPattern[] {
    return [...this.patterns];
  }

  /**
   * Clear patterns and reset to defaults
   */
  resetPatterns(): void {
    this.patterns = [];
    this.initializePatterns();
    logger.info('Reset error patterns to defaults');
  }

  /**
   * Export parsing configuration
   */
  exportConfiguration(): string {
    const config = {
      patterns: this.patterns,
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(config, null, 2);
  }
}

// Export singleton instance
export const githubActionsErrorParser = GitHubActionsErrorParser.getInstance();
export default githubActionsErrorParser;
