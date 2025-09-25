/**
 * @fileoverview Caching Service
 * @description Advanced caching strategies with React Query and local storage integration
 */

import { monitoring } from './monitoringService';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  accessCount: number;
  lastAccessed: number;
  tags: string[];
  size: number; // Approximate size in bytes
  metadata?: Record<string, any>;
}

export interface CacheConfig {
  defaultTTL: number;
  maxSize: number; // Maximum cache size in bytes
  cleanupInterval: number;
  enableCompression: boolean;
  enableEncryption: boolean;
  persistenceEnabled: boolean;
  syncEnabled: boolean;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  evictions: number;
  hits: number;
  misses: number;
  avgAccessTime: number;
  oldestEntry: number;
  newestEntry: number;
}

export interface CacheStrategy {
  name: string;
  description: string;
  ttl: number;
  priority: 'low' | 'normal' | 'high';
  tags: string[];
  conditions?: {
    userRole?: string;
    dataFreshness?: number;
    networkStatus?: 'online' | 'offline';
  };
}

export interface ReactQueryConfig {
  defaultOptions: {
    queries: {
      staleTime: number;
      gcTime: number;
      retry: number;
      retryDelay: number;
      refetchOnWindowFocus: boolean;
      refetchOnReconnect: boolean;
      refetchInterval: number;
    };
    mutations: {
      retry: number;
      retryDelay: number;
    };
  };
  strategies: Record<string, CacheStrategy>;
}

// =============================================================================
// CACHING SERVICE CLASS
// =============================================================================

export class CachingService {
  private static instance: CachingService;
  private readonly memoryCache = new Map<string, CacheEntry>();
  private readonly config: CacheConfig;
  private readonly stats: CacheStats;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private readonly strategies = new Map<string, CacheStrategy>();
  private reactQueryConfig: ReactQueryConfig;

  private constructor() {
    this.config = {
      defaultTTL: 300000, // 5 minutes
      maxSize: 50 * 1024 * 1024, // 50MB
      cleanupInterval: 300000, // 5 minutes
      enableCompression: true,
      enableEncryption: false,
      persistenceEnabled: true,
      syncEnabled: true,
    };

    this.stats = {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      missRate: 0,
      evictions: 0,
      hits: 0,
      misses: 0,
      avgAccessTime: 0,
      oldestEntry: Date.now(),
      newestEntry: Date.now(),
    };

    this.reactQueryConfig = this.getDefaultReactQueryConfig();
    this.initializeStrategies();
    this.loadPersistentCache();
    this.startCleanupTimer();

    monitoring.trackEvent({
      type: 'caching_service_initialized',
      category: 'cache',
      action: 'initialize',
      metadata: {
        config: this.config,
        strategies: this.strategies.size,
      },
    });
  }

  public static getInstance(): CachingService {
    if (!CachingService.instance) {
      CachingService.instance = new CachingService();
    }
    return CachingService.instance;
  }

  // =============================================================================
  // CACHE MANAGEMENT
  // =============================================================================

  /**
   * Set cache entry
   */
  set<T>(
    key: string,
    data: T,
    options: {
      ttl?: number;
      tags?: string[];
      strategy?: string;
      metadata?: Record<string, any>;
      compress?: boolean;
    } = {},
  ): void {
    const strategy = options.strategy ? this.strategies.get(options.strategy) : null;
    const ttl = options.ttl || strategy?.ttl || this.config.defaultTTL;
    const tags = options.tags || strategy?.tags || [];

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
      tags,
      size: this.calculateSize(data),
      metadata: options.metadata || {},
    };

    // Check if we need to evict entries to make room
    this.ensureCapacity(entry.size);

    // Compress if enabled and requested
    if (this.config.enableCompression && options.compress !== false) {
      entry.data = this.compressData(data);
      entry.size = this.calculateSize(entry.data);
      entry.metadata = { ...entry.metadata, compressed: true };
    }

    this.memoryCache.set(key, entry);
    this.updateStats();

    // Persist if enabled
    if (this.config.persistenceEnabled) {
      this.persistEntry(key, entry);
    }

