import { MetadataRoute } from 'next';
import clientPromise from '@/lib/mongodb';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  // Base routes that don't require dynamic data
  const routes = [
    '',
    '/auth/signin',
    '/auth/signup',
    '/explore',
    '/about',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    const client = await clientPromise;
    const db = client.db('gravitas');

    // Get all public communities
    const communities = await db.collection('communities')
      .find({ isPrivate: false })
      .project({ handle: 1, updatedAt: 1 })
      .toArray();

    // Get all public events
    const events = await db.collection('events')
      .find({ isPrivate: false })
      .project({ slug: 1, updatedAt: 1 })
      .toArray();

    // Add community routes
    const communityRoutes = communities.map((community) => ({
      url: `${baseUrl}/communities/${community.handle}`,
      lastModified: community.updatedAt || new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    // Add event routes
    const eventRoutes = events.map((event) => ({
      url: `${baseUrl}/events/${event.slug}`,
      lastModified: event.updatedAt || new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    return [...routes, ...communityRoutes, ...eventRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return routes;
  }
} 