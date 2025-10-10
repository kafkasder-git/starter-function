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

// MCP Types (placeholder definitions)
export type MCPErrorType = 'connection' | 'timeout' | 'validation' | 'server' | 'unknown';

export interface MCPError {
  type: MCPErrorType;
  message: string;
  timestamp: Date;
  details?: unknown;
}

export interface MCPMetrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  uptime: number;
}

export interface MCPHealthCheck {
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

// MCP-specific monitoring types
export interface MCPMonitoringConfig extends BaseMonitoringConfig {
  mcpEndpoints: string[];
  mcpMetricsInterval: number;
  mcpAlertThresholds: {
    errorRate: number;
    responseTime: number;
    authFailures: number;
    rateLimitHits: number;
    cacheHitRate: number;
  };
}

export interface MCPMonitoringMetrics extends BaseMetrics {
  mcp: MCPMetrics;
}

export interface MCPMonitoringAlerts extends BaseAlerts {
  // MCP-specific alerts
  highErrorRate: boolean;
  slowResponse: boolean;
  authenticationFailures: boolean;
  rateLimitExceeded: boolean;
  lowCacheHitRate: boolean;
  componentDown: boolean;
  circuitBreakerOpen: boolean;
}

export interface MCPAlert {
  id: string;
  type: MCPAlertType;
  severity: AlertSeverity;
  message: string;
  data: Record<string, any>;
  timestamp: string;
  component: 'MCP' | 'Security' | 'Pagination' | 'ErrorHandler' | 'Cache';
  resolved?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export enum MCPAlertType {
  HIGH_ERROR_RATE = 'mcp_high_error_rate',
  SLOW_RESPONSE = 'mcp_slow_response',
  AUTH_FAILURES = 'mcp_auth_failures',
  RATE_LIMIT_EXCEEDED = 'mcp_rate_limit_exceeded',
  LOW_CACHE_HIT_RATE = 'mcp_low_cache_hit_rate',
  COMPONENT_DOWN = 'mcp_component_down',
  CIRCUIT_BREAKER_OPEN = 'mcp_circuit_breaker_open',
  SECURITY_BREACH = 'mcp_security_breach',
  PERFORMANCE_DEGRADATION = 'mcp_performance_degradation',
  RESOURCE_EXHAUSTION = 'mcp_resource_exhaustion',
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface MCPMonitoringHistory {
  metrics: MCPMetricsSnapshot[];
  alerts: MCPAlert[];
  healthChecks: MCPHealthCheckSnapshot[];
}

export interface MCPMetricsSnapshot {
  timestamp: Date;
  metrics: MCPMetrics;
}

export interface MCPHealthCheckSnapshot {
  timestamp: Date;
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: Record<string, 'up' | 'down' | 'degraded'>;
  responseTime?: number;
  details?: Record<string, any>;
}

// Real-time monitoring dashboard types
export interface MCPDashboardData {
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
    recentSecurityEvents: MCPSecurityEvent[];
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
    errorsByType: Record<MCPErrorType, number>;
    recentErrors: MCPError[];
    circuitBreakerStatus: Record<string, 'closed' | 'open' | 'half-open'>;
  };
  alerts: {
    activeAlerts: MCPAlert[];
    recentAlerts: MCPAlert[];
    alertsByType: Record<MCPAlertType, number>;
    alertsByComponent: Record<string, number>;
  };
}

export interface MCPSecurityEvent {
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
export const MCP_MONITORING_PRESETS = {
  development: {
    interval: 30000, // 30 seconds
    mcpMetricsInterval: 15000, // 15 seconds
    mcpAlertThresholds: {
      errorRate: 0.1, // 10%
      responseTime: 5000, // 5 seconds
      authFailures: 20,
      rateLimitHits: 100,
      cacheHitRate: 0.5, // 50%
    },
  },
  staging: {
    interval: 60000, // 1 minute
    mcpMetricsInterval: 30000, // 30 seconds
    mcpAlertThresholds: {
      errorRate: 0.05, // 5%
      responseTime: 3000, // 3 seconds
      authFailures: 15,
      rateLimitHits: 75,
      cacheHitRate: 0.7, // 70%
    },
  },
  production: {
    interval: 60000, // 1 minute
    mcpMetricsInterval: 30000, // 30 seconds
    mcpAlertThresholds: {
      errorRate: 0.02, // 2%
      responseTime: 2000, // 2 seconds
      authFailures: 10,
      rateLimitHits: 50,
      cacheHitRate: 0.8, // 80%
    },
  },
} as const;

// Monitoring utilities
export interface MCPMonitoringUtils {
  calculateUptime: (startTime: Date, downtime: number) => number;
  calculateErrorRate: (totalErrors: number, totalRequests: number) => number;
  calculateCacheHitRate: (hits: number, misses: number) => number;
  formatDuration: (milliseconds: number) => string;
  formatBytes: (bytes: number) => string;
  generateAlertId: () => string;
  isAlertActive: (alert: MCPAlert) => boolean;
  shouldSendAlert: (alertType: MCPAlertType, lastSent?: Date) => boolean;
}

// Webhook and notification types
export interface MCPWebhookPayload {
  event: 'alert' | 'health_check' | 'metrics_update';
  timestamp: string;
  data: MCPAlert | MCPHealthCheck | MCPMetrics;
  metadata: {
    environment: string;
    version: string;
    instance: string;
  };
}

export interface MCPSlackAlert {
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

export interface MCPEmailAlert {
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
export interface MCPMonitoringReport {
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
    errorsByType: Record<MCPErrorType, number>;
    topErrors: {
      type: MCPErrorType;
      count: number;
      percentage: number;
    }[];
    circuitBreakerTrips: number;
  };
  alerts: {
    totalAlerts: number;
    alertsByType: Record<MCPAlertType, number>;
    alertsBySeverity: Record<AlertSeverity, number>;
    meanTimeToResolution: number;
  };
  recommendations: string[];
}

// Export default monitoring configuration
export const DEFAULT_MCP_MONITORING_CONFIG: MCPMonitoringConfig = {
  url: '',
  interval: 60000,
  timeout: 10000,
  retries: 3,
  mcpEndpoints: [
    '/api/mcp/health',
    '/api/mcp/security/status',
    '/api/mcp/pagination/stats',
    '/api/mcp/errors/summary',
  ],
  mcpMetricsInterval: 30000,
  mcpAlertThresholds: {
    errorRate: 0.05,
    responseTime: 2000,
    authFailures: 10,
    rateLimitHits: 50,
    cacheHitRate: 0.8,
  },
};
