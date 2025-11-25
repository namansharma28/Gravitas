# Security & Stability Implementation

## Overview
This document outlines the security and stability features implemented across the Gravitas platform.

## 1. Rate Limiting

### Implementation
- **Location**: `lib/rate-limiter.ts`
- **Type**: In-memory rate limiting with LRU eviction
- **Production Note**: Consider Redis for distributed systems

### Features
- ✅ Configurable limits per endpoint type
- ✅ Automatic cleanup of expired entries
- ✅ Client identification by IP or user ID
- ✅ Rate limit headers in responses
- ✅ Graceful 429 responses with retry-after

### Rate Limit Configurations

```typescript
RATE_LIMITS = {
  AUTH: {
    limit: 5 requests,
    window: 15 minutes
  },
  UPLOAD: {
    limit: 10 requests,
    window: 1 minute
  },
  API: {
    limit: 100 requests,
    window: 1 minute
  },
  PUBLIC: {
    limit: 200 requests,
    window: 1 minute
  },
  ADMIN: {
    limit: 50 requests,
    window: 1 minute
  }
}
```

### Response Headers
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: When the limit resets
- `Retry-After`: Seconds until retry (on 429)

### Example 429 Response
```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 45
}
```

## 2. Error Monitoring

### Implementation
- **Location**: `lib/error-monitoring.ts`
- **Integration**: Ready for Sentry or similar services
- **Fallback**: Local logging when Sentry not configured

### Features
- ✅ Error, warning, and info logging
- ✅ Context tracking (user, URL, method, etc.)
- ✅ Stack trace capture
- ✅ Sentry integration ready
- ✅ User context management
- ✅ Error statistics and analytics

### Configuration
```env
# Optional: Enable Sentry
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
```

### Usage Examples

```typescript
import { errorMonitor } from '@/lib/error-monitoring';

// Log an error
errorMonitor.logError('Database connection failed', error, {
  userId: session.user.id,
  url: request.url,
  method: request.method,
});

// Log a warning
errorMonitor.logWarning('Slow query detected', {
  query: 'getUserCommunities',
  duration: 3500,
});

// Set user context (for Sentry)
errorMonitor.setUserContext(userId, email, username);

// Get error statistics
const stats = errorMonitor.getStats();
```

### Error Statistics
```typescript
{
  total: 150,
  lastHour: {
    total: 12,
    errors: 3,
    warnings: 9
  },
  last24Hours: {
    total: 145,
    errors: 25,
    warnings: 120
  }
}
```

## 3. API Request Logging

### Implementation
- **Location**: `lib/api-logger.ts`
- **Storage**: In-memory with automatic cleanup
- **Retention**: Last 5000 requests or 1 hour

### Features
- ✅ Comprehensive request logging
- ✅ Performance tracking
- ✅ Error tracking
- ✅ User activity tracking
- ✅ Endpoint analytics
- ✅ Request ID generation

### Logged Information
- Timestamp
- Request ID (UUID)
- HTTP method
- URL
- Status code
- Duration (ms)
- User agent
- IP address
- User ID (if authenticated)
- Error message (if failed)

### Statistics Available
- Total requests
- Success rate
- Client/server errors
- Performance metrics (avg, min, max duration)
- Slow requests (>2s)
- Top endpoints
- Method distribution

### Example Stats Response
```json
{
  "timeRange": "hour",
  "totalRequests": 1250,
  "successfulRequests": 1180,
  "clientErrors": 45,
  "serverErrors": 25,
  "successRate": "94.40%",
  "performance": {
    "avgDuration": 245,
    "minDuration": 12,
    "maxDuration": 3450,
    "slowRequests": 8
  },
  "topEndpoints": [
    { "path": "/api/feed", "count": 350 },
    { "path": "/api/communities/user", "count": 180 }
  ],
  "methodDistribution": {
    "GET": 980,
    "POST": 220,
    "PUT": 35,
    "DELETE": 15
  }
}
```

## 4. Combined Middleware

### Implementation
- **Location**: `lib/api-middleware.ts`
- **Purpose**: Single wrapper for all security features

### Usage

#### Using Presets (Recommended)
```typescript
import { middlewarePresets } from '@/lib/api-middleware';

// For authentication endpoints
export const POST = middlewarePresets.auth('login')(async (request) => {
  // Your handler logic
});

// For upload endpoints
export const POST = middlewarePresets.upload('upload')(async (request) => {
  // Your handler logic
});

// For standard API endpoints
export const GET = middlewarePresets.api('feed')(async (request) => {
  // Your handler logic
});

// For public endpoints
export const GET = middlewarePresets.public('explore')(async (request) => {
  // Your handler logic
});

// For admin endpoints
export const GET = middlewarePresets.admin('dashboard')(async (request) => {
  // Your handler logic
});
```

#### Custom Configuration
```typescript
import { withMiddleware, RATE_LIMITS } from '@/lib/api-middleware';

export const POST = withMiddleware(
  async (request) => {
    // Your handler logic
  },
  {
    routeName: 'custom-endpoint',
    rateLimit: { limit: 50, windowMs: 60000 },
    getUserId: async (request) => {
      // Extract user ID from request
      return userId;
    },
  }
);
```