    // Track cache write
    monitoring.trackEvent({
      type: 'cache_entry_set',
      category: 'cache',
      action: 'write',
      metadata: {
        key,
        size: entry.size,
        ttl,
        tags: tags.length,
        strategy: options.strategy,
      },
    });
  }

  /**
   * Get cache entry
   */
  get<T>(key: string): T | null {
    const startTime = Date.now();
    const entry = this.memoryCache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.memoryCache.delete(key);
      this.stats.misses++;
      this.updateStats();
      this.removePersistentEntry(key);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    // Decompress if needed
    let {data} = entry;
    if (entry.metadata?.['compressed']) {
      data = this.decompressData(data);
    }

    const accessTime = Date.now() - startTime;
    this.stats.hits++;
    this.updateStats();

    // Track cache hit
    monitoring.trackEvent({
      type: 'cache_hit',
      category: 'cache',
      action: 'read',
      metadata: {
        key,
        accessTime,
        accessCount: entry.accessCount,
        age: Date.now() - entry.timestamp,
      },
    });

    return data;
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    const entry = this.memoryCache.get(key);
    if (!entry) return false;

    // Check expiration
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.memoryCache.delete(key);
      this.removePersistentEntry(key);
      return false;
    }

    return true;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    const existed = this.memoryCache.delete(key);

    if (existed) {
      this.updateStats();
      this.removePersistentEntry(key);

      monitoring.trackEvent({
      type: 'cache',
      category: 'cache',
      action: 'cache_entry_deleted',
      metadata: { key }
    });
    }

    return existed;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const entryCount = this.memoryCache.size;
    this.memoryCache.clear();
    this.updateStats();

    // Clear persistent storage
    this.clearPersistentCache();

    monitoring.trackEvent({
      type: 'cache',
      category: 'cache',
      action: 'cache_cleared',
      metadata: { entriesRemoved: entryCount }
    });
  }

  /**
   * Clear cache entries by tags
   */
  clearByTags(tags: string[]): number {
    let removed = 0;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (tags.some((tag) => entry.tags.includes(tag))) {
        this.memoryCache.delete(key);
        this.removePersistentEntry(key);
        removed++;
      }
    }

    if (removed > 0) {
      this.updateStats();
      monitoring.trackEvent({
      type: 'cache',
      category: 'cache',
      action: 'cache_cleared_by_tags',
      metadata: { tags, entriesRemoved: removed }
    });
    }

    return removed;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // =============================================================================
  // CACHE STRATEGIES
  // =============================================================================

  /**
   * Initialize default caching strategies
   */
  private initializeStrategies(): void {
    // User data strategy
    this.strategies.set('user_data', {
      name: 'User Data',
      description: 'Cache user profile and preferences',
      ttl: 600000, // 10 minutes
      priority: 'high',
      tags: ['user', 'profile'],
      conditions: {
        userRole: 'any',
      },
    });

    // Static data strategy
    this.strategies.set('static_data', {
      name: 'Static Data',
      description: 'Cache static reference data',
      ttl: 3600000, // 1 hour
      priority: 'high',
      tags: ['static', 'reference'],
      conditions: {
        dataFreshness: 3600000,
      },
    });

    // API responses strategy
    this.strategies.set('api_responses', {
      name: 'API Responses',
      description: 'Cache API responses with short TTL',
      ttl: 300000, // 5 minutes
      priority: 'normal',
      tags: ['api', 'response'],
      conditions: {
        networkStatus: 'online',
      },
    });

    // Reports strategy
    this.strategies.set('reports', {
      name: 'Reports',
      description: 'Cache generated reports',
      ttl: 1800000, // 30 minutes
      priority: 'normal',
      tags: ['report', 'analytics'],
      conditions: {
        dataFreshness: 900000, // 15 minutes
      },
    });

    // Offline strategy
    this.strategies.set('offline', {
      name: 'Offline Data',
      description: 'Cache data for offline use',
      ttl: 86400000, // 24 hours
      priority: 'high',
      tags: ['offline', 'persistent'],
      conditions: {
        networkStatus: 'offline',
      },
    });

    // Search results strategy
    this.strategies.set('search', {
      name: 'Search Results',
      description: 'Cache search query results',
      ttl: 600000, // 10 minutes
      priority: 'low',
      tags: ['search', 'query'],
      conditions: {
        dataFreshness: 300000,
      },
    });
  }

  /**
   * Add custom caching strategy
   */
  addStrategy(name: string, strategy: CacheStrategy): void {
    this.strategies.set(name, strategy);
    monitoring.trackEvent({
      type: 'cache',
      category: 'cache',
      action: 'cache_strategy_added',
      metadata: { name, ttl: strategy.ttl }
    });
  }

  /**
   * Get all strategies
   */
  getStrategies(): CacheStrategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Get React Query configuration
   */
  getReactQueryConfig(): ReactQueryConfig {
    return this.reactQueryConfig;
  }

  /**
   * Update React Query configuration
   */
  updateReactQueryConfig(config: Partial<ReactQueryConfig>): void {
    this.reactQueryConfig = { ...this.reactQueryConfig, ...config };
    monitoring.trackEvent({
      type: 'user_action',
      category: 'cache',
      action: 'react_query_config_updated',
      metadata: {
        staleTime: config.defaultOptions?.queries?.staleTime,
      },
    });
  }

  // =============================================================================
  // REACT QUERY INTEGRATION
  // =============================================================================

  /**
   * Create React Query options for a specific strategy
   */
  getQueryOptions(strategyName: string, overrides: any = {}) {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      console.warn(`Cache strategy '${strategyName}' not found, using default`);
    }

    const baseOptions = {
      staleTime: strategy?.ttl || this.config.defaultTTL,
      gcTime: (strategy?.ttl || this.config.defaultTTL) * 2,
      retry: 2,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: strategy?.priority === 'high',
      refetchOnReconnect: true,
      refetchInterval: strategy?.priority === 'high' ? 60000 : false,
      ...overrides,
    };

    return baseOptions;
  }

  /**
   * Get mutation options for a specific strategy
   */
  getMutationOptions(strategyName: string, overrides: any = {}) {
    const strategy = this.strategies.get(strategyName);

    return {
      retry: strategy?.priority === 'high' ? 3 : 1,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onSuccess: (data: any) => {
        // Invalidate related cache entries
        if (strategy?.tags) {
          this.clearByTags(strategy.tags);
        }

        monitoring.trackEvent({
          type: 'user_action',
          category: 'cache',
          action: 'cache_invalidation_on_mutation',
          metadata: {
            strategy: strategyName,
            tags: strategy?.tags,
          },
        });
      },
      ...overrides,
    };
  }

  // =============================================================================
  // PERSISTENCE
  // =============================================================================

  /**
   * Load persistent cache entries
   */
  private loadPersistentCache(): void {
    if (!this.config.persistenceEnabled) return;

    try {
      const keys = Object.keys(localStorage).filter((key) => key.startsWith('cache_'));

      for (const key of keys) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const entry: CacheEntry = JSON.parse(data);

            // Check if entry is still valid
            if (Date.now() - entry.timestamp < entry.ttl) {
              this.memoryCache.set(key.replace('cache_', ''), entry);
            } else {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Remove corrupted entries
          localStorage.removeItem(key);
        }
      }

      this.updateStats();

      monitoring.trackEvent({
        type: 'performance',
        category: 'cache',
        action: 'persistent_cache_loaded',
        metadata: {
          entriesLoaded: this.memoryCache.size,
        },
      });
    } catch (error) {
      console.warn('Failed to load persistent cache:', error);
    }
  }

  /**
   * Persist cache entry
   */
  private persistEntry(key: string, entry: CacheEntry): void {
    if (!this.config.persistenceEnabled) return;

    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to persist cache entry:', error);
    }
  }

  /**
   * Remove persistent cache entry
   */
  private removePersistentEntry(key: string): void {
    if (!this.config.persistenceEnabled) return;

    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove persistent cache entry:', error);
    }
  }

  /**
   * Clear all persistent cache
   */
  private clearPersistentCache(): void {
    if (!this.config.persistenceEnabled) return;

    const keys = Object.keys(localStorage).filter((key) => key.startsWith('cache_'));
    keys.forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  // =============================================================================
  // CACHE OPTIMIZATION
  // =============================================================================

  /**
   * Ensure cache capacity by evicting old entries
   */
  private ensureCapacity(requiredSize: number): void {
    while (this.stats.totalSize + requiredSize > this.config.maxSize && this.memoryCache.size > 0) {
      // Find the oldest entry to evict
      let oldestKey = '';
      let oldestTime = Date.now();

      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.lastAccessed < oldestTime) {
          oldestTime = entry.lastAccessed;
          oldestKey = key;
        }
      }

      if (oldestKey) {
        const entry = this.memoryCache.get(oldestKey);
        if (entry) {
          this.stats.totalSize -= entry.size;
          this.stats.evictions++;
        }
        this.memoryCache.delete(oldestKey);
        this.removePersistentEntry(oldestKey);

        monitoring.trackEvent({
          type: 'performance',
          category: 'cache',
          action: 'cache_eviction',
          metadata: {
            key: oldestKey,
            reason: 'capacity_limit',
          },
        });
      }
    }
  }

  /**
   * Update cache statistics
   */
  private updateStats(): void {
    this.stats.totalEntries = this.memoryCache.size;
    this.stats.totalSize = Array.from(this.memoryCache.values()).reduce(
      (sum, entry) => sum + entry.size,
      0,
    );

    const totalRequests = this.stats.hits + this.stats.misses;
    this.stats.hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    this.stats.missRate = totalRequests > 0 ? (this.stats.misses / totalRequests) * 100 : 0;

    // Update timestamps
    if (this.memoryCache.size > 0) {
      const timestamps = Array.from(this.memoryCache.values()).map((e) => e.timestamp);
      this.stats.oldestEntry = Math.min(...timestamps);
      this.stats.newestEntry = Math.max(...timestamps);
    }
  }

  /**
   * Calculate approximate size of data
   */
  private calculateSize(data: any): number {
    try {
      const jsonString = JSON.stringify(data);
      return jsonString.length * 2; // Rough estimate: 2 bytes per character
    } catch (error) {
      return 1000; // Default size estimate
    }
  }

  /**
   * Compress data (simple implementation)
   */
  private compressData(data: any): any {
    // In a real implementation, you would use a compression library
    // For now, just return the data as-is
    return data;
  }

  /**
   * Decompress data
   */
  private decompressData(data: any): any {
    // In a real implementation, you would decompress the data
    return data;
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Perform cache cleanup
   */
  private performCleanup(): void {
    let expiredCount = 0;
    const now = Date.now();

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.memoryCache.delete(key);
        this.removePersistentEntry(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      this.updateStats();
      monitoring.trackEvent({
        type: 'performance',
        category: 'cache',
        action: 'cache_cleanup',
        metadata: {
          expiredEntries: expiredCount,
          remainingEntries: this.memoryCache.size,
        },
      });
    }
  }

  /**
   * Get default React Query configuration
   */
  private getDefaultReactQueryConfig(): ReactQueryConfig {
    return {
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes
          retry: 2,
          retryDelay: 1000, // 1 second default delay
          refetchOnWindowFocus: false,
          refetchOnReconnect: true,
          refetchInterval: 0, // 0 means no automatic refetch
        },
        mutations: {
          retry: 1,
          retryDelay: 1000, // 1 second default delay
        },
      },
      strategies: {
        user: {
          name: 'User Data',
          description: 'User-specific data caching',
          ttl: 10 * 60 * 1000,
          priority: 'high',
          tags: ['user'],
        },
        static: {
          name: 'Static Data',
          description: 'Static reference data',
          ttl: 60 * 60 * 1000,
          priority: 'high',
          tags: ['static'],
        },
        api: {
          name: 'API Responses',
          description: 'API response caching',
          ttl: 5 * 60 * 1000,
          priority: 'normal',
          tags: ['api'],
        },
      },
    };
  }

  /**
   * Get cache optimization recommendations
   */
  async getOptimizationRecommendations(): Promise<{
    recommendations: string[];
    suggestedConfig: Partial<CacheConfig>;
    performance: {
      hitRate: number;
      avgSize: number;
      evictionRate: number;
    };
  }> {
    const recommendations: string[] = [];
    const suggestedConfig: Partial<CacheConfig> = {};

    // Analyze hit rate
    if (this.stats.hitRate < 50) {
      recommendations.push('Low cache hit rate - consider increasing TTL or improving cache keys');
    } else if (this.stats.hitRate > 90) {
      recommendations.push('High cache hit rate - consider increasing cache size');
      suggestedConfig.maxSize = Math.min(this.config.maxSize * 1.5, 200 * 1024 * 1024); // Max 200MB
    }

    // Analyze evictions
    const evictionRate = this.stats.evictions / Math.max(this.stats.totalEntries, 1);
    if (evictionRate > 0.1) {
      recommendations.push('High eviction rate - consider increasing cache size or reducing TTL');
      suggestedConfig.maxSize = Math.min(this.config.maxSize * 1.2, 100 * 1024 * 1024); // Max 100MB
    }

    // Analyze average entry size
    const avgSize = this.stats.totalSize / Math.max(this.stats.totalEntries, 1);
    if (avgSize > 1024 * 1024) {
      // > 1MB per entry
      recommendations.push('Large average entry size - consider enabling compression');
      suggestedConfig.enableCompression = true;
    }

    return {
      recommendations,
      suggestedConfig,
      performance: {
        hitRate: this.stats.hitRate,
        avgSize,
        evictionRate,
      },
    };
  }
}

// =============================================================================
// GLOBAL INSTANCE AND UTILITIES
// =============================================================================

export const cachingService = CachingService.getInstance();

// Utility functions for easy access
export const cacheSet = (key: string, data: any, options?: any) => {
  cachingService.set(key, data, options);
};
export const cacheGet = <T = any>(key: string) => cachingService.get<T>(key);
export const cacheHas = (key: string) => cachingService.has(key);
export const cacheDelete = (key: string) => cachingService.delete(key);
export const cacheClear = () => {
  cachingService.clear();
};
export const cacheClearByTags = (tags: string[]) => cachingService.clearByTags(tags);
export const getCacheStats = () => cachingService.getStats();
export const getCacheStrategies = () => cachingService.getStrategies();
export const getReactQueryConfig = () => cachingService.getReactQueryConfig();
export const getQueryOptions = (strategy: string, overrides?: any) =>
  cachingService.getQueryOptions(strategy, overrides);
export const getMutationOptions = (strategy: string, overrides?: any) =>
  cachingService.getMutationOptions(strategy, overrides);
export const getCacheOptimizationRecommendations = () =>
  cachingService.getOptimizationRecommendations();

export default CachingService;
