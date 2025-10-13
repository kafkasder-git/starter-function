/**
 * @fileoverview SQL Injection Prevention Module
 *
 * IMPORTANT: This module only provides detection and validation.
 * The primary defense against SQL injection is using parameterized queries/prepared statements.
 * Supabase automatically uses parameterized queries, which is the proper solution.
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 2.0.0
 */

import { ServiceError, ServiceErrorCode } from '../../services/config';

/**
 * SQL Injection Prevention
 * Detects potentially dangerous SQL patterns in user input
 *
 * WARNING: This class only provides detection. Always use parameterized queries!
 *
 * @class SQLInjectionPrevention
 */
export class SQLInjectionPrevention {
  private static readonly MAX_LENGTH = 10000;

  private static readonly DANGEROUS_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(\b(UNION|OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /(--|\/\*|\*\/|;)/g,
    /(\b(SCRIPT|JAVASCRIPT|VBSCRIPT)\b)/gi,
    /(\b(CHAR|NCHAR|VARCHAR|NVARCHAR)\s*\(\s*\d+\s*\))/gi,
  ];

  /**
   * Check if input contains SQL injection patterns
   *
   * @param input - String to check
   * @returns True if SQL injection pattern detected
   */
  static containsSQLInjection(input: string): boolean {
    return this.DANGEROUS_PATTERNS.some((pattern) => pattern.test(input));
  }

  /**
   * Sanitize SQL input (DEPRECATED)
   *
   * @deprecated Use parameterized queries instead. This function only provides basic normalization.
   * @param input - String to sanitize
   * @returns Normalized string
   */
  static sanitizeSQLInput(input: string): string {
    // Only perform harmless normalization - DB interactions must use parameterized queries
    // This function is deprecated in favor of parameterized queries/prepared statements

    // Trim whitespace
    let sanitized = input.trim();

    // Length limit to prevent buffer overflow attacks
    if (sanitized.length > this.MAX_LENGTH) {
      sanitized = sanitized.substring(0, this.MAX_LENGTH);
    }

    // Unicode normalization (harmless)
    sanitized = sanitized.normalize('NFC');

    // NOTE: All database interactions should use parameterized queries or prepared statements
    // to prevent SQL injection. This function only provides basic normalization.

    return sanitized;
  }

  /**
   * Validate input and throw error if dangerous patterns detected
   *
   * Use this for logging and monitoring, but always use parameterized queries for actual protection.
   *
   * @param input - Input to validate
   * @throws ServiceError if dangerous SQL patterns detected
   */
  static validateSQLInput(input: unknown): void {
    if (typeof input === 'string' && this.containsSQLInjection(input)) {
      throw new ServiceError(
        ServiceErrorCode.VALIDATION_ERROR,
        'Potentially dangerous SQL patterns detected in input',
        { input: input.substring(0, 100) }
      );
    }

    if (typeof input === 'object' && input !== null) {
      Object.values(input).forEach((value) => {
        if (typeof value === 'string') {
          this.validateSQLInput(value);
        }
      });
    }
  }
}

/**
 * SQL Injection Protection (for backward compatibility with InputSanitizer.ts)
 *
 * @class SQLInjectionProtection
 */
export class SQLInjectionProtection {
  /**
   * Validate input for SQL injection patterns
   *
   * @param input - String to validate
   * @returns True if input is safe
   */
  static validate(input: string): boolean {
    if (!input) return true;
    // More aggressive validation - reject any input with SQL keywords
    const hasSQLKeywords =
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i.test(
        input
      );
    const hasSQLOperators = /(\bOR\b|\bAND\b).*\d+\s*=\s*\d+/i.test(input);
    const hasSQLComments = /(--|\/\*|\*\/)/.test(input);
    const hasSQLQuotes = /['";\\]/.test(input);

    // Return false if any SQL-related suspicious pattern is present
    return !(hasSQLKeywords || hasSQLOperators || hasSQLComments || hasSQLQuotes);
  }

  /**
   * Sanitize input by removing SQL patterns (DEPRECATED)
   *
   * @deprecated Use parameterized queries instead
   * @param input - String to sanitize
   * @returns Sanitized string
   */
  static sanitize(input: string): string {
    if (typeof input !== 'string') return '';
    // More aggressive sanitization - remove all dangerous patterns
    return input
      .replace(
        /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/gi,
        ''
      )
      .replace(/['";\\]/g, '')
      .replace(/--/g, '')
      .replace(/\/\*|\*\//g, '')
      .replace(/OR\s+\d+\s*=\s*\d+/gi, '')
      .replace(/AND\s+\d+\s*=\s*\d+/gi, '')
      .replace(/=\s*\d+/g, '')
      .trim();
  }
}

export default SQLInjectionPrevention;
