import { SERVICE_CONFIG } from './config';

interface MemoCache<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

export class MemoizationService {
  private static readonly MAX_CACHE_SIZE = 1000;

  static memoize<TArgs extends unknown[], TReturn>(
    fn: (...args: TArgs) => TReturn,
    keyGenerator?: (...args: TArgs) => string,
    ttl: number = SERVICE_CONFIG.CACHE_TTL,
  ) {
    // Create per-function cache to avoid key collisions
    const cache = new Map<string, MemoCache<TReturn>>();

    return (...args: TArgs): TReturn => {
      const baseKey = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      const key = `${fn.name || 'anonymous'}_${baseKey}`; // Namespace by function name
      const cached = cache.get(key);

      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        // Update LRU: remove and re-insert to move to most recent position
        cache.delete(key);
        cache.set(key, cached);
        return cached.value;
      }

      // Implement LRU eviction when cache is full
      if (cache.size >= this.MAX_CACHE_SIZE) {
        // Remove least recently used (first) entry
        const firstKey = cache.keys().next().value;
        if (firstKey) {
          cache.delete(firstKey);
        }
      }

      const result = fn(...args);
      cache.set(key, {
        value: result,
        timestamp: Date.now(),
        ttl,
      });

      return result;
    };
  }

  static memoizeAsync<TArgs extends unknown[], TReturn>(
    fn: (...args: TArgs) => Promise<TReturn>,
    keyGenerator?: (...args: TArgs) => string,
    ttl: number = SERVICE_CONFIG.CACHE_TTL,
  ) {
    // Create per-function caches to avoid key collisions
    const cache = new Map<string, MemoCache<TReturn>>();
    const promiseCache = new Map<string, Promise<TReturn>>();

    return async (...args: TArgs): Promise<TReturn> => {
      const baseKey = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      const key = `${fn.name || 'anonymous'}_${baseKey}`; // Namespace by function name
      const cached = cache.get(key);

      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.value;
      }

      // Prevent duplicate async calls
      if (promiseCache.has(key)) {
        return promiseCache.get(key)!;
      }

      const promise = fn(...args)
        .then((result) => {
          cache.set(key, {
            value: result,
            timestamp: Date.now(),
            ttl,
          });
          promiseCache.delete(key);
          return result;
        })
        .catch((error) => {
          promiseCache.delete(key);
          throw error;
        });

      promiseCache.set(key, promise);
      return promise;
    };
  }

  static clearCache(): void {
    this.cache.clear();
  }

  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}
