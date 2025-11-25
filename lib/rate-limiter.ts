// Rate limiting implementation using in-memory store
// For production, consider using Redis for distributed rate limiting

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.requests = new Map();
    
    // Cleanup expired entries every 5 minutes
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  /**
   * Check if a request should be rate limited
   * @param identifier - Unique identifier (IP, user ID, etc.)
   * @param limit - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns Object with allowed status and remaining requests
   */
  check(
    identifier: string,
    limit: number = 100,
    windowMs: number = 60 * 1000
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    // No previous requests or window expired
    if (!entry || now > entry.resetTime) {
      const resetTime = now + windowMs;
      this.requests.set(identifier, {
        count: 1,
        resetTime,
      });
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime,
      };
    }

    // Within the window
    if (entry.count < limit) {
      entry.count++;
      return {
        allowed: true,
        remaining: limit - entry.count,
        resetTime: entry.resetTime,
      };
    }

    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reset rate limit for a specific identifier
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let deletedCount = 0;

    const entries = Array.from(this.requests.entries());
    for (const [key, entry] of entries) {
      if (now > entry.resetTime) {
        this.requests.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`🧹 Rate limiter cleanup: removed ${deletedCount} expired entries`);
    }
  }

  /**
   * Get current stats
   */
  getStats() {
    return {
      totalEntries: this.requests.size,
      entries: Array.from(this.requests.entries()).map(([key, entry]) => ({
        identifier: key,
        count: entry.count,
        resetTime: new Date(entry.resetTime).toISOString(),
      })),
    };
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.requests.clear();
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Rate limit configurations for different endpoints
export const RATE_LIMITS = {
  // Authentication endpoints - stricter limits
  AUTH: {
    limit: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // Upload endpoints - moderate limits
  UPLOAD: {
    limit: 10,
    windowMs: 60 * 1000, // 1 minute
  },
  // API endpoints - generous limits
  API: {
    limit: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  // Public endpoints - very generous
  PUBLIC: {
    limit: 200,
    windowMs: 60 * 1000, // 1 minute
  },
  // Admin endpoints - moderate limits
  ADMIN: {
    limit: 50,
    windowMs: 60 * 1000, // 1 minute
  },
};

/**
 * Get client identifier from request
 * Uses IP address or user ID if authenticated
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
  return `ip:${ip}`;
}

/**
 * Rate limit middleware wrapper
 */
export function withRateLimit(
  handler: (request: Request, context?: any) => Promise<Response>,
  config: { limit: number; windowMs: number } = RATE_LIMITS.API
) {
  return async (request: Request, context?: any): Promise<Response> => {
    try {
      // Get client identifier
      const identifier = getClientIdentifier(request);

      // Check rate limit
      const { allowed, remaining, resetTime } = rateLimiter.check(
        identifier,
        config.limit,
        config.windowMs
      );

      // Add rate limit headers
      const headers = {
        'X-RateLimit-Limit': config.limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
      };

      if (!allowed) {
        const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
        console.warn(`⚠️ Rate limit exceeded for ${identifier}`);
        
        return new Response(
          JSON.stringify({
            error: 'Too many requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': retryAfter.toString(),
              ...headers,
            },
          }
        );
      }

      // Execute handler
      const response = await handler(request, context);

      // Add rate limit headers to response
      const newHeaders = new Headers(response.headers);
      Object.entries(headers).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      // Fall back to handler on error
      return handler(request, context);
    }
  };
}
