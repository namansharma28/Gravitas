import { NextResponse } from 'next/server';
import { apiCache, CACHE_TTL, generateCacheKey } from './cache';

export interface CacheOptions {
  ttl?: number;
  keyParams?: string[];
  varyByUser?: boolean;
  revalidateOnStale?: boolean;
}

/**
 * API caching middleware wrapper
 * Automatically caches API responses with configurable options
 */
export function withCache(
  handler: (request: Request, context?: any) => Promise<NextResponse>,
  options: CacheOptions = {}
) {
  return async (request: Request, context?: any): Promise<NextResponse> => {
    const {
      ttl = CACHE_TTL.MEDIUM,
      keyParams = [],
      varyByUser = false,
      revalidateOnStale = false,
    } = options;

    // Only cache GET requests
    if (request.method !== 'GET') {
      return handler(request, context);
    }

    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      // Build cache key
      const keyData: Record<string, any> = {
        path: pathname,
      };

      // Add specified query params to cache key
      if (keyParams.length > 0) {
        keyParams.forEach(param => {
          const value = url.searchParams.get(param);
          if (value) keyData[param] = value;
        });
      } else {
        // Include all query params if none specified
        url.searchParams.forEach((value, key) => {
          keyData[key] = value;
        });
      }

      // Vary by user if requested
      if (varyByUser) {
        const authHeader = request.headers.get('authorization');
        const sessionCookie = request.headers.get('cookie');
        keyData.user = authHeader || sessionCookie || 'anonymous';
      }

      const cacheKey = generateCacheKey('api', keyData);

      // Try to get from cache
      const cached = apiCache.get<any>(cacheKey);
      if (cached) {
        console.log(`✅ Cache HIT: ${pathname}`);
        
        // Return cached response with cache headers
        return new NextResponse(JSON.stringify(cached.data), {
          status: cached.status || 200,
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT',
            'X-Cache-Key': cacheKey,
            'Cache-Control': `private, max-age=${Math.floor(ttl / 1000)}`,
            ...(cached.headers || {}),
          },
        });
      }

      console.log(`❌ Cache MISS: ${pathname}`);

      // Execute handler
      const response = await handler(request, context);

      // Only cache successful responses
      if (response.ok) {
        const data = await response.json();
        
        // Store in cache
        apiCache.set(cacheKey, {
          data,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
        }, ttl);

        // Return response with cache headers
        return new NextResponse(JSON.stringify(data), {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'MISS',
            'X-Cache-Key': cacheKey,
            'Cache-Control': `private, max-age=${Math.floor(ttl / 1000)}`,
            ...Object.fromEntries(response.headers.entries()),
          },
        });
      }

      return response;
    } catch (error) {
      console.error('Cache middleware error:', error);
      // Fall back to handler on error
      return handler(request, context);
    }
  };
}

/**
 * Invalidate cache for specific patterns
 */
export function invalidateCache(pattern: string): void {
  apiCache.invalidatePattern(pattern);
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return apiCache.getStats();
}
