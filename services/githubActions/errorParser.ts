/**
 * Error Parser Service
 *
 * Parses GitHub Actions workflow logs to extract and categorize errors.
 * Supports multiple error types including ESLint, TypeScript, Build, Deploy, and Security errors.
 */

import {
  ErrorType,
  type ParsedError,
  type ErrorSeverity,
  type FileLocation,
} from '@/types/githubActions';

/**
 * ErrorParser class
 *
 * Responsible for parsing workflow logs and extracting structured error information.
 * Implements pattern matching for different error types and formats.
 */
export class ErrorParser {
  /**
   * Main parse method
   *
   * Parses workflow logs and extracts all errors found.
   * Automatically detects error types and extracts relevant information.
   *
   * @param logs - Raw workflow log string
   * @returns Array of parsed errors
   *
   * @example
   * ```typescript
   * const parser = new ErrorParser();
   * const errors = parser.parse(workflowLogs);
   * console.log(`Found ${errors.length} errors`);
   * ```
   */
  parse(logs: string): ParsedError[] {
    if (!logs || logs.trim().length === 0) {
      return [];
    }

    const errors: ParsedError[] = [];
    const lines = logs.split('\n');

    // Process logs line by line to detect errors
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const errorType = this.detectErrorType(line);

      if (errorType !== ErrorType.UNKNOWN) {
        // Extract context lines (previous and next lines for better understanding)
        const context = this.extractContext(lines, i);

        // Parse based on detected error type
        const parsedError = this.parseErrorLine(line, errorType, context);

        if (parsedError) {
          errors.push(parsedError);
        }
      }
    }

