# API Security and Monitoring System

This comprehensive API security and monitoring system provides enterprise-grade
protection and observability for the reporting system APIs.

## Security Architecture

This `lib/security/` module is the centralized security layer for the
application. It provides:

### Client-Side Security

- **Input Sanitization** (`sanitization.ts`) - XSS prevention, HTML sanitization
- **Validation** (`validation.ts`) - Form validation, data validation
- **CSRF Protection** (`csrf.ts`) - Token generation and validation
- **Rate Limiting** (`rateLimit.ts`) - Client-side rate limiting
- **XSS Protection** (`xss.ts`) - Cross-site scripting prevention
- **SQL Injection Prevention** (`sqlInjection.ts`) - Query sanitization
- **Security Headers** (`headers.ts`) - CSP, HSTS, etc.

### Server-Side Security (Provided by Infrastructure)

- **Supabase:** Row Level Security (RLS), JWT authentication, audit logging
- **Cloudflare:** DDoS protection, bot management, WAF, rate limiting

### Removed Features

The following features were removed from `advancedSecurityService.ts` as they
were:

- Over-engineered and unused
- Incorrectly implemented client-side (should be server-side)
- Already provided by Cloudflare/Supabase
- Privacy concerns (user behavior tracking)

## Usage

Import security functions from this module:

```typescript
import {
  sanitizeUserInput,
  validateField,
  generateCSRFToken,
} from '@/lib/security';
```

For security monitoring and audit logs, use Supabase's `audit_logs` table
directly.

## Features

### 🛡️ Security Hardening

- **Rate Limiting**: Configurable rate limits per endpoint, user, and globally
- **Input Validation**: SQL injection prevention and XSS protection
- **CSRF Protection**: Token-based CSRF protection for state-changing operations
- **API Versioning**: Version validation and deprecation management
- **Security Headers**: Automatic security headers injection

### 📊 Monitoring & Analytics

- **Real-time Metrics**: Live API performance and usage statistics
- **Health Checks**: Automated service health monitoring
- **Uptime Tracking**: Service availability and downtime tracking
- **Security Events**: Comprehensive security event logging and alerting
- **Audit Logging**: Detailed audit trails for compliance

### 🚨 Alerting System

- **Configurable Alerts**: Custom alert conditions and thresholds
- **Multiple Actions**: Email, webhook, and log-based alert actions
- **Cooldown Periods**: Prevent alert spam with configurable cooldowns

## Quick Start

### Basic Setup

```typescript
import { apiSecurityMiddleware, securityService } from '@/lib/security';

// Validate a request
const securityResult = await securityService.validateRequest(
  '/api/reports/create',
  'POST',
  requestData,
  {
    userId: 'user123',
    sessionId: 'session456',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
  },
);

if (securityResult.error) {
  throw new Error(securityResult.error);
}

// Use sanitized data
const sanitizedData = securityResult.data?.sanitizedData;
```

### Service Integration

```typescript
import { SecureBaseService } from '@/services/secureBaseService';

class MySecureService extends SecureBaseService<MyEntity, MyInsert, MyUpdate> {
  async create(data: MyInsert, securityContext?: ServiceSecurityContext) {
    return super.create(data, securityContext);
  }
}
```

### Monitoring Dashboard

```typescript
import { APIMonitoringDashboard, SecurityMonitoringPanel } from '@/components/reporting/monitoring';

function MonitoringPage() {
  return (
    <div>
      <APIMonitoringDashboard autoRefresh={true} refreshInterval={30000} />
      <SecurityMonitoringPanel autoRefresh={true} refreshInterval={30000} />
    </div>
  );
}
```

## Configuration

### Security Configuration

```typescript
import { securityConfigManager, SECURITY_PRESETS } from '@/lib/security';

// Load a preset
securityConfigManager.loadPreset('production');

// Custom configuration
securityConfigManager.updateConfig({
  rateLimiting: {
    global: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 1000,
    },
    perEndpoint: {
      '/api/auth/login': {
        windowMs: 15 * 60 * 1000,
        maxRequests: 5,
      },
    },
  },
});
```

### Available Presets

- **development**: Lenient settings for development
- **testing**: Very permissive for automated testing
- **production**: Balanced security for production
- **highSecurity**: Maximum security for sensitive environments

## API Reference

### Core Classes

#### `APISecurityMiddleware`

Main security middleware for request validation.

```typescript
class APISecurityMiddleware {
  async checkSecurity(
    context: SecurityContext,
    requestData?: any,
  ): Promise<SecurityResult>;
  generateCSRFToken(sessionId: string): string;
  getSecurityHeaders(): Record<string, string>;
}
```

#### `SecurityService`

High-level security service for application integration.

```typescript
class SecurityService {
  async validateRequest(
    endpoint: string,
    method: string,
    requestData?: any,
    options?: any,
  ): Promise<ApiResponse<any>>;
  async logSecurityEvent(
    type: SecurityEventType,
    severity: string,
    context: SecurityContext,
    details: any,
  ): Promise<ApiResponse<SecurityEvent>>;
  async getSecurityEvents(
    filters?: any,
  ): Promise<ApiResponse<{ events: SecurityEvent[]; total: number }>>;
  async getSecurityMetrics(): Promise<ApiResponse<SecurityMetrics>>;
}
```

