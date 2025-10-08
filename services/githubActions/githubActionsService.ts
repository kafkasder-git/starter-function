/**
 * GitHub Actions Service
 *
 * Handles communication with GitHub API to fetch workflow runs, jobs, and logs.
 * Implements caching mechanism for performance optimization.
 * Includes rate limiting and retry logic for robust API communication.
 */

import type {
  GitHubActionsConfig,
  WorkflowRun,
  WorkflowJob,
  GitHubApiError,
  CacheConfig,
} from '@/types/githubActions';

/**
 * Cache entry with expiration
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Rate limit information from GitHub API
 */
interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  used: number;
}

/**
 * Retry configuration
 */
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
}

/**
 * Cache configuration for different data types
 */
const CACHE_CONFIG: Record<string, CacheConfig> = {
  workflows: {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 50,
  },
  jobs: {
    ttl: 10 * 60 * 1000, // 10 minutes
    maxSize: 100,
  },
  logs: {
    ttl: 30 * 60 * 1000, // 30 minutes
    maxSize: 20,
  },
};

/**
 * Retry configuration for API requests
 */
const RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

/**
 * Rate limit buffer - stop making requests when this many requests remain
 */
const RATE_LIMIT_BUFFER = 10;

/**
 * GitHub Actions Service
 * Manages GitHub API interactions with caching support, rate limiting, and retry logic
 */
export class GitHubActionsService {
  private config: GitHubActionsConfig;
  private workflowCache: Map<string, CacheEntry<WorkflowRun[]>>;
  private jobCache: Map<number, CacheEntry<WorkflowJob[]>>;
  private logCache: Map<number, CacheEntry<string>>;
  private baseUrl = 'https://api.github.com';
  private rateLimitInfo: RateLimitInfo | null = null;

  constructor(config: GitHubActionsConfig) {
    this.config = config;
    this.workflowCache = new Map();
    this.jobCache = new Map();
    this.logCache = new Map();
  }

