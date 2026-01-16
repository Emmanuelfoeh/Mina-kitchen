/**
 * Cache optimization utilities for improved performance
 */

// Cache configuration
export const CACHE_CONFIG = {
  // API response cache durations (in milliseconds)
  API_CACHE_DURATION: {
    menu: 5 * 60 * 1000, // 5 minutes
    packages: 10 * 60 * 1000, // 10 minutes
    user: 2 * 60 * 1000, // 2 minutes
    orders: 1 * 60 * 1000, // 1 minute
    static: 60 * 60 * 1000, // 1 hour
  },

  // Memory cache limits
  MAX_CACHE_SIZE: 50, // Maximum number of cached items
  MAX_MEMORY_USAGE: 10 * 1024 * 1024, // 10MB in bytes
} as const;

interface CacheItem<T> {
  data: T;
  timestamp: number;
  size: number;
  accessCount: number;
  lastAccessed: number;
}

/**
 * In-memory cache with LRU eviction and size limits
 */
export class MemoryCache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private maxSize: number;
  private maxMemoryUsage: number;
  private currentMemoryUsage = 0;

  constructor(
    maxSize: number = CACHE_CONFIG.MAX_CACHE_SIZE,
    maxMemoryUsage: number = CACHE_CONFIG.MAX_MEMORY_USAGE
  ) {
    this.maxSize = maxSize;
    this.maxMemoryUsage = maxMemoryUsage;
  }

  /**
   * Get item from cache
   */
  get(key: string, maxAge?: number): T | null {
    const item = this.cache.get(key);

    if (!item) return null;

    // Check if item has expired
    const age = Date.now() - item.timestamp;
    if (maxAge && age > maxAge) {
      this.delete(key);
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccessed = Date.now();

    return item.data;
  }

  /**
   * Set item in cache
   */
  set(key: string, data: T, size?: number): void {
    const itemSize = size || this.estimateSize(data);

    // Remove existing item if it exists
    if (this.cache.has(key)) {
      this.delete(key);
    }

    // Check if we need to evict items
    this.evictIfNecessary(itemSize);

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      size: itemSize,
      accessCount: 1,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, item);
    this.currentMemoryUsage += itemSize;
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    const item = this.cache.get(key);
    if (item) {
      this.currentMemoryUsage -= item.size;
      return this.cache.delete(key);
    }
    return false;
  }

  /**
   * Clear all items from cache
   */
  clear(): void {
    this.cache.clear();
    this.currentMemoryUsage = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    memoryUsage: number;
    hitRate: number;
    items: Array<{
      key: string;
      accessCount: number;
      size: number;
      age: number;
    }>;
  } {
    const items = Array.from(this.cache.entries()).map(([key, item]) => ({
      key,
      accessCount: item.accessCount,
      size: item.size,
      age: Date.now() - item.timestamp,
    }));

    const totalAccesses = items.reduce(
      (sum, item) => sum + item.accessCount,
      0
    );
    const hitRate =
      totalAccesses > 0 ? totalAccesses / (totalAccesses + items.length) : 0;

    return {
      size: this.cache.size,
      memoryUsage: this.currentMemoryUsage,
      hitRate,
      items,
    };
  }

  /**
   * Evict items if necessary to make room for new item
   */
  private evictIfNecessary(newItemSize: number): void {
    // Evict by size limit
    while (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    // Evict by memory limit
    while (this.currentMemoryUsage + newItemSize > this.maxMemoryUsage) {
      this.evictLRU();
    }
  }

  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, item] of Array.from(this.cache.entries())) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  /**
   * Estimate size of data in bytes
   */
  private estimateSize(data: T): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      // Fallback estimation
      return JSON.stringify(data).length * 2; // Rough estimate for UTF-16
    }
  }
}

/**
 * Browser storage cache with compression
 */
export class BrowserStorageCache {
  private storage: Storage;
  private prefix: string;

  constructor(storage: Storage = localStorage, prefix: string = 'cache_') {
    this.storage = storage;
    this.prefix = prefix;
  }