#### `APIMonitoringService`

Comprehensive API monitoring and analytics.

```typescript
class APIMonitoringService {
  async logEvent(
    eventData: Omit<APIMonitoringEvent, 'id' | 'timestamp'>,
  ): Promise<ApiResponse<APIMonitoringEvent>>;
  async getUsageAnalytics(
    timeRange: { start: number; end: number },
    filters?: any,
  ): Promise<ApiResponse<APIUsageAnalytics>>;
  async getPerformanceMetrics(
    endpoint?: string,
    method?: string,
  ): Promise<ApiResponse<PerformanceMetrics[]>>;
  async performHealthCheck(
    serviceName: string,
  ): Promise<ApiResponse<HealthCheckResult>>;
}
```

### Utility Classes

#### `RateLimiter`

Configurable rate limiting implementation.

```typescript
class RateLimiter {
  isAllowed(key: string): boolean;
  getRemainingRequests(key: string): number;
  getResetTime(key: string): number;
}
```

#### `InputSanitizer`

Input sanitization and validation utilities.

```typescript
class InputSanitizer {
  static escapeHtml(text: string): string;
  static sanitizeString(input: string): string;
  static sanitizeObject(obj: any): any;
}
```

#### `SQLInjectionPrevention`

SQL injection detection and prevention.

```typescript
class SQLInjectionPrevention {
  static containsSQLInjection(input: string): boolean;
  static sanitizeSQLInput(input: string): string;
  static validateSQLInput(input: any): void;
}
```

## Security Events

The system tracks various security events:

- `RATE_LIMIT_EXCEEDED`: Rate limit violations
- `INVALID_API_VERSION`: Unsupported API version requests
- `SQL_INJECTION_ATTEMPT`: Potential SQL injection attempts
- `XSS_ATTEMPT`: Cross-site scripting attempts
- `CSRF_TOKEN_INVALID`: Invalid CSRF tokens
- `SUSPICIOUS_INPUT`: Other suspicious input patterns
- `AUTHENTICATION_FAILURE`: Authentication failures
- `AUTHORIZATION_FAILURE`: Authorization failures

## Monitoring Metrics

### API Usage Analytics

- Total requests and success/failure rates
- Response time percentiles (P50, P95, P99)
- Requests per second and error rates
- Top endpoints and users
- Status code distribution
- Hourly and daily request patterns

### Performance Metrics

- Per-endpoint performance statistics
- Response time trends
- Throughput measurements
- Error rate tracking

### Security Metrics

- Blocked requests and rate limit violations
- Security event counts by type and severity
- Top blocked IP addresses and endpoints
- Attack pattern analysis

## Best Practices

### 1. Rate Limiting Strategy

```typescript
// Different limits for different endpoint types
const rateLimitConfig = {
  '/api/auth/*': { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  '/api/reports/export': { windowMs: 5 * 60 * 1000, maxRequests: 10 },
  '/api/data/*': { windowMs: 60 * 1000, maxRequests: 100 },
};
```

### 2. Security Context

Always provide comprehensive security context:

```typescript
const securityContext = {
  userId: currentUser.id,
  sessionId: request.sessionId,
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
  version: request.headers['api-version'] || 'v1',
};
```

### 3. Error Handling

```typescript
try {
  const result = await securityService.validateRequest(
    endpoint,
    method,
    data,
    context,
  );
  if (result.error) {
    // Log security violation
    logger.warn('Security validation failed', {
      endpoint,
      error: result.error,
    });
    throw new SecurityError(result.error);
  }
} catch (error) {
  // Handle security errors appropriately
  if (error instanceof SecurityError) {
    return res.status(403).json({ error: 'Access denied' });
  }
  throw error;
}
```

### 4. Monitoring Integration

```typescript
// Log API events for monitoring
await apiMonitoringService.logEvent({
  type: APIEventType.REQUEST_END,
  endpoint: req.path,
  method: req.method,
  userId: req.user?.id,
  ipAddress: req.ip,
  responseTime: Date.now() - startTime,
  statusCode: res.statusCode,
  metadata: { userAgent: req.headers['user-agent'] },
});
```

## Troubleshooting

### Common Issues

1. **Rate Limit False Positives**
   - Check if rate limits are too restrictive
   - Verify key generation logic
   - Consider user-specific vs IP-based limiting

2. **CSRF Token Issues**
   - Ensure tokens are properly generated and stored
   - Check token expiration settings
   - Verify token transmission in requests

3. **Performance Impact**
   - Monitor security middleware overhead
   - Optimize rate limiter cleanup intervals
   - Consider caching for frequent validations

### Debug Mode

Enable debug logging for detailed security information:

```typescript
// Set environment variable
process.env.SECURITY_DEBUG = 'true';

// Or configure programmatically
securityConfigManager.updateConfig({
  debug: true,
  logLevel: 'debug',
});
```

## Contributing

When contributing to the security system:

1. Follow security best practices
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Consider backward compatibility
5. Test with different security presets

## License

This security system is part of the larger reporting system and follows the same
license terms.
