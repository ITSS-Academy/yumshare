import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
  priority?: 'low' | 'normal' | 'high';
}

@Injectable({
  providedIn: 'root'
})
export class CachingService {
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly DEFAULT_MAX_SIZE = 100;
  private readonly MAX_MEMORY_USAGE = 50 * 1024 * 1024; // 50MB

  private cache = new Map<string, CacheItem<any>>();
  private cacheStats = new BehaviorSubject({
    size: 0,
    hits: 0,
    misses: 0,
    memoryUsage: 0
  });

  private stats = {
    hits: 0,
    misses: 0
  };

  constructor() {
    // Cleanup expired items every minute
    setInterval(() => this.cleanupExpired(), 60 * 1000);
    
    // Memory cleanup every 5 minutes
    setInterval(() => this.cleanupMemory(), 5 * 60 * 1000);
  }

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    // Check if expired
    if (this.isExpired(item)) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    // Update access info
    item.accessCount++;
    item.lastAccessed = Date.now();
    
    this.stats.hits++;
    this.updateStats();
    
    return item.data;
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.DEFAULT_TTL;
    const maxSize = options.maxSize || this.DEFAULT_MAX_SIZE;

    // Check cache size limit
    if (this.cache.size >= maxSize) {
      this.evictLeastUsed();
    }

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 1,
      lastAccessed: Date.now()
    };

    this.cache.set(key, item);
    this.updateStats();
  }

  /**
   * Get or set cache with fallback
   */
  getOrSet<T>(
    key: string, 
    fallback: Observable<T>, 
    options: CacheOptions = {}
  ): Observable<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return of(cached);
    }

    return fallback.pipe(
      tap(data => this.set(key, data, options)),
      catchError(error => {
        console.error(`Cache fallback failed for key: ${key}`, error);
        throw error;
      })
    );
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    return item ? !this.isExpired(item) : false;
  }

  /**
   * Remove item from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.updateStats();
    }
    return deleted;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.updateStats();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cacheStats.asObservable();
  }

  /**
   * Get cache keys
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Preload data into cache
   */
  preload<T>(key: string, data: T, options: CacheOptions = {}): void {
    this.set(key, data, { ...options, ttl: options.ttl || 24 * 60 * 60 * 1000 }); // Default 24h for preloaded data
  }

  /**
   * Warm up cache with multiple items
   */
  warmup<T>(items: Array<{ key: string; data: T; options?: CacheOptions }>): void {
    items.forEach(item => {
      this.set(item.key, item.data, item.options);
    });
  }

  /**
   * Check if item is expired
   */
  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  /**
   * Evict least used items
   */
  private evictLeastUsed(): void {
    const items = Array.from(this.cache.entries());
    
    // Sort by access count and last accessed time
    items.sort((a, b) => {
      if (a[1].accessCount !== b[1].accessCount) {
        return a[1].accessCount - b[1].accessCount;
      }
      return a[1].lastAccessed - b[1].lastAccessed;
    });

    // Remove 20% of least used items
    const toRemove = Math.ceil(items.length * 0.2);
    items.slice(0, toRemove).forEach(([key]) => {
      this.cache.delete(key);
    });
  }

  /**
   * Cleanup expired items
   */
  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
    this.updateStats();
  }

  /**
   * Cleanup memory usage
   */
  private cleanupMemory(): void {
    const currentMemory = this.estimateMemoryUsage();
    
    if (currentMemory > this.MAX_MEMORY_USAGE) {
      // Remove 30% of items when memory usage is high
      const items = Array.from(this.cache.entries());
      const toRemove = Math.ceil(items.length * 0.3);
      
      items.slice(0, toRemove).forEach(([key]) => {
        this.cache.delete(key);
      });
      
      this.updateStats();
    }
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    
    for (const [key, item] of this.cache.entries()) {
      // Rough estimation: key length + data size + overhead
      totalSize += key.length * 2; // UTF-16 characters
      totalSize += JSON.stringify(item.data).length * 2;
      totalSize += 100; // Overhead for object structure
    }
    
    return totalSize;
  }

  /**
   * Update cache statistics
   */
  private updateStats(): void {
    this.cacheStats.next({
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      memoryUsage: this.estimateMemoryUsage()
    });
  }
}
