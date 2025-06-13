'use client';

import { useEffect } from 'react';

interface CommunityData {
  name: string;
  description: string;
  handle: string;
  memberCount: number;
  createdAt: string;
  image?: string;
}

interface EventData {
  title: string;
  description: string;
  slug: string;
  startDate: string;
  endDate: string;
  location?: string;
  image?: string;
  organizer: {
    name: string;
    handle: string;
  };
}

interface StructuredDataProps {
  type: 'community' | 'event';
  data: CommunityData | EventData;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    let structuredData;
    
    if (type === 'community') {
      const communityData = data as CommunityData;
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: communityData.name,
        description: communityData.description,
        url: `${baseUrl}/communities/${communityData.handle}`,
        memberCount: communityData.memberCount,
        dateCreated: communityData.createdAt,
        image: communityData.image ? `${baseUrl}${communityData.image}` : undefined,
      };
    } else {
      const eventData = data as EventData;
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: eventData.title,
        description: eventData.description,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        location: eventData.location ? {
          '@type': 'Place',
          name: eventData.location,
        } : undefined,
        image: eventData.image ? `${baseUrl}${eventData.image}` : undefined,
        organizer: {
          '@type': 'Organization',
          name: eventData.organizer.name,
          url: `${baseUrl}/communities/${eventData.organizer.handle}`,
        },
      };
    }

    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [type, data]);

  return null;
} 