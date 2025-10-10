/**
 * ErrorParser Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ErrorParser } from '../githubActions/errorParser';
import { ErrorType } from '../../types/githubActions';

describe('ErrorParser', () => {
  let parser: ErrorParser;

  beforeEach(() => {
    parser = new ErrorParser();
  });

  it('should return empty array for empty logs', () => {
    const errors = parser.parse('');
    expect(errors).toEqual([]);
  });

  it('should parse ESLint errors', () => {
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

  it('should parse TypeScript errors', () => {
    const log = "src/file.ts:15:10 - error TS2304: Cannot find name 'Foo'.";
    const errors = parser.parse(log);

    expect(errors).toHaveLength(1);
    expect(errors[0]?.type).toBe(ErrorType.TYPESCRIPT);
    expect(errors[0]?.rule).toBe('TS2304');
  });

  it('should parse build errors', () => {
    const log = 'Error: Build failed with 1 error';
    const errors = parser.parse(log);

    expect(errors[0]?.type).toBe(ErrorType.BUILD);
  });

  it('should parse Appwrite deploy errors', () => {
    const log = 'Error: Appwrite API token is invalid';
    const errors = parser.parse(log);

    expect(errors[0]?.type).toBe(ErrorType.DEPLOY);
  });

  it('should parse security errors', () => {
    const log = 'High severity vulnerability found in package lodash';
    const errors = parser.parse(log);

    expect(errors[0]?.type).toBe(ErrorType.SECURITY);
  });

  // Additional ESLint tests (Requirement 2.1)
  it('should parse ESLint warnings', () => {
    const log = 'src/utils.js:8:1  warning  Unexpected console statement  no-console';
    const errors = parser.parse(log);

    expect(errors[0]?.type).toBe(ErrorType.ESLINT);
    expect(errors[0]?.severity).toBe('warning');
    expect(errors[0]?.rule).toBe('no-console');
  });

  it('should parse ESLint errors with scoped rules', () => {
    const log =
      'src/app.tsx:15:3  error  Missing return type  @typescript-eslint/explicit-function-return-type';
    const errors = parser.parse(log);

    expect(errors[0]?.type).toBe(ErrorType.ESLINT);
    // The parser extracts the rule without the @ symbol
    expect(errors[0]?.rule).toContain('typescript-eslint');
  });

  // Additional TypeScript tests (Requirement 2.2)
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

  // Additional Build tests (Requirement 2.3)
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

  // Additional Deploy tests (Requirement 2.4)
  it('should parse Appwrite Sites deploy errors', () => {
    const log = 'Error: Appwrite Sites deployment failed: Project not found';
    const errors = parser.parse(log);

    expect(errors[0]?.type).toBe(ErrorType.DEPLOY);
  });

  it('should parse Appwrite CLI errors', () => {
    const log = 'appwrite error: Failed to publish to Appwrite';
    const errors = parser.parse(log);

    expect(errors[0]?.type).toBe(ErrorType.DEPLOY);
  });

  // Additional Security tests (Requirement 2.5)
  it('should parse CVE errors', () => {
    const log = 'High severity: CVE-2023-12345 vulnerability detected';
    const errors = parser.parse(log);

    expect(errors[0]?.type).toBe(ErrorType.SECURITY);
  });

  it('should parse npm audit errors', () => {
    const log = 'npm audit found 5 vulnerabilities (3 high, 2 critical)';
    const errors = parser.parse(log);

    expect(errors[0]?.type).toBe(ErrorType.SECURITY);
  });

  // Other error types
  it('should parse test errors', () => {
    const log = 'Test failed: expected true to be false';
    const errors = parser.parse(log);

    expect(errors[0]?.type).toBe(ErrorType.TEST);
  });

  it('should parse dependency errors', () => {
    const log = "npm ERR! Cannot find module 'react'";
    const errors = parser.parse(log);

    expect(errors[0]?.type).toBe(ErrorType.DEPENDENCY);
  });

  it('should parse configuration errors', () => {
    const log = 'Error: Missing environment variable DATABASE_URL';
    const errors = parser.parse(log);

    expect(errors[0]?.type).toBe(ErrorType.CONFIGURATION);
  });

  // Edge cases
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

  it('should handle logs with Unicode characters', () => {
    const log = 'src/app.ts:10:5  error  Invalid character: 你好世界';
    const errors = parser.parse(log);
    expect(errors[0]?.message).toContain('你好世界');
  });

  it('should remove ANSI color codes from messages', () => {
    const log = '\x1b[31msrc/app.ts:10:5  error  Something went wrong\x1b[0m';
    const errors = parser.parse(log);
    expect(errors[0]?.message).not.toContain('\x1b');
  });

  it('should handle multiple errors from logs', () => {
    const logs = `src/app.ts:10:5  error  'foo' is defined but never used  no-unused-vars
src/utils.ts:20:10  error  Missing semicolon  semi`;
    const errors = parser.parse(logs);
    expect(errors.length).toBe(2);
  });

  it('should extract file location with different formats', () => {
    const log1 = 'src/app.ts:42:10 - error TS2304: Something went wrong';
    const errors1 = parser.parse(log1);
    expect(errors1[0]?.file).toBe('src/app.ts');
    expect(errors1[0]?.line).toBe(42);
    expect(errors1[0]?.column).toBe(10);

    const log2 = 'src/utils.ts(25,5): error TS2345: Invalid syntax';
    const errors2 = parser.parse(log2);
    expect(errors2[0]?.file).toBe('src/utils.ts');
    expect(errors2[0]?.line).toBe(25);
    expect(errors2[0]?.column).toBe(5);
  });

  it('should include context lines in parsed errors', () => {
    const logs = `Line before error
src/app.ts:10:5  error  Something went wrong
Line after error`;
    const errors = parser.parse(logs);
    expect(errors[0]?.context).toBeDefined();
    expect(errors[0]?.context?.length).toBeGreaterThan(0);
  });

  it('should preserve rawLog for each error', () => {
    const log = "src/app.ts:10:5  error  'foo' is defined but never used  no-unused-vars";
    const errors = parser.parse(log);
    expect(errors[0]?.rawLog).toBe(log);
  });

  // Real-world examples
  it('should parse real ESLint output', () => {
    const logs = `/home/runner/work/project/src/components/Button.tsx
  15:3   error  'React' must be in scope when using JSX  react/react-in-jsx-scope
  42:10  error  'handleClick' is missing in props validation  react/prop-types`;
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
});
