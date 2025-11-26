/**
 * PWA Cache Management Utilities
 * Provides client-side cache management for better offline experience
 */

export interface CacheStats {
  name: string;
  size: number;
  count: number;
}

/**
 * Get all cache statistics
 */
export async function getCacheStats(): Promise<CacheStats[]> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return [];
  }

  try {
    const cacheNames = await caches.keys();
    const stats: CacheStats[] = [];

    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      
      let totalSize = 0;
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }

      stats.push({
        name,
        size: totalSize,
        count: keys.length,
      });
    }

    return stats;
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return [];
  }
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return false;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    return true;
  } catch (error) {
    console.error('Error clearing caches:', error);
    return false;
  }
}

/**
 * Clear specific cache by name
 */
export async function clearCache(cacheName: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return false;
  }

  try {
    return await caches.delete(cacheName);
  } catch (error) {
    console.error(`Error clearing cache ${cacheName}:`, error);
    return false;
  }
}

/**
 * Precache important URLs for offline access
 */
export async function precacheUrls(urls: string[]): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return;
  }

  try {
    const cache = await caches.open('precache-v1');
    await cache.addAll(urls);
  } catch (error) {
    console.error('Error precaching URLs:', error);
  }
}

/**
 * Check if a URL is cached
 */
export async function isCached(url: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return false;
  }

  try {
    const cacheNames = await caches.keys();
    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const response = await cache.match(url);
      if (response) return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking cache:', error);
    return false;
  }
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
