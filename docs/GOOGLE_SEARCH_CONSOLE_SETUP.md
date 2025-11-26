# Google Search Console Setup Guide

## 🎯 Overview

Step-by-step guide to set up and verify your site with Google Search Console for better search visibility.

## 📋 Prerequisites

- Access to your domain (gravitas.page)
- Admin access to the website
- Google account

## 🚀 Setup Steps

### Step 1: Add Property to Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add Property"
3. Choose "URL prefix" method
4. Enter: `https://gravitas.page`
5. Click "Continue"

### Step 2: Verify Ownership

#### Method 1: HTML Meta Tag (Recommended)

1. Google will provide a meta tag like:
   ```html
   <meta name="google-site-verification" content="your_verification_code" />
   ```

2. Add the verification code to your `.env.local`:
   ```env
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_verification_code
   ```

3. The code is already integrated in `app/layout.tsx` via the metadata

4. Deploy your changes

5. Go back to Search Console and click "Verify"

#### Method 2: HTML File Upload

1. Download the verification file from Google
2. Place it in `public/` folder
3. Deploy your changes
4. Click "Verify" in Search Console

#### Method 3: DNS Verification

1. Get the TXT record from Google
2. Add it to your domain's DNS settings
3. Wait for DNS propagation (can take up to 48 hours)
4. Click "Verify" in Search Console

### Step 3: Submit Sitemap

1. In Search Console, go to "Sitemaps" in the left menu
2. Enter: `sitemap.xml`
3. Click "Submit"
4. Wait for Google to process (can take a few days)

### Step 4: Request Indexing for Important Pages

1. Go to "URL Inspection" in Search Console
2. Enter your homepage URL: `https://gravitas.page`
3. Click "Request Indexing"
4. Repeat for important pages:
   - `https://gravitas.page/landing`
   - `https://gravitas.page/explore`
   - `https://gravitas.page/communities`
   - `https://gravitas.page/events`

## 📊 Monitoring & Optimization

### Daily Tasks
- Check for crawl errors
- Monitor search performance
- Review new indexed pages

### Weekly Tasks
- Analyze search queries
- Check click-through rates
- Review page performance
- Fix any issues

### Monthly Tasks
- Analyze traffic trends
- Update content strategy
- Build new backlinks
- Optimize underperforming pages

## 🔍 Key Metrics to Monitor

### Performance Report
- **Total Clicks**: Number of clicks from search results
- **Total Impressions**: How many times your site appeared in search
- **Average CTR**: Click-through rate (clicks/impressions)
- **Average Position**: Your average ranking position

### Coverage Report
- **Valid Pages**: Successfully indexed pages
- **Errors**: Pages with indexing errors
- **Warnings**: Pages with potential issues
- **Excluded**: Pages intentionally not indexed

### Enhancements
- **Mobile Usability**: Mobile-friendly issues
- **Core Web Vitals**: Page experience metrics
- **Structured Data**: Schema.org markup validation

## 🛠️ Common Issues & Solutions

### Issue: "URL is not on Google"
**Cause**: Page not yet indexed  
**Solution**: 
1. Request indexing via URL Inspection
2. Ensure page is in sitemap
3. Check robots.txt isn't blocking
4. Add internal links to the page

### Issue: "Crawled - currently not indexed"
**Cause**: Low quality or duplicate content  
**Solution**:
1. Improve content quality
2. Add more unique content
3. Build internal links
4. Ensure proper metadata

### Issue: "Discovered - currently not indexed"
**Cause**: Google found the page but hasn't crawled yet  
**Solution**:
1. Be patient (can take weeks)
2. Request indexing
3. Improve page importance with internal links

### Issue: "Soft 404"
**Cause**: Page returns 200 but has no content  
**Solution**:
1. Add substantial content
2. Return proper 404 status for missing pages
3. Redirect to relevant pages

### Issue: "Mobile usability errors"
**Cause**: Page not mobile-friendly  
**Solution**:
1. Use responsive design
2. Fix viewport issues
3. Ensure text is readable
4. Make buttons touch-friendly

## 📈 Optimization Tips

### 1. Improve Click-Through Rate (CTR)
- Write compelling titles (50-60 characters)
- Create engaging descriptions (150-160 characters)
- Use power words and numbers
- Include target keywords
- Add structured data for rich snippets

### 2. Increase Impressions
- Target more keywords
- Create more content
- Improve rankings
- Build backlinks
- Optimize for featured snippets

