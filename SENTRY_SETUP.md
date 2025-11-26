# Sentry Setup Guide

## Overview
Sentry provides real-time error tracking, performance monitoring, and release health for your application.

## Benefits
- 🔍 **Error Tracking**: Catch and fix errors before users report them
- 📊 **Performance Monitoring**: Track slow API calls and page loads
- 👤 **User Context**: See which users are affected by errors
- 📈 **Release Tracking**: Monitor error rates across deployments
- 🔔 **Alerts**: Get notified when errors spike
- 🎯 **Source Maps**: See exact line numbers in your code

## Setup Steps

### Quick Setup (5 minutes)
1. ✅ Create Sentry account → Get DSN
2. ✅ Create auth token → Copy token  
3. ✅ Add to `.env.local` → Done!

### Visual Guide

```
Sentry Dashboard
├── Create Organization (if new)
│   └── Settings → General Settings
│       └── Copy "Organization Slug" (e.g., "my-company")
│
├── Create Project
│   ├── Choose Platform: Next.js
│   ├── Name: gravitas
│   └── After creation:
│       ├── Copy DSN from "Client Keys (DSN)"
│       └── Copy "Project Slug" from Project Settings
│
└── Create Auth Token
    └── Settings → Developer Settings → Auth Tokens
        ├── Click "Create New Token"
        ├── Name: "Gravitas Production"
        ├── Scopes: ✓ project:read, ✓ project:releases, ✓ project:write, ✓ org:read
        └── Copy token (starts with "sntrys_...")
```

### Detailed Steps

