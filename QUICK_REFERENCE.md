# Quick Reference Guide

## 🚀 Getting Started

### Environment Setup
```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Build for production
npm run build
npm start
```

### Required Environment Variables
```env
MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Optional (Recommended for Production)
```env
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
SENTRY_AUTH_TOKEN=your_token
```

## 📝 Common Tasks

### Add Middleware to API Route
```typescript
import { middlewarePresets } from '@/lib/api-middleware';

// Choose preset based on endpoint type
export const POST = middlewarePresets.auth('route-name')(handler);
// or: .upload(), .api(), .public(), .admin()
```

### Log an Error
```typescript
import { errorMonitor } from '@/lib/error-monitoring';

errorMonitor.logError('Error message', error, {
  userId: user.id,
  context: 'additional info',
});
```

### Use Cache
```typescript
import { apiCache, CACHE_TTL, generateCacheKey } from '@/lib/cache';

const key = generateCacheKey('prefix', { param: value });
const cached = apiCache.get(key);
if (!cached) {
  const data = await fetchData();
  apiCache.set(key, data, CACHE_TTL.MEDIUM);
}
```

### Track Performance
```typescript
import { trackDBQuery } from '@/lib/performance';

const result = await trackDBQuery('query-name', async () => {
  return db.collection('items').find({}).toArray();
});
```

## 🔍 Monitoring Endpoints

### View All Monitoring Data
```bash
GET /api/admin/monitoring?section=all
```

### View Specific Sections
```bash
GET /api/admin/monitoring?section=errors
GET /api/admin/monitoring?section=api&timeRange=day
GET /api/admin/monitoring?section=cache
GET /api/admin/monitoring?section=ratelimit
```

### Cache Statistics
```bash
GET /api/cache/stats
```

### Clear Data
```bash
DELETE /api/admin/monitoring?section=errors
DELETE /api/cache/stats
```

## ⚙️ Rate Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| AUTH | 5 | 15 min |
| UPLOAD | 10 | 1 min |
| API | 100 | 1 min |
| PUBLIC | 200 | 1 min |
| ADMIN | 50 | 1 min |

## 📊 Cache TTLs

| Type | Duration |
|------|----------|
| SHORT | 30 seconds |
| MEDIUM | 5 minutes |
| LONG | 30 minutes |
| VERY_LONG | 1 hour |

## 🎯 Performance Targets

| Metric | Target |
|--------|--------|
| API Response Time (P95) | < 500ms |
| Image Upload Time | < 2s |
| Cache Hit Rate | > 70% |
| Error Rate | < 1% |
| Slow Queries | < 5% |

## 🔒 Security Headers

Already configured in responses:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
- `X-Request-ID`
- `X-Cache`
- `X-Response-Time`

## 📚 Documentation Files

- `PERFORMANCE_IMPLEMENTATION.md` - Performance guide
- `SECURITY_IMPLEMENTATION.md` - Security guide
- `SENTRY_SETUP.md` - Sentry setup
- `IMPLEMENTATION_SUMMARY.md` - Complete summary
- `QUICK_REFERENCE.md` - This file

## 🆘 Troubleshooting

### Rate Limit Errors (429)
```typescript
// Check rate limit headers in response
X-RateLimit-Remaining: 0
Retry-After: 45
```

### Cache Not Working
```typescript
// Check cache stats
const stats = apiCache.getStats();
console.log('Hit rate:', stats.hitRate);
```

### Sentry Not Receiving Errors
```bash
# Verify DSN is set
echo $NEXT_PUBLIC_SENTRY_DSN

# Check Sentry initialization in browser console
# Should see: "Sentry initialized"
```

### Slow API Responses
```typescript
// Check monitoring dashboard
GET /api/admin/monitoring?section=api&timeRange=hour

// Look for slow requests (>2s)
```

## 🎨 Middleware Presets

```typescript
// Authentication endpoints (5 req/15min)
middlewarePresets.auth('login')

// Upload endpoints (10 req/min)
middlewarePresets.upload('upload')

// Standard API (100 req/min)
middlewarePresets.api('feed')

// Public endpoints (200 req/min)
middlewarePresets.public('explore')

// Admin endpoints (50 req/min)
middlewarePresets.admin('dashboard')

// No rate limiting
middlewarePresets.noRateLimit('internal')
```

## 🔧 Custom Configuration

```typescript
import { withMiddleware, RATE_LIMITS } from '@/lib/api-middleware';

export const POST = withMiddleware(
  async (request) => {
    // Handler logic
  },
  {
    routeName: 'custom-endpoint',
    rateLimit: { limit: 50, windowMs: 60000 },
    skipRateLimit: false,
    skipLogging: false,
    getUserId: async (request) => {
      // Extract user ID
      return userId;
    },
  }
);
```

## 📈 Monitoring Dashboard Response

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "rateLimiter": {
    "totalEntries": 45,
    "entries": [...]
  },
  "errors": {
    "stats": {
      "total": 150,
      "lastHour": { "total": 12, "errors": 3, "warnings": 9 }
    },
    "recentLogs": [...]
  },
  "apiLogs": {
    "stats": {
      "totalRequests": 1250,
      "successRate": "94.40%",
      "performance": {
        "avgDuration": 245,
        "slowRequests": 8
      }
    }
  },
  "cache": {
    "size": 120,
    "hitRate": "87.72%"
  }
}
```

## 🎯 Production Checklist

- [ ] Set environment variables
- [ ] Configure Sentry
- [ ] Test rate limiting
- [ ] Verify image compression
- [ ] Check cache performance
- [ ] Review error logs
- [ ] Set up alerts
- [ ] Test API performance
- [ ] Verify source maps
- [ ] Monitor memory usage

## 💡 Tips

1. **Use middleware presets** - They handle everything automatically
2. **Monitor cache hit rate** - Should be >70% for good performance
3. **Check error logs daily** - Catch issues early
4. **Set up Sentry alerts** - Get notified of problems
5. **Review API stats weekly** - Identify slow endpoints
6. **Test rate limits** - Ensure they're not too strict
7. **Keep documentation updated** - Help future developers

## 🔗 Useful Links

- Sentry Dashboard: https://sentry.io
- Next.js Docs: https://nextjs.org/docs
- MongoDB Docs: https://docs.mongodb.com
- Cloudinary Docs: https://cloudinary.com/documentation

---

**Need more details?** Check the full documentation files listed above.
