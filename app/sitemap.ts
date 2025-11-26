import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://gravitas.page';
  const currentDate = new Date().toISOString();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/landing`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/communities`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/signin`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // TODO: Add dynamic pages from database
  // Fetch communities and events from your database
  // const communities = await fetchCommunities();
  // const events = await fetchEvents();
  
  // const dynamicPages = [
  //   ...communities.map(community => ({
  //     url: `${baseUrl}/communities/${community.handle}`,
  //     lastModified: community.updatedAt,
  //     changeFrequency: 'weekly' as const,
  //     priority: 0.7,
  //   })),
  //   ...events.map(event => ({
  //     url: `${baseUrl}/events/${event.slug}`,
  //     lastModified: event.updatedAt,
  //     changeFrequency: 'weekly' as const,
  //     priority: 0.7,
  //   })),
  // ];

  return staticPages;
}