### 3. Boost Rankings
- Improve content quality
- Optimize on-page SEO
- Build quality backlinks
- Improve page speed
- Enhance user experience

### 4. Fix Indexing Issues
- Submit sitemap regularly
- Request indexing for new pages
- Fix crawl errors promptly
- Ensure proper robots.txt
- Use canonical URLs

## 🎯 Advanced Features

### URL Parameters
Configure how Google handles URL parameters:
1. Go to "URL Parameters" in Settings
2. Add parameters like `?utm_source`
3. Tell Google to ignore tracking parameters

### International Targeting
If you have multiple language versions:
1. Go to "International Targeting"
2. Set target country
3. Configure hreflang tags

### Change of Address
If you're moving domains:
1. Go to Settings > Change of Address
2. Follow the migration wizard
3. Set up 301 redirects

### Manual Actions
Check for penalties:
1. Go to "Manual Actions"
2. If you have a penalty, follow the instructions
3. Request reconsideration after fixing

## 📱 Mobile-First Indexing

Google now uses mobile version for indexing:

### Best Practices
- Ensure mobile site has same content as desktop
- Use responsive design
- Optimize images for mobile
- Improve mobile page speed
- Test with Mobile-Friendly Test tool

### Testing
1. Use [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
2. Check Search Console mobile usability report
3. Test on real devices
4. Use Chrome DevTools mobile emulation

## 🔐 Security & HTTPS

### HTTPS Migration
If moving from HTTP to HTTPS:
1. Set up 301 redirects from HTTP to HTTPS
2. Update internal links
3. Update sitemap
4. Update canonical URLs
5. Monitor Search Console for issues

### Security Issues
Check for:
- Hacked content
- Malware
- Phishing
- Social engineering

## 📊 Integration with Other Tools

### Google Analytics
1. Link Search Console to Analytics
2. View search data in Analytics
3. Analyze user behavior from organic search

### Google Tag Manager
1. Set up GTM on your site
2. Track events and conversions
3. Monitor user interactions

### Google My Business
1. Create business listing
2. Link to Search Console
3. Monitor local search performance

## 🎓 Learning Resources

### Official Documentation
- [Search Console Help](https://support.google.com/webmasters)
- [SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Search Central Blog](https://developers.google.com/search/blog)

### Video Tutorials
- [Google Search Central YouTube](https://www.youtube.com/c/GoogleSearchCentral)
- [Search Console Training](https://www.youtube.com/playlist?list=PLKoqnv2vTMUOnQn-lNDfT7sPJfN-hLm7V)

### Community
- [Google Search Central Community](https://support.google.com/webmasters/community)
- [r/SEO on Reddit](https://www.reddit.com/r/SEO/)
- [SEO Twitter Community](https://twitter.com/search?q=%23SEO)

## ✅ Verification Checklist

- [ ] Property added to Search Console
- [ ] Ownership verified
- [ ] Sitemap submitted
- [ ] Important pages indexed
- [ ] No crawl errors
- [ ] Mobile usability checked
- [ ] Core Web Vitals passing
- [ ] Structured data validated
- [ ] Analytics linked
- [ ] Regular monitoring set up

## 🚨 Red Flags to Watch For

### Immediate Action Required
- Manual actions/penalties
- Security issues
- Sudden drop in impressions
- High number of crawl errors
- Indexing issues

### Monitor Closely
- Declining CTR
- Dropping rankings
- Increasing bounce rate
- Slow page speed
- Mobile usability issues

## 📞 Getting Help

### Google Support
- [Search Console Help Center](https://support.google.com/webmasters)
- [Community Forum](https://support.google.com/webmasters/community)
- [Twitter @googlesearchc](https://twitter.com/googlesearchc)

### Professional Help
- Hire SEO consultant
- Join SEO communities
- Take online courses
- Read SEO blogs

## 🎯 Success Metrics

### Month 1
- [ ] All pages indexed
- [ ] No critical errors
- [ ] Baseline metrics established

### Month 3
- [ ] 50% increase in impressions
- [ ] Improved average position
- [ ] Higher CTR

### Month 6
- [ ] 100% increase in organic traffic
- [ ] Top 10 rankings for target keywords
- [ ] Strong backlink profile

### Month 12
- [ ] 200%+ increase in organic traffic
- [ ] Multiple #1 rankings
- [ ] Established authority

---

**Last Updated**: November 26, 2025  
**Status**: Ready for Implementation  
**Next**: Verify site and submit sitemap
