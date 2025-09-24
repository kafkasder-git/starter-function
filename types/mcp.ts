// MCP (Model Context Protocol) Types
// Placeholder types for MCP integration

export interface MCPMetrics {
  timestamp: Date;
  serverName: string;
  requestCount: number;
  responseTime: number;
  errorCount: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface MCPHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  serverName: string;
  checks: {
    database: boolean;
    api: boolean;
    storage: boolean;
  };
  uptime: number;
}

export interface MCPError {
  id: string;
  timestamp: Date;
  serverName: string;
  type: MCPErrorType;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
}

export enum MCPErrorType {
  CONNECTION_ERROR = 'connection_error',
  TIMEOUT_ERROR = 'timeout_error',
  VALIDATION_ERROR = 'validation_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  AUTHORIZATION_ERROR = 'authorization_error',
  RATE_LIMIT_ERROR = 'rate_limit_error',
  INTERNAL_ERROR = 'internal_error',
  EXTERNAL_SERVICE_ERROR = 'external_service_error',
}
