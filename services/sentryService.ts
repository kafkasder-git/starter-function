// Minimal Sentry service stub to satisfy imports

type BreadcrumbLevel = 'info' | 'warning' | 'error';

class SentryService {
  isEnabled(): boolean {
    return true;
  }

  setContext(_key: string, _context: Record<string, unknown>): void {}

  addBreadcrumb(_message: string, _category?: string, _level?: BreadcrumbLevel, _data?: Record<string, unknown>): void {}

  captureMessage(_message: string, _level: BreadcrumbLevel = 'info', _data?: Record<string, unknown>): string {
    return Math.random().toString(36).slice(2);
  }

  captureException(_error: Error, _data?: Record<string, unknown>): string {
    return Math.random().toString(36).slice(2);
  }

  trackBusinessEvent(_event: string, _data?: Record<string, unknown>): void {}

  trackServiceHealth(_name: string, _status: 'healthy' | 'unhealthy', _ms: number, _message?: string): void {}
}

const sentryService = new SentryService();
export default sentryService;
export { sentryService };

