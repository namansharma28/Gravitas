// Combined API middleware with rate limiting, error monitoring, and logging

import { withRateLimit, RATE_LIMITS } from './rate-limiter';
import { withErrorMonitoring } from './error-monitoring';
import { withAPILogging } from './api-logger';

interface MiddlewareOptions {
  routeName: string;
  rateLimit?: {
    limit: number;
    windowMs: number;
  };
  skipRateLimit?: boolean;
  skipLogging?: boolean;
  getUserId?: (request: Request) => Promise<string | undefined>;
}

/**
 * Combined middleware that applies rate limiting, error monitoring, and logging
 * Use this wrapper for all API routes to get comprehensive protection and monitoring
 */
export function withMiddleware(
  handler: (request: Request, context?: any) => Promise<Response>,
  options: MiddlewareOptions
) {
  let wrappedHandler = handler;

  // Apply logging (innermost)
  if (!options.skipLogging) {
    wrappedHandler = withAPILogging(wrappedHandler, {
      getUserId: options.getUserId,
    });
  }

  // Apply error monitoring
  wrappedHandler = withErrorMonitoring(wrappedHandler, options.routeName);

  // Apply rate limiting (outermost)
  if (!options.skipRateLimit) {
    const rateLimitConfig = options.rateLimit || RATE_LIMITS.API;
    wrappedHandler = withRateLimit(wrappedHandler, rateLimitConfig);
  }

  return wrappedHandler;
}

/**
 * Preset middleware configurations for common use cases
 */
export const middlewarePresets = {
  // For authentication endpoints (strict rate limiting)
  auth: (routeName: string) =>
    (handler: (request: Request, context?: any) => Promise<Response>) =>
      withMiddleware(handler, {
        routeName,
        rateLimit: RATE_LIMITS.AUTH,
      }),

  // For upload endpoints (moderate rate limiting)
  upload: (routeName: string) =>
    (handler: (request: Request, context?: any) => Promise<Response>) =>
      withMiddleware(handler, {
        routeName,
        rateLimit: RATE_LIMITS.UPLOAD,
      }),

  // For standard API endpoints
  api: (routeName: string) =>
    (handler: (request: Request, context?: any) => Promise<Response>) =>
      withMiddleware(handler, {
        routeName,
        rateLimit: RATE_LIMITS.API,
      }),

  // For public endpoints (generous rate limiting)
  public: (routeName: string) =>
    (handler: (request: Request, context?: any) => Promise<Response>) =>
      withMiddleware(handler, {
        routeName,
        rateLimit: RATE_LIMITS.PUBLIC,
      }),

  // For admin endpoints
  admin: (routeName: string) =>
    (handler: (request: Request, context?: any) => Promise<Response>) =>
      withMiddleware(handler, {
        routeName,
        rateLimit: RATE_LIMITS.ADMIN,
      }),

  // No rate limiting (for internal use)
  noRateLimit: (routeName: string) =>
    (handler: (request: Request, context?: any) => Promise<Response>) =>
      withMiddleware(handler, {
        routeName,
        skipRateLimit: true,
      }),
};

/**
 * Example usage:
 * 
 * // In your API route file:
 * import { middlewarePresets } from '@/lib/api-middleware';
 * 
 * export const GET = middlewarePresets.api('feed')(async (request) => {
 *   // Your handler logic
 *   return NextResponse.json({ data: 'example' });
 * });
 * 
 * // Or with custom configuration:
 * import { withMiddleware, RATE_LIMITS } from '@/lib/api-middleware';
 * 
 * export const POST = withMiddleware(
 *   async (request) => {
 *     // Your handler logic
 *   },
 *   {
 *     routeName: 'custom-endpoint',
 *     rateLimit: { limit: 50, windowMs: 60000 },
 *   }
 * );
 */
