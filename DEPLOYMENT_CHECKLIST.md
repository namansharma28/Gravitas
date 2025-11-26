# Deployment Checklist

## Pre-Deployment

### Environment Setup
- [ ] Set all required environment variables
- [ ] Configure MongoDB connection string
- [ ] Set up Cloudinary credentials
- [ ] Configure SMTP settings
- [ ] Set NextAuth secret and URL
- [ ] Configure Sentry DSN (optional but recommended)

### Database Setup
- [ ] Create MongoDB database
- [ ] **Run database indexes**: `node scripts/create-indexes.js`
- [ ] Verify indexes: `node scripts/create-indexes.js verify`
- [ ] Create admin user (if needed)

### Code Quality
- [ ] Run linter: `npm run lint`
- [ ] Fix any linting errors
- [ ] Run type check: `npm run build` (checks types)
- [ ] Review console.log statements (should be replaced with logger)

### Security
- [ ] Review rate limiting configuration
- [ ] Check API middleware is applied to all routes
- [ ] Verify authentication is required for protected routes
- [ ] Review CORS settings
- [ ] Check for exposed secrets in code

### Performance
- [ ] Verify caching is enabled
- [ ] Check image optimization settings
- [ ] Review API response times
- [ ] Test with production-like data volume

## Deployment

### Build
- [ ] Run production build: `npm run build`
- [ ] Verify build completes without errors
- [ ] Check bundle size
- [ ] Verify source maps are generated (for Sentry)

### Environment-Specific

#### Staging
- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Verify all features work
- [ ] Check error monitoring
- [ ] Review performance metrics

#### Production
- [ ] Schedule deployment during low-traffic period
- [ ] Backup production database
- [ ] Deploy application
- [ ] Run database indexes (if not done)
- [ ] Verify deployment successful
- [ ] Check health endpoints

## Post-Deployment

### Verification
- [ ] Test user registration and login
- [ ] Test community creation
- [ ] Test event creation
- [ ] Test RSVP functionality
- [ ] Test form submissions
- [ ] Test image uploads
- [ ] Test notifications

### Monitoring
- [ ] Verify Sentry is receiving errors
- [ ] Check API response times
- [ ] Monitor cache hit rates
- [ ] Review rate limit violations
- [ ] Check database query performance
- [ ] Monitor memory usage

### Documentation
- [ ] Update deployment documentation
- [ ] Document any issues encountered
- [ ] Update changelog
- [ ] Notify team of deployment

## Rollback Plan

If issues are encountered:

1. **Immediate Issues**
   - [ ] Revert to previous deployment
   - [ ] Restore database backup (if needed)
   - [ ] Notify team

2. **Post-Rollback**
   - [ ] Document issues
   - [ ] Fix issues in development
   - [ ] Test thoroughly
   - [ ] Schedule new deployment

## Performance Checklist

### Database
- [ ] Indexes created and verified
- [ ] Slow query log enabled
- [ ] Connection pooling configured
- [ ] Backup strategy in place

### Caching
- [ ] Cache hit rate > 70%
- [ ] Cache TTLs configured appropriately
- [ ] Cache invalidation working

### API
- [ ] Rate limiting active
- [ ] Response times < 500ms (P95)
- [ ] Error rate < 1%
- [ ] Monitoring enabled

### Images
- [ ] Compression enabled
- [ ] WebP format used
- [ ] Responsive breakpoints generated
- [ ] CDN configured (if applicable)

## Security Checklist

### Authentication
- [ ] NextAuth configured correctly
- [ ] Session management working
- [ ] Password hashing enabled
- [ ] OTP verification working

### Authorization
- [ ] Protected routes require authentication
- [ ] Admin routes require admin role
- [ ] User permissions checked

### Data Protection
- [ ] Sensitive data encrypted
- [ ] No secrets in code
- [ ] Environment variables secured
- [ ] HTTPS enforced

### Rate Limiting
- [ ] Auth endpoints: 5 req/15min
- [ ] Upload endpoints: 10 req/min
- [ ] API endpoints: 100 req/min
- [ ] Rate limit headers present

## Monitoring Checklist

### Error Monitoring
- [ ] Sentry configured
- [ ] Error alerts set up
- [ ] Error rate monitored
- [ ] Source maps uploaded

### Performance Monitoring
- [ ] API response times tracked
- [ ] Database query times tracked
- [ ] Cache performance monitored
- [ ] Memory usage monitored

### Logging
- [ ] Structured logging enabled
- [ ] Log levels configured
- [ ] Important events logged
- [ ] No console.log in production

## Maintenance

### Daily
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Review rate limit violations

### Weekly
- [ ] Review slow query log
- [ ] Check cache hit rates
- [ ] Review API statistics
- [ ] Check for security updates

### Monthly
- [ ] Database backup verification
- [ ] Performance optimization review
- [ ] Security audit
- [ ] Dependency updates

## Emergency Contacts

- **Technical Lead**: [Name/Contact]
- **DevOps**: [Name/Contact]
- **Database Admin**: [Name/Contact]
- **On-Call**: [Name/Contact]

## Useful Commands

```bash
# Build
npm run build

# Start production server
npm start

# Create database indexes
node scripts/create-indexes.js

# Verify indexes
node scripts/create-indexes.js verify

# Check diagnostics
npm run lint

# View logs (if using PM2)
pm2 logs

# Restart application (if using PM2)
pm2 restart all
```

## Environment Variables Reference

```env
# Required
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

# Optional but Recommended
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

---

**Last Updated**: January 2024  
**Version**: 1.0