  /**
   * Get item from storage cache
   */
  get<T>(key: string, maxAge?: number): T | null {
    try {
      const item = this.storage.getItem(this.prefix + key);
      if (!item) return null;

      const parsed = JSON.parse(item);

      // Check expiration
      if (maxAge && Date.now() - parsed.timestamp > maxAge) {
        this.delete(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.warn('Failed to get item from storage cache:', error);
      return null;
    }
  }

  /**
   * Set item in storage cache
   */
  set<T>(key: string, data: T): boolean {
    try {
      const item = {
        data,
        timestamp: Date.now(),
      };

      this.storage.setItem(this.prefix + key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.warn('Failed to set item in storage cache:', error);

      // Try to clear some space and retry
      this.cleanup();
      try {
        this.storage.setItem(
          this.prefix + key,
          JSON.stringify({ data, timestamp: Date.now() })
        );
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * Delete item from storage cache
   */
  delete(key: string): void {
    this.storage.removeItem(this.prefix + key);
  }

  /**
   * Clear all items with prefix
   */
  clear(): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => this.storage.removeItem(key));
  }

  /**
   * Clean up expired items
   */
  cleanup(maxAge: number = 24 * 60 * 60 * 1000): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(this.prefix)) {
        try {
          const item = JSON.parse(this.storage.getItem(key) || '');
          if (Date.now() - item.timestamp > maxAge) {
            keysToRemove.push(key);
          }
        } catch {
          // Invalid item, remove it
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => this.storage.removeItem(key));
  }
}

/**
 * HTTP cache with service worker integration
 */
export class HTTPCache {
  private cacheName: string;

  constructor(cacheName: string = 'api-cache-v1') {
    this.cacheName = cacheName;
  }

  /**
   * Cache HTTP response
   */
  async cacheResponse(request: Request, response: Response): Promise<void> {
    if ('caches' in window) {
      try {
        const cache = await caches.open(this.cacheName);
        await cache.put(request, response.clone());
      } catch (error) {
        console.warn('Failed to cache response:', error);
      }
    }
  }

  /**
   * Get cached response
   */
  async getCachedResponse(request: Request): Promise<Response | null> {
    if ('caches' in window) {
      try {
        const cache = await caches.open(this.cacheName);
        const response = await cache.match(request);
        return response || null;
      } catch (error) {
        console.warn('Failed to get cached response:', error);
      }
    }
    return null;
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    if ('caches' in window) {
      try {
        await caches.delete(this.cacheName);
      } catch (error) {
        console.warn('Failed to clear cache:', error);
      }
    }
  }
}

/**
 * Unified cache manager
 */
export class CacheManager {
  private memoryCache = new MemoryCache();
  private storageCache = new BrowserStorageCache();
  private httpCache = new HTTPCache();

  /**
   * Get item from cache (checks memory first, then storage)
   */
  async get<T>(key: string, maxAge?: number): Promise<T | null> {
    // Try memory cache first
    let item = this.memoryCache.get(key, maxAge) as T | null;
    if (item) return item;

    // Try storage cache
    item = this.storageCache.get<T>(key, maxAge);
    if (item) {
      // Promote to memory cache
      this.memoryCache.set(key, item);
      return item;
    }

    return null;
  }

  /**
   * Set item in cache (stores in both memory and storage)
   */
  async set<T>(key: string, data: T): Promise<void> {
    this.memoryCache.set(key, data);
    this.storageCache.set(key, data);
  }

  /**
   * Delete item from all caches
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    this.storageCache.delete(key);
  }

  /**
   * Clear all caches
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    this.storageCache.clear();
    await this.httpCache.clearCache();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      memory: this.memoryCache.getStats(),
      storage: this.getStorageStats(),
    };
  }

  /**
   * Cleanup expired items
   */
  cleanup(): void {
    this.storageCache.cleanup();
  }

  /**
   * Get storage usage statistics
   */
  private getStorageStats() {
    if (
      typeof navigator !== 'undefined' &&
      'storage' in navigator &&
      'estimate' in navigator.storage
    ) {
      return navigator.storage.estimate();
    }
    return Promise.resolve({ usage: 0, quota: 0 });
  }
}

// Global cache instance
export const globalCache = new CacheManager();

/**
 * Cache decorator for API functions
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  getCacheKey: (...args: Parameters<T>) => string,
  maxAge?: number
): T {
  return (async (...args: Parameters<T>) => {
    const cacheKey = getCacheKey(...args);

    // Try to get from cache
    const cached = await globalCache.get(cacheKey, maxAge);
    if (cached) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn(...args);
    await globalCache.set(cacheKey, result);

    return result;
  }) as T;
}

/**
 * React hook for cached API calls
 */
export function useCachedAPI<T>(
  key: string,
  fetcher: () => Promise<T>,
  maxAge?: number
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try cache first
        const cached = await globalCache.get<T>(key, maxAge);
        if (cached && !cancelled) {
          setData(cached);
          setLoading(false);
          return;
        }

        // Fetch fresh data
        const result = await fetcher();
        if (!cancelled) {
          setData(result);
          await globalCache.set(key, result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [key, maxAge]);

  const invalidate = React.useCallback(async () => {
    await globalCache.delete(key);
  }, [key]);

  return { data, loading, error, invalidate };
}

import * as React from 'react';
