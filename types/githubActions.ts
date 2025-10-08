/**
 * GitHub Actions Type Definitions
 *
 * This file contains all type definitions for the GitHub Actions error detection
 * and auto-fix system.
 */

// ============================================================================
// Error Types and Categories
// ============================================================================

/**
 * Types of errors that can be detected in GitHub Actions workflows
 */
export enum ErrorType {
  ESLINT = 'eslint',
  TYPESCRIPT = 'typescript',
  BUILD = 'build',
  DEPLOY = 'deploy',
  SECURITY = 'security',
  TEST = 'test',
  DEPENDENCY = 'dependency',
  CONFIGURATION = 'configuration',
  UNKNOWN = 'unknown',
}

/**
 * Categories for error classification
 */
export enum ErrorCategory {
  CODE_QUALITY = 'code_quality',
  TYPE_SAFETY = 'type_safety',
  BUILD_FAILURE = 'build_failure',
  DEPLOYMENT = 'deployment',
  SECURITY_VULNERABILITY = 'security_vulnerability',
  CONFIGURATION = 'configuration',
  DEPENDENCY = 'dependency',
}

// ============================================================================
// GitHub Actions Workflow Types
// ============================================================================

/**
 * GitHub Actions workflow run status
 */
export type WorkflowStatus = 'queued' | 'in_progress' | 'completed';

/**
 * GitHub Actions workflow run conclusion
 */
export type WorkflowConclusion = 'success' | 'failure' | 'cancelled' | 'skipped' | null;

/**
 * Represents a GitHub Actions workflow run
 */
export interface WorkflowRun {
  id: number;
  name: string;
  status: WorkflowStatus;
  conclusion: WorkflowConclusion;
  workflow_id: number;
  created_at: string;
  updated_at: string;
  html_url: string;
  jobs_url: string;
  logs_url: string;
}

/**
 * Represents a job within a workflow run
 */
export interface WorkflowJob {
  id: number;
  run_id: number;
  name: string;
  status: string;
  conclusion: string | null;
  started_at: string;
  completed_at: string | null;
  steps: WorkflowStep[];
}

/**
 * Represents a step within a workflow job
 */
export interface WorkflowStep {
  name: string;
  status: string;
  conclusion: string | null;
  number: number;
  started_at: string;
  completed_at: string | null;
}

// ============================================================================
// Error Parsing Types
// ============================================================================

/**
 * Severity levels for errors
 */
export type ErrorSeverity = 'error' | 'warning' | 'info';

/**
 * Represents a parsed error from workflow logs
 */
export interface ParsedError {
  type: ErrorType;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  rule?: string;
  severity: ErrorSeverity;
  rawLog: string;
  context?: string[];
}

/**
 * File location information extracted from error logs
 */
export interface FileLocation {
  file?: string;
  line?: number;
  column?: number;
}

// ============================================================================
// Error Analysis Types
// ============================================================================

/**
 * Impact level of an error
 */
export type ErrorImpact = 'low' | 'medium' | 'high' | 'critical';

/**
 * Represents a fix suggestion for an error
 */
export interface FixSuggestion {
  title: string;
  description: string;
  command?: string;
  autoFixable: boolean;
  estimatedTime: string;
  steps?: string[];
}

/**
 * Represents a complete error analysis
 */
export interface ErrorAnalysis {
  error: ParsedError;
  category: ErrorCategory;
  priority: number;
  impact: ErrorImpact;
  fixable: boolean;
  relatedErrors: ParsedError[];
  suggestions: FixSuggestion[];
}

// ============================================================================
// Auto-Fix Types
// ============================================================================

/**
 * Options for applying fixes
 */
export interface FixOptions {
  dryRun?: boolean;
  autoCommit?: boolean;
  commitMessage?: string;
}

/**
 * Result of applying a fix
 */
export interface FixResult {
  success: boolean;
  error?: ParsedError;
  appliedFix?: FixSuggestion;
  message: string;
  filesModified?: string[];
  commandsExecuted?: string[];
}

// ============================================================================
// Workflow Validation Types
// ============================================================================

/**
 * Validation error in a workflow file
 */
export interface ValidationError {
  file: string;
  message: string;
  line?: number;
  severity: 'error' | 'warning';
}

/**
 * Validation warning in a workflow file
 */
export interface ValidationWarning {
  file: string;
  message: string;
  suggestion?: string;
}