  /**
   * Get workflow runs for the repository
   * @param workflowId - Optional workflow ID to filter by
   * @param limit - Maximum number of runs to return
   * @returns Array of workflow runs
   */
  async getWorkflowRuns(workflowId?: string, limit: number = 30): Promise<WorkflowRun[]> {
    const cacheKey = `runs_${workflowId || 'all'}_${limit}`;

    // Check cache first
    const cached = this.getCachedData(this.workflowCache, cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const endpoint = workflowId
        ? `/repos/${this.config.owner}/${this.config.repo}/actions/workflows/${workflowId}/runs`
        : `/repos/${this.config.owner}/${this.config.repo}/actions/runs`;

      const params = new URLSearchParams({
        per_page: limit.toString(),
        ...(this.config.branch && { branch: this.config.branch }),
      });

      const response = await this.makeRequest<{ workflow_runs: WorkflowRun[] }>(
        `${endpoint}?${params}`,
      );

      const runs = response.workflow_runs;

      // Cache the result
      this.setCachedData(this.workflowCache, cacheKey, runs, CACHE_CONFIG.workflows?.ttl || 300000);

      return runs;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get a specific workflow run by ID
   * @param runId - The workflow run ID
   * @returns Workflow run details
   */
  async getWorkflowRun(runId: number): Promise<WorkflowRun> {
    try {
      const endpoint = `/repos/${this.config.owner}/${this.config.repo}/actions/runs/${runId}`;
      const run = await this.makeRequest<WorkflowRun>(endpoint);
      return run;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get jobs for a specific workflow run
   * @param runId - The workflow run ID
   * @returns Array of workflow jobs
   */
  async getWorkflowJobs(runId: number): Promise<WorkflowJob[]> {
    // Check cache first
    const cached = this.getCachedData(this.jobCache, runId);
    if (cached) {
      return cached;
    }

    try {
      const endpoint = `/repos/${this.config.owner}/${this.config.repo}/actions/runs/${runId}/jobs`;
      const response = await this.makeRequest<{ jobs: WorkflowJob[] }>(endpoint);

      const jobs = response.jobs;

      // Cache the result
      this.setCachedData(this.jobCache, runId, jobs, CACHE_CONFIG.jobs?.ttl || 600000);

      return jobs;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get logs for a specific workflow run
   * @param runId - The workflow run ID
   * @returns Raw log content as string
   */
  async getWorkflowLogs(runId: number): Promise<string> {
    // Check cache first
    const cached = this.getCachedData(this.logCache, runId);
    if (cached) {
      return cached;
    }

    try {
      const endpoint = `/repos/${this.config.owner}/${this.config.repo}/actions/runs/${runId}/logs`;

      // Logs endpoint returns a redirect to download URL
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: this.getHeaders(),
        redirect: 'follow',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.statusText}`);
      }

      const logs = await response.text();

      // Cache the result
      this.setCachedData(this.logCache, runId, logs, CACHE_CONFIG.logs?.ttl || 1800000);

      return logs;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get failed workflow runs
   * @param limit - Maximum number of runs to return
   * @returns Array of failed workflow runs
   */
  async getFailedRuns(limit: number = 10): Promise<WorkflowRun[]> {
    try {
      const endpoint = `/repos/${this.config.owner}/${this.config.repo}/actions/runs`;
      const params = new URLSearchParams({
        status: 'completed',
        per_page: (limit * 2).toString(), // Fetch more to filter
        ...(this.config.branch && { branch: this.config.branch }),
      });

      const response = await this.makeRequest<{ workflow_runs: WorkflowRun[] }>(
        `${endpoint}?${params}`,
      );

      // Filter for failed runs only
      const failedRuns = response.workflow_runs
        .filter((run) => run.conclusion === 'failure')
        .slice(0, limit);

      return failedRuns;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Rerun a failed workflow
   * @param runId - The workflow run ID to rerun
   */
  async rerunWorkflow(runId: number): Promise<void> {
    try {
      const endpoint = `/repos/${this.config.owner}/${this.config.repo}/actions/runs/${runId}/rerun`;

      await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      // Invalidate cache for this run
      this.invalidateCache(runId);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.workflowCache.clear();
    this.jobCache.clear();
    this.logCache.clear();
  }

  /**
   * Invalidate cache for a specific run
   * @param runId - The workflow run ID
   */
  private invalidateCache(runId: number): void {
    this.jobCache.delete(runId);
    this.logCache.delete(runId);

    // Clear workflow cache as it might contain this run
    this.workflowCache.clear();
  }

  /**
   * Make an authenticated request to GitHub API with retry logic
   * @param endpoint - API endpoint path
   * @param attempt - Current attempt number (for retry logic)
   * @returns Parsed JSON response
   */
  private async makeRequest<T>(endpoint: string, attempt: number = 1): Promise<T> {
    // Check rate limit before making request
    await this.checkRateLimit();

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: this.getHeaders(),
      });

      // Update rate limit info from response headers
      this.updateRateLimitInfo(response);

      if (!response.ok) {
        // Handle rate limit exceeded
        if (response.status === 403 || response.status === 429) {
          const resetTime = this.rateLimitInfo?.reset || Date.now() / 1000 + 60;
          const waitTime = Math.max(0, resetTime * 1000 - Date.now());

          if (attempt < RETRY_CONFIG.maxAttempts) {
            await this.sleep(waitTime);
            return this.makeRequest<T>(endpoint, attempt + 1);
          }

          throw new Error('GitHub API rate limit exceeded. Please try again later.');
        }

        // Handle other errors with retry for transient failures
        if (this.isRetryableError(response.status) && attempt < RETRY_CONFIG.maxAttempts) {
          const delay = this.calculateBackoffDelay(attempt);
          await this.sleep(delay);
          return this.makeRequest<T>(endpoint, attempt + 1);
        }

        const error: GitHubApiError = await response.json().catch(() => ({
          message: response.statusText,
          status: response.status,
        }));
        throw error;
      }

      return response.json();
    } catch (error) {
      // Retry on network errors
      if (this.isNetworkError(error) && attempt < RETRY_CONFIG.maxAttempts) {
        const delay = this.calculateBackoffDelay(attempt);
        await this.sleep(delay);
        return this.makeRequest<T>(endpoint, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Check if we're within rate limit before making a request
   */
  private async checkRateLimit(): Promise<void> {
    if (!this.rateLimitInfo) {
      // Fetch rate limit info if not available
      await this.fetchRateLimitInfo();
    }

    if (this.rateLimitInfo && this.rateLimitInfo.remaining <= RATE_LIMIT_BUFFER) {
      const now = Date.now() / 1000;
      const resetTime = this.rateLimitInfo.reset;

      if (now < resetTime) {
        const waitTime = (resetTime - now) * 1000;
        console.warn(`Rate limit approaching. Waiting ${Math.ceil(waitTime / 1000)}s until reset.`);
        await this.sleep(waitTime);
        // Refresh rate limit info after waiting
        await this.fetchRateLimitInfo();
      }
    }
  }

  /**
   * Fetch current rate limit information from GitHub API
   */
  private async fetchRateLimitInfo(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/rate_limit`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        this.rateLimitInfo = data.resources.core;
      }
    } catch (error) {
      // Silently fail - we'll rely on response headers
      console.warn('Failed to fetch rate limit info:', error);
    }
  }

  /**
   * Update rate limit info from response headers
   * @param response - Fetch response
   */
  private updateRateLimitInfo(response: Response): void {
    const limit = response.headers.get('x-ratelimit-limit');
    const remaining = response.headers.get('x-ratelimit-remaining');
    const reset = response.headers.get('x-ratelimit-reset');
    const used = response.headers.get('x-ratelimit-used');

    if (limit && remaining && reset) {
      this.rateLimitInfo = {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10),
        used: used ? parseInt(used, 10) : 0,
      };
    }
  }

  /**
   * Check if an error is retryable
   * @param status - HTTP status code
   * @returns True if error is retryable
   */
  private isRetryableError(status: number): boolean {
    // Retry on server errors and some client errors
    return status >= 500 || status === 408 || status === 429;
  }

  /**
   * Check if an error is a network error
   * @param error - Error object
   * @returns True if network error
   */
  private isNetworkError(error: unknown): boolean {
    if (error instanceof TypeError) {
      return error.message.includes('fetch') || error.message.includes('network');
    }
    return false;
  }

  /**
   * Calculate exponential backoff delay
   * @param attempt - Current attempt number
   * @returns Delay in milliseconds
   */
  private calculateBackoffDelay(attempt: number): number {
    const delay = Math.min(
      RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1),
      RETRY_CONFIG.maxDelay,
    );
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }

  /**
   * Sleep for specified milliseconds
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get current rate limit information
   * @returns Rate limit info or null if not available
   */
  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  /**
   * Get request headers with authentication
   * @returns Headers object
   */
  private getHeaders(): HeadersInit {
    return {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${this.config.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    };
  }

  /**
   * Get cached data if valid
   * @param cache - Cache map to check
   * @param key - Cache key
   * @returns Cached data or null if expired/missing
   */
  private getCachedData<K, T>(cache: Map<K, CacheEntry<T>>, key: K): T | null {
    const entry = cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cached data with TTL
   * @param cache - Cache map to update
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in milliseconds
   */
  private setCachedData<K, T>(cache: Map<K, CacheEntry<T>>, key: K, data: T, ttl: number): void {
    // Implement simple LRU by removing oldest entry if at max size
    const maxSize = this.getMaxCacheSize(cache);

    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get max cache size for a specific cache
   * @param cache - Cache map
   * @returns Maximum cache size
   */
  private getMaxCacheSize<K, T>(cache: Map<K, CacheEntry<T>>): number {
    if (cache === this.workflowCache) return CACHE_CONFIG.workflows?.maxSize || 50;
    if (cache === this.jobCache) return CACHE_CONFIG.jobs?.maxSize || 100;
    if (cache === this.logCache) return CACHE_CONFIG.logs?.maxSize || 20;
    return 50; // Default
  }

  /**
   * Handle API errors and convert to user-friendly messages
   * @param error - Error object
   * @returns Formatted error
   */
  private handleApiError(error: unknown): Error {
    if (error && typeof error === 'object' && 'message' in error) {
      const apiError = error as GitHubApiError;
      return new Error(`GitHub API Error: ${apiError.message}`);
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error('Unknown error occurred while communicating with GitHub API');
  }
}