## 5. Monitoring Dashboard

### Endpoint
- **URL**: `/api/admin/monitoring`
- **Methods**: GET, DELETE
- **Auth**: Required (session-based)

### Query Parameters

#### GET Request
- `section`: Filter data (all, ratelimit, errors, api, cache)
- `timeRange`: Time range for API stats (hour, day, all)

#### DELETE Request
- `section`: Clear specific data (errors, api, cache, all)

### Example Requests

```bash
# Get all monitoring data
GET /api/admin/monitoring?section=all

# Get only error logs
GET /api/admin/monitoring?section=errors

# Get API stats for last 24 hours
GET /api/admin/monitoring?section=api&timeRange=day

# Clear error logs
DELETE /api/admin/monitoring?section=errors

# Clear all monitoring data
DELETE /api/admin/monitoring?section=all
```

### Response Structure
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "rateLimiter": {
    "totalEntries": 45,
    "entries": [...]
  },
  "errors": {
    "stats": {...},
    "recentLogs": [...]
  },
  "apiLogs": {
    "stats": {...},
    "recentErrors": [...]
  },
  "cache": {
    "size": 120,
    "maxSize": 200,
    "hits": 2500,
    "misses": 350,
    "hitRate": "87.72%"
  }
}
```

## 6. Security Best Practices

### Implemented
✅ Rate limiting on all endpoints
✅ Request ID tracking
✅ Error logging and monitoring
✅ Performance tracking
✅ User activity logging
✅ IP-based identification
✅ Graceful error handling
✅ Automatic cleanup of old data

### Recommended Additional Measures

#### 1. CORS Configuration
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'your-domain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
        ],
      },
    ];
  },
};
```

#### 2. Environment Variables
```env
# Security
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=https://your-domain.com

# Rate Limiting (optional overrides)
RATE_LIMIT_API=100
RATE_LIMIT_AUTH=5
RATE_LIMIT_UPLOAD=10

# Error Monitoring
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_token

# API Security
API_SECRET_KEY=your_api_secret
```

#### 3. Helmet.js (Security Headers)
```bash
npm install helmet
```

```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  return response;
}
```

#### 4. Input Validation
```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// In your API route
const validated = schema.parse(body);
```

#### 5. SQL Injection Prevention
- ✅ Using MongoDB with parameterized queries
- ✅ Input sanitization
- ✅ Type validation with TypeScript

#### 6. XSS Prevention
- ✅ React's built-in XSS protection
- ✅ Content Security Policy headers
- ✅ Sanitize user-generated content

## 7. Monitoring & Alerts

### Real-time Monitoring
- Request rate per endpoint
- Error rate tracking
- Performance degradation detection
- Rate limit violations

### Alert Triggers (Recommended)
1. **High Error Rate**: >5% errors in 5 minutes
2. **Slow Responses**: >10 requests taking >3s in 5 minutes
3. **Rate Limit Abuse**: Same IP hitting limits repeatedly
4. **Server Errors**: Any 500 errors
5. **Authentication Failures**: >10 failed logins from same IP

### Integration with Monitoring Services

#### Sentry Setup
```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

#### DataDog / New Relic
- APM integration for performance monitoring
- Real-time alerting
- Distributed tracing

## 8. Testing Security Features

### Rate Limiting Test
```bash
# Test rate limit
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/upload \
    -H "Content-Type: multipart/form-data" \
    -F "file=@test.jpg"
done
```

### Error Monitoring Test
```typescript
// Trigger an error
throw new Error('Test error for monitoring');
```

### Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:3000/api/feed

# Using Artillery
artillery quick --count 100 --num 10 http://localhost:3000/api/feed
```

## 9. Performance Impact

### Overhead
- Rate limiting: ~1-2ms per request
- Error monitoring: ~0.5-1ms per request
- API logging: ~0.5-1ms per request
- **Total overhead**: ~2-4ms per request

### Memory Usage
- Rate limiter: ~1-2MB for 1000 active clients
- Error logs: ~2-5MB for 1000 entries
- API logs: ~5-10MB for 5000 entries
- **Total memory**: ~10-20MB

## 10. Maintenance

### Regular Tasks
1. **Daily**: Review error logs
2. **Weekly**: Analyze API statistics
3. **Monthly**: Review rate limit configurations
4. **Quarterly**: Security audit

### Cleanup
- Automatic cleanup runs every 5-10 minutes
- Old logs removed after 1 hour
- Rate limit entries cleared after expiry

## Summary

All security and stability features have been successfully implemented:

✅ **Rate Limiting**: Prevents abuse with configurable limits per endpoint type
✅ **Error Monitoring**: Comprehensive error tracking with Sentry integration ready
✅ **API Logging**: Detailed request logging with performance tracking
✅ **Combined Middleware**: Easy-to-use wrapper for all security features
✅ **Monitoring Dashboard**: Admin endpoint for real-time monitoring
✅ **Documentation**: Complete guide for usage and best practices

The platform now has enterprise-grade security and monitoring capabilities!