    return errors;
  }

  /**
   * Detects the type of error from a log line
   *
   * Uses pattern matching to identify error types based on common patterns
   * in different tools and frameworks.
   *
   * @param log - Single log line to analyze
   * @returns Detected error type
   *
   * @example
   * ```typescript
   * const type = parser.detectErrorType("error TS2304: Cannot find name 'Foo'");
   * // Returns: ErrorType.TYPESCRIPT
   * ```
   */
  private detectErrorType(log: string): ErrorType {
    const lowerLog = log.toLowerCase();

    // ESLint patterns
    if (
      lowerLog.includes('eslint') ||
      /\s+(error|warning)\s+.*\s+[a-z-]+\/[a-z-]+$/.test(log) || // ESLint rule format
      /\d+:\d+\s+(error|warning)/.test(log) // Line:column error/warning format
    ) {
      return ErrorType.ESLINT;
    }

    // TypeScript patterns
    if (
      lowerLog.includes('error ts') ||
      /error TS\d+:/.test(log) ||
      lowerLog.includes('type error') ||
      lowerLog.includes('typescript')
    ) {
      return ErrorType.TYPESCRIPT;
    }

    // Dependency error patterns (check before build errors as they're more specific)
    if (
      lowerLog.includes('npm err') ||
      (lowerLog.includes('package') && lowerLog.includes('not found')) ||
      lowerLog.includes('dependency') ||
      lowerLog.includes('peer dep') ||
      lowerLog.includes('cannot find module')
    ) {
      return ErrorType.DEPENDENCY;
    }

    // Build error patterns
    if (
      lowerLog.includes('build failed') ||
      lowerLog.includes('build error') ||
      (lowerLog.includes('vite') && lowerLog.includes('error')) ||
      lowerLog.includes('module not found')
    ) {
      return ErrorType.BUILD;
    }

    // Cloudflare deploy patterns
    if (
      lowerLog.includes('cloudflare') ||
      lowerLog.includes('wrangler') ||
      (lowerLog.includes('pages') && lowerLog.includes('deploy')) ||
      lowerLog.includes('api token') ||
      lowerLog.includes('account id')
    ) {
      return ErrorType.DEPLOY;
    }

    // Security audit patterns
    if (
      lowerLog.includes('vulnerability') ||
      lowerLog.includes('security') ||
      lowerLog.includes('audit') ||
      lowerLog.includes('cve-') ||
      lowerLog.includes('high severity') ||
      lowerLog.includes('critical severity')
    ) {
      return ErrorType.SECURITY;
    }

    // Test error patterns
    if (
      lowerLog.includes('test failed') ||
      lowerLog.includes('test error') ||
      lowerLog.includes('vitest') ||
      lowerLog.includes('playwright') ||
      lowerLog.includes('assertion')
    ) {
      return ErrorType.TEST;
    }

    // Configuration error patterns
    if (
      lowerLog.includes('config') ||
      lowerLog.includes('configuration') ||
      lowerLog.includes('.env') ||
      lowerLog.includes('environment variable')
    ) {
      return ErrorType.CONFIGURATION;
    }

    return ErrorType.UNKNOWN;
  }

  /**
   * Parses a single error line based on its type
   *
   * @param line - The log line containing the error
   * @param errorType - The detected error type
   * @param context - Surrounding lines for context
   * @returns Parsed error object or null if parsing fails
   */
  private parseErrorLine(
    line: string,
    errorType: ErrorType,
    context: string[],
  ): ParsedError | null {
    const location = this.extractFileLocation(line);
    const severity = this.extractSeverity(line);
    const message = this.extractMessage(line, errorType);
    const rule = this.extractRule(line, errorType);

    if (!message) {
      return null;
    }

    const parsedError: ParsedError = {
      type: errorType,
      message,
      severity,
      rawLog: line,
      context,
    };

    // Add optional properties only if they exist
    if (location.file) {
      parsedError.file = location.file;
    }
    if (location.line !== undefined) {
      parsedError.line = location.line;
    }
    if (location.column !== undefined) {
      parsedError.column = location.column;
    }
    if (rule) {
      parsedError.rule = rule;
    }

    return parsedError;
  }

  /**
   * Extracts file location information from a log line
   *
   * Supports multiple formats:
   * - /path/to/file.ts:10:5
   * - file.ts(10,5)
   * - at file.ts:10:5
   *
   * @param log - Log line to parse
   * @returns File location information
   *
   * @example
   * ```typescript
   * const location = parser.extractFileLocation("src/app.ts:42:10 - error");
   * // Returns: { file: "src/app.ts", line: 42, column: 10 }
   * ```
   */
  private extractFileLocation(log: string): FileLocation {
    const location: FileLocation = {};

    // Pattern 1: /path/to/file.ts:line:column (with optional dash separator)
    const pattern1 = /([^\s:]+\.(ts|tsx|js|jsx|vue|svelte)):(\d+):(\d+)(?:\s*-)?/;
    const match1 = log.match(pattern1);
    if (match1 && match1[1] && match1[3] && match1[4]) {
      location.file = match1[1];
      location.line = parseInt(match1[3], 10);
      location.column = parseInt(match1[4], 10);
      return location;
    }

    // Pattern 2: file.ts(line,column)
    const pattern2 = /([^\s:]+\.(ts|tsx|js|jsx|vue|svelte))\((\d+),(\d+)\)/;
    const match2 = log.match(pattern2);
    if (match2 && match2[1] && match2[3] && match2[4]) {
      location.file = match2[1];
      location.line = parseInt(match2[3], 10);
      location.column = parseInt(match2[4], 10);
      return location;
    }

    // Pattern 3: at file.ts:line:column
    const pattern3 = /at\s+([^\s:]+\.(ts|tsx|js|jsx|vue|svelte)):(\d+):(\d+)/;
    const match3 = log.match(pattern3);
    if (match3 && match3[1] && match3[3] && match3[4]) {
      location.file = match3[1];
      location.line = parseInt(match3[3], 10);
      location.column = parseInt(match3[4], 10);
      return location;
    }

    // Pattern 4: Just file path without line numbers
    const pattern4 = /([^\s:]+\.(ts|tsx|js|jsx|vue|svelte))/;
    const match4 = log.match(pattern4);
    if (match4 && match4[1]) {
      location.file = match4[1];
    }

    return location;
  }

  /**
   * Extracts error severity from a log line
   *
   * @param log - Log line to analyze
   * @returns Error severity level
   */
  private extractSeverity(log: string): ErrorSeverity {
    const lowerLog = log.toLowerCase();

    if (lowerLog.includes('error') || lowerLog.includes('✖')) {
      return 'error';
    }

    if (lowerLog.includes('warning') || lowerLog.includes('⚠')) {
      return 'warning';
    }

    return 'info';
  }

  /**
   * Extracts the error message from a log line
   *
   * @param log - Log line to parse
   * @param errorType - Type of error
   * @returns Extracted error message
   */
  private extractMessage(log: string, errorType: ErrorType): string {
    // Remove ANSI color codes
    const cleanLog = log.replace(/\x1b\[[0-9;]*m/g, '');

    // For ESLint errors, extract message before the rule name
    if (errorType === ErrorType.ESLINT) {
      const match = cleanLog.match(/error\s+(.+?)\s+[a-z-]+\/[a-z-]+$/i);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // For TypeScript errors, extract message after error code
    if (errorType === ErrorType.TYPESCRIPT) {
      const match = cleanLog.match(/error TS\d+:\s*(.+)/i);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Generic extraction: get text after "error" keyword
    const errorMatch = cleanLog.match(/error[:\s]+(.+)/i);
    if (errorMatch && errorMatch[1]) {
      return errorMatch[1].trim();
    }

    // If no pattern matches, return the whole line (cleaned)
    return cleanLog.trim();
  }

  /**
   * Extracts the rule name from a log line (for ESLint errors)
   *
   * @param log - Log line to parse
   * @param errorType - Type of error
   * @returns Rule name if found
   */
  private extractRule(log: string, errorType: ErrorType): string | undefined {
    if (errorType === ErrorType.ESLINT) {
      // ESLint rule format: category/rule-name or just rule-name
      const match = log.match(/([a-z-]+\/[a-z-]+)\s*$/i) || log.match(/\s+([a-z-]+)\s*$/i);
      if (match && match[1]) {
        return match[1];
      }
    }

    if (errorType === ErrorType.TYPESCRIPT) {
      // TypeScript error code: TS1234
      const match = log.match(/TS(\d+)/);
      if (match && match[1]) {
        return `TS${match[1]}`;
      }
    }

    return undefined;
  }

  /**
   * Extracts context lines around an error
   *
   * @param lines - All log lines
   * @param index - Index of the error line
   * @param contextSize - Number of lines before and after to include
   * @returns Array of context lines
   */
  private extractContext(lines: string[], index: number, contextSize: number = 2): string[] {
    const start = Math.max(0, index - contextSize);
    const end = Math.min(lines.length, index + contextSize + 1);

    return lines.slice(start, end).filter((line) => line.trim().length > 0);
  }
}

/**
 * Create a singleton instance for convenience
 */
export const errorParser = new ErrorParser();
