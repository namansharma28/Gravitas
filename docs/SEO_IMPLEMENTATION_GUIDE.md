# SEO Implementation Guide for Gravitas

## 🎯 Overview

Comprehensive SEO implementation to improve search engine visibility and rankings for Gravitas.

## ✅ Implemented Features

### 1. Dynamic Sitemap (`app/sitemap.ts`)
- Automatically generated XML sitemap
- Includes all static pages
- Ready for dynamic content (communities, events)
- Proper priority and change frequency settings

### 2. Robots.txt (`app/robots.ts`)
- Proper crawling rules for search engines
- Blocks sensitive pages (auth, settings, admin)
- Allows public pages
- Links to sitemap

### 3. Structured Data (Schema.org)
- Organization schema
- WebSite schema with search action
- WebApplication schema
- Event schema helper
- Community schema helper
- Article schema helper
- Breadcrumb schema helper

### 4. Enhanced Metadata
- Title templates for consistent branding
- Comprehensive descriptions
- Extended keywords list
- Open Graph tags for social sharing
- Twitter Card tags
- Canonical URLs
- Site verification tags

### 5. SEO Utilities (`lib/seo.ts`)
- `generateMetadata()` - Create page-specific metadata
- `generateOrganizationSchema()` - Organization structured data
- `generateWebsiteSchema()` - Website structured data
- `generateEventSchema()` - Event structured data
- `generateCommunitySchema()` - Community structured data
- `generateArticleSchema()` - Article structured data
- `generateBreadcrumbSchema()` - Breadcrumb navigation

## 🚀 Quick Setup

### 1. Add Google Site Verification

Add to `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_verification_code
```

Get your verification code from [Google Search Console](https://search.google.com/search-console).

### 2. Submit Sitemap to Google

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property
3. Go to Sitemaps
4. Submit: `https://gravitas.page/sitemap.xml`

### 3. Submit to Bing Webmaster Tools

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add your site
3. Submit sitemap: `https://gravitas.page/sitemap.xml`

### 4. Test Your Implementation

```bash
# Build the site
npm run build

# Test locally
npm start

# Check sitemap
curl https://gravitas.page/sitemap.xml

# Check robots.txt
curl https://gravitas.page/robots.txt
```

## 📝 Usage Examples

### Page-Specific SEO

```typescript
// app/communities/[handle]/page.tsx
import { generateMetadata as generateMeta } from '@/lib/seo';
import { generateCommunitySchema } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const community = await getCommunity(params.handle);
  
  return generateMeta({
    title: community.name,
    description: community.description,
    image: community.image,
    url: `https://gravitas.page/communities/${community.handle}`,
    keywords: ['community', community.category, ...community.tags],
  });
}

export default function CommunityPage({ params }) {
  const community = await getCommunity(params.handle);
  
  const schema = generateCommunitySchema({
    name: community.name,
    description: community.description,
    url: `https://gravitas.page/communities/${community.handle}`,
    image: community.image,
    memberCount: community.memberCount,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* Your component JSX */}
    </>
  );
}
```

### Event SEO

```typescript
// app/events/[slug]/page.tsx
import { generateMetadata as generateMeta } from '@/lib/seo';
import { generateEventSchema } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const event = await getEvent(params.slug);
  
  return generateMeta({
    title: event.title,
    description: event.description,
    image: event.image,
    url: `https://gravitas.page/events/${event.slug}`,
    type: 'article',
    publishedTime: event.createdAt,
    modifiedTime: event.updatedAt,
  });
}

export default function EventPage({ params }) {
  const event = await getEvent(params.slug);
  
  const schema = generateEventSchema({
    name: event.title,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    location: event.location,
    image: event.image,
    url: `https://gravitas.page/events/${event.slug}`,
    organizer: event.organizer,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* Your component JSX */}
    </>
  );
}
```

### Breadcrumbs

```typescript
import { generateBreadcrumbSchema } from '@/lib/seo';

