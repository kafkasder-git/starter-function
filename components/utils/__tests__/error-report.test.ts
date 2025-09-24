import { describe, expect, it, vi } from 'vitest';
import { createErrorReport, getEnvironmentInfo } from '@/components/utils/error-report';

describe('getEnvironmentInfo', () => {
  it('returns environment information from the provided source', () => {
    const environment = getEnvironmentInfo({
      navigator: { userAgent: 'CustomAgent/1.0' },
      location: { href: 'https://example.com/path' },
      storage: {
        getItem: vi.fn().mockReturnValue('user-123'),
      },
    });

    expect(environment).toEqual({
      userAgent: 'CustomAgent/1.0',
      url: 'https://example.com/path',
      userId: 'user-123',
    });
  });

  it('falls back to safe defaults when environment data is missing or invalid', () => {
    const environment = getEnvironmentInfo({
      navigator: {},
      location: { href: '   ' },
      storage: {
        getItem: () => null,
      },
    });

    expect(environment).toEqual({
      userAgent: 'unknown',
      url: 'unknown',
      userId: 'anonymous',
    });
  });

  it('gracefully handles storage access errors', () => {
    const storage = {
      getItem: () => {
        throw new Error('access denied');
      },
    };
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const environment = getEnvironmentInfo({ storage });

    expect(environment.userId).toBe('anonymous');
    expect(warnSpy).toHaveBeenCalledWith(
      '[EnhancedErrorBoundary] Unable to access user_id from storage:',
      expect.any(Error),
    );

    warnSpy.mockRestore();
  });
});

describe('createErrorReport', () => {
  it('creates a report with the provided error and environment data', () => {
    const error = new Error('Boom!');
    const dateFactory = () => new Date('2024-01-02T03:04:05.000Z');

    const report = createErrorReport({
      errorId: 'ERR_TEST',
      error,
      errorInfo: { componentStack: 'in Component' },
      environmentSource: {
        navigator: { userAgent: 'QA/1.0' },
        location: { href: 'https://example.com/dashboard' },
        storage: {
          getItem: vi.fn().mockReturnValue('user-999'),
        },
        dateFactory,
      },
    });

    expect(report).toEqual({
      errorId: 'ERR_TEST',
      message: 'Boom!',
      stack: error.stack,
      componentStack: 'in Component',
      timestamp: '2024-01-02T03:04:05.000Z',
      environment: {
        userAgent: 'QA/1.0',
        url: 'https://example.com/dashboard',
        userId: 'user-999',
      },
    });
  });

  it('uses safe defaults when environment data is unavailable', () => {
    const report = createErrorReport({
      error: new Error('Test'),
      errorInfo: { componentStack: '' },
    });

    expect(report.environment.userAgent).toBeTruthy();
    expect(report.environment.url).toBeTruthy();
    expect(report.environment.userId).toBeTruthy();
    expect(typeof report.timestamp).toBe('string');
  });
});
