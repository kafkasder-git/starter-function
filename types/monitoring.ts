// Monitoring Types - Integration with existing monitoring system

export interface MonitoringEvent {
  type: string;
  timestamp: Date;
  data: any;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorLog {
  message: string;
  stack?: string;
  timestamp: Date;
  level?: 'error' | 'warning' | 'info';
}

// System Types (placeholder definitions)
export type SystemErrorType = 'connection' | 'timeout' | 'validation' | 'server' | 'unknown';

export interface SystemError {
  type: SystemErrorType;
  message: string;
  timestamp: Date;
  details?: unknown;
}

export interface SystemMetrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  uptime: number;
}

export interface SystemHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  checks: Record<string, boolean>;
}

// Base monitoring types (compatible with existing production-monitoring.js)
export interface BaseMonitoringConfig {
  url: string;
  interval: number;
  timeout: number;
  retries: number;
  alertWebhook?: string;
  slackWebhook?: string;
  emailEndpoint?: string;
}

export interface BaseMetrics {
  uptime: number;
  downtime: number;
  totalChecks: number;
  failedChecks: number;
  averageResponseTime: number;
  lastCheck: Date | null;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
}

export interface BaseAlerts {
  downtime: boolean;
  slowResponse: boolean;
  highErrorRate: boolean;
  sslExpiry: boolean;
}

// System-specific monitoring types
export interface SystemMonitoringConfig extends BaseMonitoringConfig {
  systemEndpoints: string[];
  systemMetricsInterval: number;
  systemAlertThresholds: {
    errorRate: number;
    responseTime: number;
    authFailures: number;
    rateLimitHits: number;
    cacheHitRate: number;
  };
}

export interface SystemMonitoringMetrics extends BaseMetrics {
  system: SystemMetrics;
}

export interface SystemMonitoringAlerts extends BaseAlerts {
  // System-specific alerts
  highErrorRate: boolean;
  slowResponse: boolean;
  authenticationFailures: boolean;
  rateLimitExceeded: boolean;
  lowCacheHitRate: boolean;
  componentDown: boolean;
  circuitBreakerOpen: boolean;
}