const breadcrumbs = generateBreadcrumbSchema([
  { name: 'Home', url: 'https://gravitas.page' },
  { name: 'Communities', url: 'https://gravitas.page/communities' },
  { name: 'Tech Community', url: 'https://gravitas.page/communities/tech' },
]);
```

## 🔍 SEO Checklist

### Technical SEO
- [x] Dynamic sitemap generation
- [x] Robots.txt configuration
- [x] Canonical URLs
- [x] Meta tags (title, description, keywords)
- [x] Open Graph tags
- [x] Twitter Card tags
- [x] Structured data (Schema.org)
- [x] Mobile-friendly (responsive design)
- [x] HTTPS enabled
- [x] Fast loading times (Next.js optimization)
- [ ] XML sitemap submitted to search engines
- [ ] Google Search Console verification
- [ ] Bing Webmaster Tools verification

### On-Page SEO
- [x] Descriptive page titles
- [x] Meta descriptions
- [x] Header tags (H1, H2, H3)
- [x] Alt text for images
- [x] Internal linking
- [ ] Content optimization
- [ ] Keyword research
- [ ] Long-form content

### Content SEO
- [ ] Blog/articles section
- [ ] Regular content updates
- [ ] User-generated content (reviews, comments)
- [ ] FAQ pages
- [ ] How-to guides
- [ ] Case studies

### Local SEO (if applicable)
- [ ] Google My Business listing
- [ ] Local keywords
- [ ] Location pages
- [ ] Local structured data

### Off-Page SEO
- [ ] Backlink building
- [ ] Social media presence
- [ ] Guest posting
- [ ] Directory submissions
- [ ] Press releases

## 📊 Monitoring & Analytics

### Google Search Console
1. Monitor search performance
2. Check indexing status
3. Fix crawl errors
4. Submit sitemaps
5. Request indexing for new pages

### Google Analytics
1. Track organic traffic
2. Monitor bounce rate
3. Analyze user behavior
4. Track conversions
5. Set up goals

### Tools to Use
- [Google Search Console](https://search.google.com/search-console)
- [Google Analytics](https://analytics.google.com)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Ahrefs](https://ahrefs.com) (paid)
- [SEMrush](https://www.semrush.com) (paid)
- [Moz](https://moz.com) (paid)

## 🎯 Optimization Tips

### 1. Page Speed
- Use Next.js Image optimization
- Enable compression
- Minimize JavaScript
- Use CDN for static assets
- Implement lazy loading

### 2. Mobile Optimization
- Responsive design
- Touch-friendly buttons
- Fast mobile loading
- Mobile-first indexing

### 3. Content Quality
- Original, valuable content
- Regular updates
- Proper formatting
- Multimedia content
- User engagement

### 4. Technical Improvements
- Fix broken links
- Reduce redirects
- Optimize images
- Use semantic HTML
- Implement breadcrumbs

### 5. User Experience
- Clear navigation
- Fast loading times
- Mobile-friendly
- Accessible design
- Engaging content

## 🔧 Advanced Features

### Dynamic Sitemap with Database

Update `app/sitemap.ts`:

```typescript
import { getCommunities, getEvents } from '@/lib/db';

export default async function sitemap() {
  const baseUrl = 'https://gravitas.page';
  
  // Fetch from database
  const communities = await getCommunities();
  const events = await getEvents();
  
  const communityUrls = communities.map(c => ({
    url: `${baseUrl}/communities/${c.handle}`,
    lastModified: c.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));
  
  const eventUrls = events.map(e => ({
    url: `${baseUrl}/events/${e.slug}`,
    lastModified: e.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));
  
  return [...staticPages, ...communityUrls, ...eventUrls];
}
```

### Image Sitemap

Create `app/sitemap-images.xml/route.ts`:

```typescript
export async function GET() {
  const images = await getImages();
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
      ${images.map(img => `
        <url>
          <loc>${img.pageUrl}</loc>
          <image:image>
            <image:loc>${img.url}</image:loc>
            <image:title>${img.title}</image:title>
          </image:image>
        </url>
      `).join('')}
    </urlset>`;
  
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
```

## 📈 Expected Results

### Short Term (1-3 months)
- Improved indexing
- Better search console data
- Increased organic impressions
- Better click-through rates

### Medium Term (3-6 months)
- Higher search rankings
- Increased organic traffic
- More backlinks
- Better domain authority

### Long Term (6-12 months)
- Top rankings for target keywords
- Significant organic traffic growth
- Strong brand presence
- High conversion rates

## 🚨 Common Issues & Solutions

### Issue: Pages not indexed
**Solution**: Submit sitemap, check robots.txt, request indexing in Search Console

### Issue: Low rankings
**Solution**: Improve content quality, build backlinks, optimize on-page SEO

### Issue: High bounce rate
**Solution**: Improve page speed, enhance content, better UX

### Issue: Duplicate content
**Solution**: Use canonical URLs, consolidate similar pages

### Issue: Slow loading
**Solution**: Optimize images, enable caching, use CDN

## 📚 Resources

- [Google SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Next.js SEO](https://nextjs.org/learn/seo/introduction-to-seo)
- [Schema.org Documentation](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)
- [Moz Beginner's Guide to SEO](https://moz.com/beginners-guide-to-seo)

## 🎯 Next Steps

1. **Immediate Actions**
   - [ ] Add Google Search Console verification
   - [ ] Submit sitemap to Google
   - [ ] Submit sitemap to Bing
   - [ ] Set up Google Analytics

2. **Week 1**
   - [ ] Implement page-specific metadata
   - [ ] Add structured data to all pages
   - [ ] Optimize images with alt text
   - [ ] Create content calendar

3. **Month 1**
   - [ ] Create blog section
   - [ ] Write 10+ SEO-optimized articles
   - [ ] Build internal linking structure
   - [ ] Start backlink building

4. **Ongoing**
   - [ ] Monitor search console weekly
   - [ ] Update content regularly
   - [ ] Build quality backlinks
   - [ ] Analyze and optimize

---

**Last Updated**: November 26, 2025  
**Status**: ✅ Core Implementation Complete  
**Next**: Submit to search engines and monitor results
