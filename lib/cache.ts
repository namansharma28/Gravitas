// Enhanced in-memory cache for API responses with LRU eviction
// In production, consider using Redis or similar

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
}

interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRate: string;
  keys: string[];
  totalSize: number;
}

class Cache {
  private cache: Map<string, CacheEntry<any>>;
  private maxSize: number;
  private hits: number = 0;
  private misses: number = 0;

  constructor(maxSize: number = 200) {
    this.cache = new Map();
    this.maxSize = maxSize;
    
    // Periodic cleanup of expired entries
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 60000); // Every minute
    }
  }

  set<T>(key: string, data: T, ttl: number = 60000): void {
    // Remove expired entries first
    this.cleanup();
    
    // LRU eviction: Remove least recently used if cache is full
    if (this.cache.size >= this.maxSize) {
      let oldestKey: string | null = null;
      let oldestTime = Date.now();
      
      const entries = Array.from(this.cache.entries());
      for (const [k, entry] of entries) {
        if (entry.lastAccessed < oldestTime) {
          oldestTime = entry.lastAccessed;
          oldestKey = k;
        }
      }
      
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      ttl,
      hits: 0,
      lastAccessed: now,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Update access stats
    entry.hits++;
    entry.lastAccessed = Date.now();
    this.hits++;

    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`🧹 Cache cleanup: removed ${keysToDelete.length} expired entries`);
    }
  }

  // Invalidate cache entries by pattern
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keys = Array.from(this.cache.keys());
    let deletedCount = 0;
    
    for (const key of keys) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      console.log(`🗑️ Invalidated ${deletedCount} cache entries matching: ${pattern}`);
    }
  }

  // Get cache stats
  getStats(): CacheStats {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 
      ? ((this.hits / totalRequests) * 100).toFixed(2) + '%'
      : '0%';
    
    // Estimate total cache size
    let totalSize = 0;
    const values = Array.from(this.cache.values());
    for (const entry of values) {
      try {
        totalSize += JSON.stringify(entry.data).length;
      } catch (e) {
        // Skip if can't stringify
      }
    }
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate,
      keys: Array.from(this.cache.keys()),
      totalSize,
    };
  }

  // Get popular cache entries
  getPopularEntries(limit: number = 10): Array<{ key: string; hits: number }> {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, hits: entry.hits }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, limit);
    
    return entries;
  }
}

// Export singleton instance
export const apiCache = new Cache(100);

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  SHORT: 30 * 1000, // 30 seconds
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
};

// Helper function to generate cache keys
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return `${prefix}:${sortedParams}`;
}

// Helper function for cached API calls
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<T> {
  // Try to get from cache
  const cached = apiCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetcher();

  // Store in cache
  apiCache.set(key, data, ttl);

  return data;
}
