# SEO Quick Start Guide

## 🚀 Get Your Site Visible in Google in 30 Minutes

### Step 1: Add Google Verification (5 min)

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add Property" → Enter `https://gravitas.page`
3. Copy the verification code from the meta tag
4. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_code_here
   ```
5. Deploy your site
6. Click "Verify" in Search Console

### Step 2: Submit Sitemap (5 min)

1. In Search Console, go to "Sitemaps"
2. Enter: `sitemap.xml`
3. Click "Submit"
4. Wait for processing (can take a few days)

### Step 3: Request Indexing (10 min)

1. Go to "URL Inspection" in Search Console
2. Enter these URLs one by one and click "Request Indexing":
   - `https://gravitas.page`
   - `https://gravitas.page/landing`
   - `https://gravitas.page/explore`
   - `https://gravitas.page/communities`
   - `https://gravitas.page/events`

### Step 4: Submit to Bing (10 min)

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add your site
3. Import from Google Search Console (easiest)
4. Or verify manually and submit sitemap

## ✅ What's Already Done

- ✅ Dynamic sitemap generation
- ✅ Robots.txt configuration
- ✅ Meta tags and descriptions
- ✅ Open Graph tags for social sharing
- ✅ Twitter Card tags
- ✅ Structured data (Schema.org)
- ✅ Mobile-friendly design
- ✅ Fast loading times
- ✅ HTTPS enabled
- ✅ PWA support

## 📊 Test Your SEO

Run the audit script:
```bash
npm run seo:audit
```

Check your sitemap:
```bash
curl https://gravitas.page/sitemap.xml
```

Test with Google tools:
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [PageSpeed Insights](https://pagespeed.web.dev/)

## 📈 What to Expect

### Week 1
- Pages start getting indexed
- Appear in search results
- Can see data in Search Console

### Month 1
- 100+ impressions per day
- Some clicks from search
- Rankings improve

### Month 3
- 500+ impressions per day
- 50+ clicks per day
- Top 30 for some keywords

### Month 6+
- 2000+ impressions per day
- 200+ clicks per day
- Top 10 rankings
- Growing organic traffic

## 💡 Quick Wins

1. **Add Alt Text to Images** - Helps with image search
2. **Internal Linking** - Link related pages together
3. **Update Content** - Fresh content ranks better
4. **Page Speed** - Faster = better rankings
5. **Mobile-Friendly** - Most searches are mobile

## 📚 Full Documentation

- [SEO Implementation Guide](./docs/SEO_IMPLEMENTATION_GUIDE.md)
- [Google Search Console Setup](./docs/GOOGLE_SEARCH_CONSOLE_SETUP.md)
- [SEO Summary](./docs/SEO_SUMMARY.md)

## 🆘 Need Help?

1. Check the documentation
2. Run `npm run seo:audit`
3. Test with Google tools
4. Check Search Console for errors
5. Review the guides in `/docs`

---

**Start Now**: Add Google verification and submit your sitemap!