export interface SystemAlert {
  id: string;
  type: SystemAlertType;
  severity: AlertSeverity;
  message: string;
  data: Record<string, any>;
  timestamp: string;
  component: 'System' | 'Security' | 'Pagination' | 'ErrorHandler' | 'Cache';
  resolved?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export enum SystemAlertType {
  HIGH_ERROR_RATE = 'system_high_error_rate',
  SLOW_RESPONSE = 'system_slow_response',
  AUTH_FAILURES = 'system_auth_failures',
  RATE_LIMIT_EXCEEDED = 'system_rate_limit_exceeded',
  LOW_CACHE_HIT_RATE = 'system_low_cache_hit_rate',
  COMPONENT_DOWN = 'system_component_down',
  CIRCUIT_BREAKER_OPEN = 'system_circuit_breaker_open',
  SECURITY_BREACH = 'system_security_breach',
  PERFORMANCE_DEGRADATION = 'system_performance_degradation',
  RESOURCE_EXHAUSTION = 'system_resource_exhaustion',
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface SystemMonitoringHistory {
  metrics: SystemMetricsSnapshot[];
  alerts: SystemAlert[];
  healthChecks: SystemHealthCheckSnapshot[];
}

export interface SystemMetricsSnapshot {
  timestamp: Date;
  metrics: SystemMetrics;
}

export interface SystemHealthCheckSnapshot {
  timestamp: Date;
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: Record<string, 'up' | 'down' | 'degraded'>;
  responseTime?: number;
  details?: Record<string, any>;
}

// Real-time monitoring dashboard types
export interface SystemDashboardData {
  overview: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    totalRequests: number;
    errorRate: number;
    averageResponseTime: number;
  };
  security: {
    authenticationFailures: number;
    rateLimitHits: number;
    activeApiKeys: number;
    suspiciousActivities: number;
    recentSecurityEvents: SystemSecurityEvent[];
  };
  performance: {
    throughput: number;
    responseTimeP95: number;
    responseTimeP99: number;
    concurrentRequests: number;
    cacheHitRate: number;
  };
  errors: {
    totalErrors: number;
    errorsByType: Record<SystemErrorType, number>;
    recentErrors: SystemError[];
    circuitBreakerStatus: Record<string, 'closed' | 'open' | 'half-open'>;
  };
  alerts: {
    activeAlerts: SystemAlert[];
    recentAlerts: SystemAlert[];
    alertsByType: Record<SystemAlertType, number>;
    alertsByComponent: Record<string, number>;
  };
}

export interface SystemSecurityEvent {
  id: string;
  type: 'authentication' | 'authorization' | 'rate_limit' | 'suspicious_activity';
  severity: AlertSeverity;
  message: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  apiKey?: string;
  resource?: string;
  action?: string;
  resolved: boolean;
}

// Monitoring configuration presets
export const SYSTEM_MONITORING_PRESETS = {
  development: {
    interval: 30000, // 30 seconds
    systemMetricsInterval: 15000, // 15 seconds
    systemAlertThresholds: {
      errorRate: 0.1, // 10%
      responseTime: 5000, // 5 seconds
      authFailures: 20,
      rateLimitHits: 100,
      cacheHitRate: 0.5, // 50%
    },
  },
  staging: {
    interval: 60000, // 1 minute
    systemMetricsInterval: 30000, // 30 seconds
    systemAlertThresholds: {
      errorRate: 0.05, // 5%
      responseTime: 3000, // 3 seconds
      authFailures: 15,
      rateLimitHits: 75,
      cacheHitRate: 0.7, // 70%
    },
  },
  production: {
    interval: 60000, // 1 minute
    systemMetricsInterval: 30000, // 30 seconds
    systemAlertThresholds: {
      errorRate: 0.02, // 2%
      responseTime: 2000, // 2 seconds
      authFailures: 10,
      rateLimitHits: 50,
      cacheHitRate: 0.8, // 80%
    },
  },
} as const;

// Monitoring utilities
export interface SystemMonitoringUtils {
  calculateUptime: (startTime: Date, downtime: number) => number;
  calculateErrorRate: (totalErrors: number, totalRequests: number) => number;
  calculateCacheHitRate: (hits: number, misses: number) => number;
  formatDuration: (milliseconds: number) => string;
  formatBytes: (bytes: number) => string;
  generateAlertId: () => string;
  isAlertActive: (alert: SystemAlert) => boolean;
  shouldSendAlert: (alertType: SystemAlertType, lastSent?: Date) => boolean;
}

// Webhook and notification types
export interface SystemWebhookPayload {
  event: 'alert' | 'health_check' | 'metrics_update';
  timestamp: string;
  data: SystemAlert | SystemHealthCheck | SystemMetrics;
  metadata: {
    environment: string;
    version: string;
    instance: string;
  };
}

export interface SystemSlackAlert {
  channel: string;
  username: string;
  icon_emoji: string;
  attachments: {
    color: 'good' | 'warning' | 'danger';
    title: string;
    text: string;
    fields: {
      title: string;
      value: string;
      short: boolean;
    }[];
    timestamp: number;
  }[];
}

export interface SystemEmailAlert {
  to: string[];
  cc?: string[];
  subject: string;
  html: string;
  priority: 'low' | 'normal' | 'high';
  attachments?: {
    filename: string;
    content: string;
    contentType: string;
  }[];
}

// Monitoring report types
export interface SystemMonitoringReport {
  period: {
    start: Date;
    end: Date;
    duration: number;
  };
  summary: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    uptime: number;
    availability: number;
  };
  security: {
    authenticationAttempts: number;
    authenticationFailures: number;
    rateLimitHits: number;
    suspiciousActivities: number;
    securityIncidents: number;
  };
  performance: {
    throughput: number;
    responseTimePercentiles: {
      p50: number;
      p95: number;
      p99: number;
    };
    cachePerformance: {
      hitRate: number;
      missRate: number;
      evictions: number;
    };
  };
  errors: {
    totalErrors: number;
    errorsByType: Record<SystemErrorType, number>;
    topErrors: {
      type: SystemErrorType;
      count: number;
      percentage: number;
    }[];
    circuitBreakerTrips: number;
  };
  alerts: {
    totalAlerts: number;
    alertsByType: Record<SystemAlertType, number>;
    alertsBySeverity: Record<AlertSeverity, number>;
    meanTimeToResolution: number;
  };
  recommendations: string[];
}

// Export default monitoring configuration
export const DEFAULT_SYSTEM_MONITORING_CONFIG: SystemMonitoringConfig = {
  url: '',
  interval: 60000,
  timeout: 10000,
  retries: 3,
  systemEndpoints: [
    '/api/system/health',
    '/api/system/security/status',
    '/api/system/pagination/stats',
    '/api/system/errors/summary',
  ],
  systemMetricsInterval: 30000,
  systemAlertThresholds: {
    errorRate: 0.05,
    responseTime: 2000,
    authFailures: 10,
    rateLimitHits: 50,
    cacheHitRate: 0.8,
  },
};