/**
 * Result of workflow validation
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

/**
 * Workflow configuration requirements
 */
export interface WorkflowConfig {
  requiredSecrets: string[];
  requiredEnvVars: string[];
  nodeVersion: string;
}

// ============================================================================
// Error History Types
// ============================================================================

/**
 * Represents a historical error record
 */
export interface ErrorRecord {
  id: string;
  timestamp: Date;
  workflowRun: WorkflowRun;
  errors: ParsedError[];
  analyses: ErrorAnalysis[];
  fixes: FixResult[];
  resolved: boolean;
  resolvedAt?: Date;
}

/**
 * Statistics about errors over time
 */
export interface ErrorStats {
  totalErrors: number;
  errorsByType: Record<ErrorType, number>;
  errorsByCategory: Record<ErrorCategory, number>;
  mostCommonErrors: Array<{ error: string; count: number }>;
  averageResolutionTime: number;
  fixSuccessRate: number;
}

/**
 * Time period for statistics
 */
export interface StatsPeriod {
  start: Date;
  end: Date;
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * GitHub Actions service configuration
 */
export interface GitHubActionsConfig {
  owner: string;
  repo: string;
  token: string;
  branch?: string;
}

/**
 * Application state for GitHub Actions
 */
export interface GitHubActionsState {
  config: GitHubActionsConfig;
  recentRuns: WorkflowRun[];
  errorHistory: ErrorRecord[];
  cache: {
    workflows: Map<string, WorkflowRun>;
    jobs: Map<number, WorkflowJob[]>;
    logs: Map<number, string>;
  };
  settings: GitHubActionsSettings;
}

/**
 * User settings for GitHub Actions features
 */
export interface GitHubActionsSettings {
  autoFetch: boolean;
  fetchInterval: number;
  notificationsEnabled: boolean;
  autoFixEnabled: boolean;
}

// ============================================================================
// Cache Configuration Types
// ============================================================================

/**
 * Cache configuration for a specific cache type
 */
export interface CacheConfig {
  ttl: number;
  maxSize: number;
}

/**
 * Complete cache configuration
 */
export interface CacheConfiguration {
  workflows: CacheConfig;
  jobs: CacheConfig;
  logs: CacheConfig;
}

// ============================================================================
// Performance Configuration Types
// ============================================================================

/**
 * API performance configuration
 */
export interface ApiPerformanceConfig {
  maxConcurrentRequests: number;
  requestTimeout: number;
  retryAttempts: number;
  rateLimitBuffer: number;
}

/**
 * Cache strategy configuration
 */
export interface CacheStrategyConfig {
  enabled: boolean;
  strategy: 'lru' | 'fifo';
  maxSize: number;
  ttl: number;
}

/**
 * UI performance configuration
 */
export interface UiPerformanceConfig {
  virtualScrollThreshold: number;
  lazyLoadChunkSize: number;
  debounceDelay: number;
}

/**
 * Complete performance configuration
 */
export interface PerformanceConfig {
  api: ApiPerformanceConfig;
  cache: CacheStrategyConfig;
  ui: UiPerformanceConfig;
}

// ============================================================================
// Security Configuration Types
// ============================================================================

/**
 * Token security configuration
 */
export interface TokenSecurityConfig {
  storage: 'encrypted' | 'plain';
  rotation: boolean;
  expiryCheck: boolean;
}

/**
 * Log sanitization configuration
 */
export interface LogSanitizationConfig {
  sanitize: boolean;
  patterns: RegExp[];
}

/**
 * Command security configuration
 */
export interface CommandSecurityConfig {
  whitelist: string[];
  validation: boolean;
}

/**
 * Complete security configuration
 */
export interface SecurityConfig {
  token: TokenSecurityConfig;
  logs: LogSanitizationConfig;
  commands: CommandSecurityConfig;
}

// ============================================================================
// Feature Flags
// ============================================================================

/**
 * Feature flags for gradual rollout
 */
export interface FeatureFlags {
  errorDetection: boolean;
  errorAnalysis: boolean;
  autoFix: boolean;
  workflowValidation: boolean;
  errorHistory: boolean;
  notifications: boolean;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * GitHub API error response
 */
export interface GitHubApiError {
  message: string;
  documentation_url?: string;
  status?: number;
}

/**
 * Command execution result
 */
export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode?: number;
}
