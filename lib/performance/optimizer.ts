/**
 * @fileoverview Performance Optimization Utilities
 * @description Tools for optimizing application performance
 */

/**
 * Debounce function - delays execution until after wait time
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function - limits execution to once per wait time
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastResult: ReturnType<T>;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = func(...args);
      
      setTimeout(() => {
        inThrottle = false;
      }, wait);
    }
    
    return lastResult;
  };
}

/**
 * Memoize function results
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Lazy load images with Intersection Observer
 */
export function lazyLoadImages(selector: string = 'img[data-src]') {
  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers without IntersectionObserver
    const images = document.querySelectorAll(selector);
    images.forEach((img) => {
      const src = img.getAttribute('data-src');
      if (src) {
        img.setAttribute('src', src);
      }
    });
    return;
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.getAttribute('data-src');
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      }
    });
  });

  const images = document.querySelectorAll(selector);
  images.forEach((img) => imageObserver.observe(img));
}

/**
 * Preload critical resources
 */
export function preloadResources(resources: Array<{ href: string; as: string }>) {
  resources.forEach(({ href, as }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  });
}

/**
 * Prefetch resources for next navigation
 */
export function prefetchResources(urls: string[]) {
  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Request idle callback wrapper
 */
export function runWhenIdle(callback: () => void, timeout: number = 2000) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, timeout);
  }
}

/**
 * Batch DOM updates
 */
export function batchDOMUpdates(updates: Array<() => void>) {
  requestAnimationFrame(() => {
    updates.forEach((update) => update());
  });
}

/**
 * Virtual scroll helper
 */
export class VirtualScroller {
  private container: HTMLElement;
  private itemHeight: number;
  private items: any[];
  private visibleCount: number;
  private startIndex: number = 0;

  constructor(
    container: HTMLElement,
    items: any[],
    itemHeight: number,
    visibleCount: number
  ) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.visibleCount = visibleCount;

    this.setupScroll();
  }

  private setupScroll() {
    this.container.addEventListener('scroll', () => {
      const scrollTop = this.container.scrollTop;
      this.startIndex = Math.floor(scrollTop / this.itemHeight);
      this.render();
    });

    this.render();
  }

  private render() {
    const endIndex = Math.min(
      this.startIndex + this.visibleCount,
      this.items.length
    );
    
    const visibleItems = this.items.slice(this.startIndex, endIndex);
    
    // Render logic here
    if (typeof window !== 'undefined') {
      import('../logging/logger').then(({ logger }) => {
        logger.info('Rendering items:', this.startIndex, 'to', endIndex);
      });
    }
    
    return visibleItems;
  }

  public updateItems(items: any[]) {
    this.items = items;
    this.render();
  }
}

/**
 * Image optimization helper
 */
export function optimizeImage(
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
  } = {}
): string {
  const { width, height, quality = 80, format = 'webp' } = options;
  
  // If using a CDN like Cloudinary or imgix, construct optimized URL
  // This is a placeholder - adjust based on your CDN
  const params = new URLSearchParams();
  
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  params.append('q', quality.toString());
  params.append('f', format);
  
  return `${src}?${params.toString()}`;
}

/**
 * Code splitting helper
 */
export async function loadComponent<T>(
  importFn: () => Promise<{ default: T }>
): Promise<T> {
  try {
    const module = await importFn();
    return module.default;
  } catch (error) {
    if (typeof window !== 'undefined') {
      import('../logging/logger').then(({ logger }) => {
        logger.error('Failed to load component:', error);
      });
    }
    throw error;
  }
}

/**
 * Service Worker registration helper
 */
export async function registerServiceWorker(swPath: string = '/sw.js') {
  if (!('serviceWorker' in navigator)) {
    if (typeof window !== 'undefined') {
      import('../logging/logger').then(({ logger }) => {
        logger.warn('Service Worker not supported');
      });
    }
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(swPath);
    if (typeof window !== 'undefined') {
      import('../logging/logger').then(({ logger }) => {
        logger.info('Service Worker registered:', registration);
      });
    }
    return registration;
  } catch (error) {
    if (typeof window !== 'undefined') {
      import('../logging/logger').then(({ logger }) => {
        logger.error('Service Worker registration failed:', error);
      });
    }
    return null;
  }
}

/**
 * Cache API helper
 */
export class CacheManager {
  private cacheName: string;

  constructor(cacheName: string = 'app-cache-v1') {
    this.cacheName = cacheName;
  }

  async cache(url: string, response: Response) {
    const cache = await caches.open(this.cacheName);
    await cache.put(url, response);
  }

  async get(url: string): Promise<Response | undefined> {
    const cache = await caches.open(this.cacheName);
    return await cache.match(url);
  }

  async delete(url: string): Promise<boolean> {
    const cache = await caches.open(this.cacheName);
    return await cache.delete(url);
  }

  async clear(): Promise<boolean> {
    return await caches.delete(this.cacheName);
  }
}

/**
 * Network-first cache strategy
 */
export async function networkFirst(
  url: string,
  cacheManager: CacheManager
): Promise<Response> {
  try {
    const response = await fetch(url);
    await cacheManager.cache(url, response.clone());
    return response;
  } catch (error) {
    const cached = await cacheManager.get(url);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

/**
 * Cache-first strategy
 */
export async function cacheFirst(
  url: string,
  cacheManager: CacheManager
): Promise<Response> {
  const cached = await cacheManager.get(url);
  if (cached) {
    return cached;
  }

  const response = await fetch(url);
  await cacheManager.cache(url, response.clone());
  return response;
}

export default {
  debounce,
  throttle,
  memoize,
  lazyLoadImages,
  preloadResources,
  prefetchResources,
  runWhenIdle,
  batchDOMUpdates,
  VirtualScroller,
  optimizeImage,
  loadComponent,
  registerServiceWorker,
  CacheManager,
  networkFirst,
  cacheFirst,
};
