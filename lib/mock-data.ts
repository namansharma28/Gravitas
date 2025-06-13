// This file is now deprecated as we're using real data from the database
// Keeping it for reference but all components should now use API endpoints

import { FeedItem } from "@/types/feed";

export const mockFeedItems: FeedItem[] = [
  {
    id: '1',
    type: 'event',
    title: 'Community Meetup',
    content: 'Join us for our monthly community meetup! We\'ll be discussing the latest trends in technology and networking with fellow enthusiasts.',
    date: '2024-03-15T18:00:00Z',
    eventDate: 'March 15, 2024',
    community: {
      name: 'Tech Enthusiasts',
      handle: 'tech-enthusiasts',
      avatar: 'https://github.com/shadcn.png'
    },
    likes: 15,
    comments: 5,
    image: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg',
    tags: ['technology', 'networking', 'community']
  },
  {
    id: '2',
    type: 'update',
    title: 'New Feature Released',
    content: 'We\'ve just released a new feature for event management! Now you can create recurring events and manage multiple time zones.',
    date: '2024-03-14T10:00:00Z',
    community: {
      name: 'Eventify Team',
      handle: 'eventify-team',
      avatar: 'https://github.com/shadcn.png'
    },
    likes: 25,
    comments: 8,
    tags: ['announcement', 'features', 'updates']
  }
];

export const mockUpcomingEvents = [];
export const mockTrendingCommunities = [];