### 1. Create a Sentry Account
1. Go to [sentry.io](https://sentry.io)
2. Sign up for a free account (includes 5,000 errors/month)
3. Create an organization (if you don't have one)
   - Organization name: Your company/project name
4. Create a new project
   - Platform: **Next.js**
   - Project name: **gravitas** (or your choice)
   - Alert frequency: Choose your preference

### 2. Get Your DSN and Organization Details
After creating the project, you'll see your DSN (Data Source Name). It looks like:
```
https://abc123def456@o123456.ingest.sentry.io/7890123
```

Also note:
- **Organization Slug**: Found in Settings → General Settings (e.g., "my-company")
- **Project Slug**: Your project name in lowercase with hyphens (e.g., "gravitas")

### 3. Configure Environment Variables
Add these to your `.env.local` file:

```env
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://abc123def456@o123456.ingest.sentry.io/7890123
SENTRY_ORG=my-company
SENTRY_PROJECT=gravitas
SENTRY_AUTH_TOKEN=sntrys_abc123def456...
```

**Where to find each value:**
- `NEXT_PUBLIC_SENTRY_DSN`: Project Settings → Client Keys (DSN)
- `SENTRY_ORG`: Settings → General Settings → Organization Slug
- `SENTRY_PROJECT`: Project Settings → General → Project Slug
- `SENTRY_AUTH_TOKEN`: Settings → Developer Settings → Auth Tokens → Create New Token

**Important Notes:**
- The DSN is public and safe to expose in client-side code
- The auth token is secret - never commit it to git!
- Auth token is only needed for source map uploads (production builds)

**To get your auth token:**
1. Go to Sentry Settings → Developer Settings → Auth Tokens
   - Or directly: Settings → Organization Settings → Developer Settings → Auth Tokens
2. Click "Create New Token"
3. Give it a name (e.g., "Gravitas Production")
4. Select these scopes:
   - `project:read`
   - `project:releases`
   - `project:write` (for source maps)
   - `org:read`
5. Click "Create Token" and copy it immediately (you won't see it again!)

### 4. Test the Integration

#### Test Client-Side Error
Add this to any page temporarily:
```typescript
<button onClick={() => {
  throw new Error('Test Sentry Error');
}}>
  Test Sentry
</button>
```

#### Test Server-Side Error
Add this to any API route temporarily:
```typescript
export async function GET() {
  throw new Error('Test Server Error');
}
```

### 5. Verify in Sentry Dashboard
1. Go to your Sentry project dashboard
2. Click on "Issues"
3. You should see your test errors appear within seconds

## Features Already Configured

### ✅ Client-Side Monitoring
- Error tracking with stack traces
- Session replay (10% sample rate)
- User context tracking
- Performance monitoring

### ✅ Server-Side Monitoring
- API error tracking
- Database error tracking
- Performance monitoring
- Request context

### ✅ Edge Runtime Monitoring
- Middleware error tracking
- Edge function monitoring

### ✅ Error Filtering
Automatically ignores:
- Browser extension errors
- Next.js hydration errors (client)
- MongoDB connection errors (server)
- Dynamic server errors during build

### ✅ Integration with Error Monitor
Our custom error monitoring system (`lib/error-monitoring.ts`) automatically sends errors to Sentry when configured.

## Usage in Code

### Manual Error Tracking
```typescript
import * as Sentry from '@sentry/nextjs';

try {
  // Your code
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'payment',
    },
    extra: {
      userId: user.id,
      amount: 100,
    },
  });
}
```

### Set User Context
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});
```

### Add Breadcrumbs
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.addBreadcrumb({
  category: 'auth',
  message: 'User logged in',
  level: 'info',
});
```

### Using Error Monitor (Recommended)
```typescript
import { errorMonitor } from '@/lib/error-monitoring';

// Automatically sends to Sentry if configured
errorMonitor.logError('Payment failed', error, {
  userId: user.id,
  amount: 100,
});
```

## Performance Monitoring

### Track Custom Transactions
```typescript
import * as Sentry from '@sentry/nextjs';

const transaction = Sentry.startTransaction({
  name: 'Process Payment',
  op: 'payment',
});

try {
  // Your code
  await processPayment();
} finally {
  transaction.finish();
}
```

### Already Tracked
- API response times
- Database query times
- Page load times
- Component render times

## Alerts & Notifications

### Recommended Alerts
1. **Error Rate Alert**
   - Condition: Error rate > 5% in 5 minutes
   - Action: Email + Slack notification

2. **New Issue Alert**
   - Condition: New error type appears
   - Action: Email notification

3. **Performance Alert**
   - Condition: P95 response time > 3s
   - Action: Email notification

### Setup Alerts
1. Go to Sentry → Alerts → Create Alert Rule
2. Choose your conditions
3. Add notification channels (email, Slack, etc.)

## Release Tracking

### Automatic Release Creation
When you deploy, Sentry will automatically create a release and track:
- New errors introduced
- Resolved errors
- Affected users
- Performance changes

### Manual Release Creation
```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Create a release
sentry-cli releases new "v1.0.0"
sentry-cli releases set-commits "v1.0.0" --auto
sentry-cli releases finalize "v1.0.0"
```

## Source Maps

Source maps are automatically uploaded during build (in production) so you can see the exact line of code that caused an error.

### Verify Source Maps
1. Trigger an error in production
2. Check the error in Sentry
3. You should see your original TypeScript/JSX code, not minified JavaScript

## Best Practices

### 1. Use Error Boundaries
```typescript
import * as Sentry from '@sentry/nextjs';
import { ErrorBoundary } from '@sentry/nextjs';

<ErrorBoundary
  fallback={<ErrorFallback />}
  showDialog
>
  <YourComponent />
</ErrorBoundary>
```

### 2. Add Context to Errors
```typescript
errorMonitor.logError('Failed to load user', error, {
  userId: userId,
  endpoint: '/api/user/profile',
  timestamp: new Date().toISOString(),
});
```

### 3. Set User Context on Login
```typescript
// In your login handler
if (session?.user) {
  errorMonitor.setUserContext(
    session.user.id,
    session.user.email,
    session.user.name
  );
}
```

### 4. Clear User Context on Logout
```typescript
// In your logout handler
errorMonitor.clearUserContext();
```

### 5. Monitor Performance
```typescript
import { trackAPIPerformance } from '@/lib/error-monitoring';

const startTime = Date.now();
const response = await fetch('/api/data');
const duration = Date.now() - startTime;

trackAPIPerformance('/api/data', duration, response.status);
```

## Monitoring Dashboard

### View Sentry Data in Your App
Access the monitoring dashboard at:
```
GET /api/admin/monitoring?section=errors
```

This shows:
- Recent errors
- Error statistics
- Integration with local error logs

## Cost Optimization

### Free Tier Limits
- 5,000 errors/month
- 10,000 performance units/month
- 50 replays/month

### Tips to Stay Within Limits
1. **Sample Rates**: Already configured
   - Session replay: 10%
   - Performance: 100% (adjust in production)

2. **Filter Noise**: Already configured to ignore:
   - Browser extension errors
   - Network errors
   - Hydration errors

3. **Rate Limiting**: Use `beforeSend` to limit similar errors

## Troubleshooting

### Errors Not Appearing
1. Check DSN is correct in `.env.local`
2. Verify environment variables are loaded
3. Check browser console for Sentry initialization
4. Ensure you're not in development mode (errors are logged but not sent)

### Source Maps Not Working
1. **Verify auth token is set correctly**
   ```bash
   # Check if token is set (should show sntrys_...)
   echo $SENTRY_AUTH_TOKEN
   ```

2. **Check token permissions**
   - Go to Sentry → Settings → Developer Settings → Auth Tokens
   - Verify your token has these scopes:
     - `project:read`
     - `project:releases`
     - `project:write`
     - `org:read`

3. **Verify organization and project names**
   ```bash
   # These should match exactly (case-sensitive)
   echo $SENTRY_ORG      # Should match Organization Slug
   echo $SENTRY_PROJECT  # Should match Project Slug
   ```

4. **Check build logs for upload errors**
   - Look for "Sentry" in build output
   - Should see "Source maps uploaded successfully"

5. **Common issues:**
   - Token expired: Create a new one
   - Wrong organization: Check organization slug
   - Wrong project: Check project slug
   - Token missing scopes: Recreate with correct scopes

### Too Many Errors
1. Review ignored errors in config
2. Add more filters in `beforeSend`
3. Increase sample rates
4. Fix the actual errors! 😄

## Integration with Existing Features

### Works With
- ✅ Rate Limiter: Errors are tracked with rate limit context
- ✅ API Logger: Performance data is sent to Sentry
- ✅ Error Monitor: Automatically sends to Sentry
- ✅ Middleware: All API errors are tracked

### Monitoring Endpoints
- `/api/admin/monitoring` - View all monitoring data
- `/api/cache/stats` - Cache performance
- All API routes have automatic error tracking

## Production Checklist

Before deploying to production:

- [ ] Set `NEXT_PUBLIC_SENTRY_DSN` in production environment
- [ ] Set `SENTRY_AUTH_TOKEN` for source map uploads
- [ ] Configure alerts in Sentry dashboard
- [ ] Set up Slack/email notifications
- [ ] Test error tracking in staging
- [ ] Verify source maps are uploaded
- [ ] Set appropriate sample rates
- [ ] Configure release tracking
- [ ] Add team members to Sentry project
- [ ] Set up on-call rotation for alerts

## Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry Alerts](https://docs.sentry.io/product/alerts/)
- [Sentry Releases](https://docs.sentry.io/product/releases/)

## Support

If you encounter issues:
1. Check Sentry documentation
2. Review error logs in `/api/admin/monitoring`
3. Contact Sentry support (support@sentry.io)
4. Check GitHub issues: https://github.com/getsentry/sentry-javascript

---

**Note**: Sentry is optional but highly recommended for production. The application will work fine without it, using local error logging instead.
