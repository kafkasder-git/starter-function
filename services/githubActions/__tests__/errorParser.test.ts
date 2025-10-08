/**
 * ErrorParser Unit Tests
 *
 * Comprehensive tests for the ErrorParser service that parses GitHub Actions workflow logs.
 * Tests cover all error types (Requirements 1.2, 2.1, 2.2, 2.3, 2.4, 2.5) and edge cases.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ErrorParser } from '../errorParser';
import { ErrorType } from '../../../types/githubActions';

describe('ErrorParser', () => {
  let parser: ErrorParser;

  beforeEach(() => {
    parser = new ErrorParser();
  });

  // Basic Functionality Tests
  describe('parse - Basic Functionality', () => {
    it('should return empty array for empty logs', () => {
      const errors = parser.parse('');
      expect(errors).toEqual([]);
    });

    it('should return empty array for logs with no errors', () => {
      const logs = 'Running build...\nBuild completed successfully\nAll tests passed';
      const errors = parser.parse(logs);
      expect(errors).toEqual([]);
    });

    it('should parse multiple errors from logs', () => {
      const logs = `src/app.ts:10:5  error  'foo' is defined but never used  no-unused-vars
src/utils.ts:20:10  error  Missing semicolon  semi`;
      const errors = parser.parse(logs);
      expect(errors.length).toBe(2);
    });

    it('should preserve rawLog for each error', () => {
      const log = "src/app.ts:10:5  error  'foo' is defined but never used  no-unused-vars";
      const errors = parser.parse(log);
      expect(errors[0]?.rawLog).toBe(log);
    });
  });

  // ESLint Error Parsing Tests (Requirement 2.1)
  describe('ESLint Error Parsing', () => {
    it('should detect and parse ESLint errors with rule names', () => {
      const log = "src/file.ts:10:5  error  'foo' is defined but never used  no-unused-vars";
      const errors = parser.parse(log);

      expect(errors).toHaveLength(1);
      expect(errors[0]?.type).toBe(ErrorType.ESLINT);
      expect(errors[0]?.file).toBe('src/file.ts');
      expect(errors[0]?.line).toBe(10);
      expect(errors[0]?.column).toBe(5);
      expect(errors[0]?.severity).toBe('error');
      expect(errors[0]?.rule).toBe('no-unused-vars');
    });

    it('should parse ESLint errors with scoped rules', () => {
      const log =
        'src/app.tsx:15:3  error  Missing return type  @typescript-eslint/explicit-function-return-type';
      const errors = parser.parse(log);

      expect(errors[0]?.type).toBe(ErrorType.ESLINT);
      expect(errors[0]?.rule).toBe('@typescript-eslint/explicit-function-return-type');
    });

    it('should parse ESLint warnings', () => {
      const log = 'src/utils.js:8:1  warning  Unexpected console statement  no-console';
      const errors = parser.parse(log);

      expect(errors[0]?.type).toBe(ErrorType.ESLINT);
      expect(errors[0]?.severity).toBe('warning');
      expect(errors[0]?.rule).toBe('no-console');
    });

    it('should parse ESLint errors with Unicode symbols', () => {
      const log = "src/app.ts:10:5  ✖  'foo' is defined but never used  no-unused-vars";
      const errors = parser.parse(log);

      expect(errors[0]?.type).toBe(ErrorType.ESLINT);
      expect(errors[0]?.severity).toBe('error');
    });
  });

  // TypeScript Error Parsing Tests (Requirement 2.2)
  describe('TypeScript Error Parsing', () => {
    it('should detect and parse TypeScript errors', () => {
      const log = "src/file.ts:15:10 - error TS2304: Cannot find name 'Foo'.";
      const errors = parser.parse(log);

      expect(errors).toHaveLength(1);
      expect(errors[0]?.type).toBe(ErrorType.TYPESCRIPT);
      expect(errors[0]?.file).toBe('src/file.ts');
      expect(errors[0]?.line).toBe(15);
      expect(errors[0]?.column).toBe(10);
      expect(errors[0]?.severity).toBe('error');
      expect(errors[0]?.rule).toBe('TS2304');
    });

    it('should parse TypeScript type mismatch errors', () => {
      const log =
        "src/utils.ts:30:5 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.";
      const errors = parser.parse(log);

      expect(errors[0]?.type).toBe(ErrorType.TYPESCRIPT);
      expect(errors[0]?.rule).toBe('TS2345');
    });

    it('should parse TypeScript errors with parentheses format', () => {
      const log =
        "src/components/App.tsx(42,15): error TS2339: Property 'foo' does not exist on type 'Props'.";
      const errors = parser.parse(log);

      expect(errors[0]?.type).toBe(ErrorType.TYPESCRIPT);
      expect(errors[0]?.file).toBe('src/components/App.tsx');
      expect(errors[0]?.line).toBe(42);
      expect(errors[0]?.column).toBe(15);
      expect(errors[0]?.rule).toBe('TS2339');
    });
  });

  // Build Error Parsing Tests (Requirement 2.3)
  describe('Build Error Parsing', () => {
    it('should detect and parse build errors', () => {
      const log = 'Error: Build failed with 1 error';
      const errors = parser.parse(log);

      expect(errors[0]?.type).toBe(ErrorType.BUILD);
      expect(errors[0]?.severity).toBe('error');
    });

    it('should parse Vite build errors', () => {
      const log = 'vite build error: Failed to resolve import';
      const errors = parser.parse(log);

      expect(errors[0]?.type).toBe(ErrorType.BUILD);
    });

    it('should parse module not found errors', () => {
      const log = "Error: Module not found: Can't resolve './missing-file'";
      const errors = parser.parse(log);

      expect(errors[0]?.type).toBe(ErrorType.BUILD);
    });
  });

  // Cloudflare Deploy Error Parsing Tests (Requirement 2.4)
  describe('Cloudflare Deploy Error Parsing', () => {
    it('should detect and parse Cloudflare API token errors', () => {
      const log = 'Error: Cloudflare API token is invalid or expired';
      const errors = parser.parse(log);

      expect(errors[0]?.type).toBe(ErrorType.DEPLOY);
    });

    it('should parse Cloudflare Pages deploy errors', () => {
      const log = 'Error: Cloudflare Pages deployment failed: Project not found';
      const errors = parser.parse(log);

      expect(errors[0]?.type).toBe(ErrorType.DEPLOY);
    });

    it('should parse Wrangler errors', () => {
      const log = 'wrangler error: Failed to publish to Cloudflare';
      const errors = parser.parse(log);

      expect(errors[0]?.type).toBe(ErrorType.DEPLOY);
    });
  });

  // Security Error Parsing Tests (Requirement 2.5)
  describe('Security Error Parsing', () => {
    it('should detect and parse vulnerability errors', () => {
      const log = 'High severity vulnerability found in package lodash';
      const errors = parser.parse(log);

      expect(errors[0]?.type).toBe(ErrorType.SECURITY);
    });

    it('should parse CVE errors', () => {
      const log = 'Security issue: CVE-2023-12345 detected in dependency';
      const errors = parser.parse(log);

      expect(errors[0]?.type).toBe(ErrorType.SECURITY);
    });

    it('should parse npm audit errors', () => {
      const log = 'npm audit found 5 vulnerabilities (3 high, 2 critical)';
      const errors = parser.parse(log);

      expect(errors[0]?.type).toBe(ErrorType.SECURITY);
    });
  });

  // Additional Error Type Tests
  describe('Other Error Type Parsing', () => {
    it('should detect and parse test failures', () => {
      const log = 'Test failed: expected true to be false';
      const errors = parser.parse(log);

      expect(errors[0]?.type).toBe(ErrorType.TEST);
    });

    it('should detect and parse npm errors', () => {
      const log = "npm ERR! Cannot find module 'react'";
      const errors = parser.parse(log);

      expect(errors[0]?.type).toBe(ErrorType.DEPENDENCY);
    });

    it('should detect and parse configuration errors', () => {
      const log = 'Error: Missing environment variable DATABASE_URL';
      const errors = parser.parse(log);

      expect(errors[0]?.type).toBe(ErrorType.CONFIGURATION);
    });
  });

  // File Location Extraction Tests
  describe('File Location Extraction', () => {
    it('should extract file location with colon format', () => {
      const log = 'src/app.ts:42:10 - error: Something went wrong';
      const errors = parser.parse(log);

      expect(errors[0]?.file).toBe('src/app.ts');
      expect(errors[0]?.line).toBe(42);
      expect(errors[0]?.column).toBe(10);
    });

    it('should extract file location with parentheses format', () => {
      const log = 'src/utils.ts(25,5): error: Invalid syntax';
      const errors = parser.parse(log);

      expect(errors[0]?.file).toBe('src/utils.ts');
      expect(errors[0]?.line).toBe(25);
      expect(errors[0]?.column).toBe(5);
    });

    it('should handle different file extensions', () => {
      const extensions = ['ts', 'tsx', 'js', 'jsx'];

      extensions.forEach((ext) => {
        const log = `src/file.${ext}:10:5 error: Test error`;
        const errors = parser.parse(log);
        expect(errors[0]?.file).toBe(`src/file.${ext}`);
      });
    });
  });

  // Severity Extraction Tests
  describe('Severity Extraction', () => {
    it('should extract error severity', () => {
      const log = 'src/app.ts:10:5  error  Something went wrong';
      const errors = parser.parse(log);
      expect(errors[0]?.severity).toBe('error');
    });

    it('should extract warning severity', () => {
      const log = 'src/app.ts:10:5  warning  This might be an issue';
      const errors = parser.parse(log);
      expect(errors[0]?.severity).toBe('warning');
    });

    it('should handle Unicode error symbols', () => {
      const log = 'src/app.ts:10:5  ✖  Something went wrong';
      const errors = parser.parse(log);
      expect(errors[0]?.severity).toBe('error');
    });
  });

  // Message Extraction Tests
  describe('Message Extraction', () => {
    it('should extract ESLint error messages', () => {
      const log = "src/app.ts:10:5  error  'foo' is defined but never used  no-unused-vars";
      const errors = parser.parse(log);
      expect(errors[0]?.message).toContain('foo');
    });

    it('should extract TypeScript error messages', () => {
      const log = "src/file.ts:15:10 - error TS2304: Cannot find name 'Foo'.";
      const errors = parser.parse(log);
      expect(errors[0]?.message).toContain('Cannot find name');
    });

    it('should remove ANSI color codes from messages', () => {
      const log = '\x1b[31msrc/app.ts:10:5  error  Something went wrong\x1b[0m';
      const errors = parser.parse(log);
      expect(errors[0]?.message).not.toContain('\x1b');
    });
  });

  // Rule Extraction Tests
  describe('Rule Extraction', () => {
    it('should extract ESLint rule names', () => {
      const log = "src/app.ts:10:5  error  'foo' is defined but never used  no-unused-vars";
      const errors = parser.parse(log);
      expect(errors[0]?.rule).toBe('no-unused-vars');
    });

    it('should extract TypeScript error codes', () => {
      const log = "src/file.ts:15:10 - error TS2304: Cannot find name 'Foo'.";
      const errors = parser.parse(log);
      expect(errors[0]?.rule).toBe('TS2304');
    });

    it('should return undefined for errors without rules', () => {
      const log = 'Error: Build failed';
      const errors = parser.parse(log);
      expect(errors[0]?.rule).toBeUndefined();
    });
  });

  // Context Extraction Tests
  describe('Context Extraction', () => {
    it('should include context lines in parsed errors', () => {
      const logs = `Line before error
src/app.ts:10:5  error  Something went wrong
Line after error`;
      const errors = parser.parse(logs);
      expect(errors[0]?.context).toBeDefined();
      expect(errors[0]?.context?.length).toBeGreaterThan(0);
    });
  });

  // Edge Cases Tests
  describe('Edge Cases', () => {
    it('should handle logs with only whitespace', () => {
      const errors = parser.parse('   \n   \n   ');
      expect(errors).toEqual([]);
    });

    it('should handle logs with special characters', () => {
      const log = 'src/app.ts:10:5  error  Invalid character: @#$%^&*()';
      const errors = parser.parse(log);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should handle very long log lines', () => {
      const longMessage = 'a'.repeat(1000);
      const log = `src/app.ts:10:5  error  ${longMessage}`;
      const errors = parser.parse(log);
      expect(errors[0]?.message).toBeDefined();
    });

    it('should handle logs with mixed error types', () => {
      const logs = `src/app.ts:10:5  error  'foo' is defined but never used  no-unused-vars
src/file.ts:15:10 - error TS2304: Cannot find name 'Foo'.
Error: Build failed
High severity vulnerability found`;
      const errors = parser.parse(logs);
      expect(errors.length).toBe(4);
      expect(errors[0]?.type).toBe(ErrorType.ESLINT);
      expect(errors[1]?.type).toBe(ErrorType.TYPESCRIPT);
      expect(errors[2]?.type).toBe(ErrorType.BUILD);
      expect(errors[3]?.type).toBe(ErrorType.SECURITY);
    });

    it('should handle logs with duplicate errors', () => {
      const logs = `src/app.ts:10:5  error  'foo' is defined but never used  no-unused-vars
src/app.ts:10:5  error  'foo' is defined but never used  no-unused-vars`;
      const errors = parser.parse(logs);
      expect(errors.length).toBe(2);
    });

    it('should handle logs with no file information', () => {
      const log = 'error: Something went wrong';
      const errors = parser.parse(log);
      expect(errors[0]?.file).toBeUndefined();
    });

    it('should handle logs with Unicode characters', () => {
      const log = 'src/app.ts:10:5  error  Invalid character: 你好世界';
      const errors = parser.parse(log);
      expect(errors[0]?.message).toContain('你好世界');
    });
  });

  // Real-World Log Examples Tests
  describe('Real-World Log Examples', () => {
    it('should parse real ESLint output', () => {
      const logs = `/home/runner/work/project/src/components/Button.tsx
  15:3   error  'React' must be in scope when using JSX  react/react-in-jsx-scope
  42:10  error  'handleClick' is missing in props validation  react/prop-types

✖ 2 problems (2 errors, 0 warnings)`;
      const errors = parser.parse(logs);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.type === ErrorType.ESLINT)).toBe(true);
    });

    it('should parse real TypeScript output', () => {
      const logs = `src/services/api.ts:42:15 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.

Found 1 error.`;
      const errors = parser.parse(logs);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.type === ErrorType.TYPESCRIPT)).toBe(true);
    });

    it('should parse real Cloudflare deploy output', () => {
      const logs =
        '✘ [ERROR] Failed to publish your Function. Got error: Cloudflare API token is invalid or has expired.';
      const errors = parser.parse(logs);
      expect(errors.some((e) => e.type === ErrorType.DEPLOY)).toBe(true);
    });
  });
});
