import { FeedItem } from "@/types/feed";
import { Community } from "@/types/community";
import { Event } from "@/types/event";

// Mock Data for Feed
export const mockFeedItems: FeedItem[] = [
  {
    id: "1",
    type: "event",
    title: "Web Development Workshop",
    content: "Join us for an interactive session on modern web development practices with industry experts.",
    community: {
      name: "TechTalks",
      handle: "tech-talks",
      avatar: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    date: "2025-04-15T14:00:00",
    eventDate: "Apr 20, 2025 • 2:00 PM",
    likes: 24,
    comments: 8,
    image: "https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    tags: ["webdev", "workshop", "coding"]
  },
  {
    id: "2",
    type: "update",
    title: "Event Location Changed",
    content: "Due to overwhelming response, we've moved our annual exhibition to the Downtown Convention Center. More space, better parking!",
    community: {
      name: "ArtCollective",
      handle: "art-collective",
      avatar: "https://images.pexels.com/photos/3094799/pexels-photo-3094799.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    date: "2025-04-14T09:30:00",
    eventId: "101",
    eventTitle: "Annual Art Exhibition 2025",
    likes: 42,
    comments: 15,
    tags: ["update", "artshow"]
  },
  {
    id: "3",
    type: "event",
    title: "Group Marathon Training",
    content: "Preparing for the summer marathon season. All levels welcome! We'll have pacers for different target times.",
    community: {
      name: "FitnessHub",
      handle: "fitness-hub",
      avatar: "https://images.pexels.com/photos/2247179/pexels-photo-2247179.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    date: "2025-04-13T18:45:00",
    eventDate: "Apr 18, 2025 • 6:00 AM",
    likes: 35,
    comments: 12,
    image: "https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    tags: ["fitness", "marathon", "training"]
  },
  {
    id: "4",
    type: "update",
    title: "Special Guest Announcement",
    content: "We're thrilled to announce that bestselling author Maya Richards will be joining us for a Q&A session after the book reading!",
    community: {
      name: "BookLovers",
      handle: "book-lovers",
      avatar: "https://images.pexels.com/photos/3747468/pexels-photo-3747468.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    date: "2025-04-12T11:20:00",
    eventId: "102",
    eventTitle: "Monthly Book Club Meeting",
    likes: 58,
    comments: 24,
    tags: ["books", "author", "announcement"]
  },
  {
    id: "5",
    type: "event",
    title: "Jazz in the Park",
    content: "Bring your blankets and picnic baskets for an evening of smooth jazz under the stars. Local vendors will be present.",
    community: {
      name: "MusicScene",
      handle: "music-scene",
      avatar: "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    date: "2025-04-11T15:10:00",
    eventDate: "Apr 25, 2025 • 7:30 PM",
    likes: 97,
    comments: 32,
    image: "https://images.pexels.com/photos/1813124/pexels-photo-1813124.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    tags: ["jazz", "livemusic", "outdoors"]
  },
];

// Mock Data for Upcoming Events
export const mockUpcomingEvents: Event[] = [
  {
    id: "101",
    title: "Web Development Workshop",
    date: "Apr 20, 2025",
    time: "2:00 PM",
    community: {
      name: "TechTalks",
      handle: "tech-talks",
      avatar: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    image: "https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: "102",
    title: "Monthly Book Club Meeting",
    date: "Apr 22, 2025",
    time: "7:00 PM",
    community: {
      name: "BookLovers",
      handle: "book-lovers",
      avatar: "https://images.pexels.com/photos/3747468/pexels-photo-3747468.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    image: "https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: "103",
    title: "Group Marathon Training",
    date: "Apr 18, 2025",
    time: "6:00 AM",
    community: {
      name: "FitnessHub",
      handle: "fitness-hub",
      avatar: "https://images.pexels.com/photos/2247179/pexels-photo-2247179.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    image: "https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
];

// Mock Data for Trending Communities
export const mockTrendingCommunities: Community[] = [
  {
    id: "201",
    name: "TechTalks",
    handle: "tech-talks",
    avatar: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    description: "Discussions on the latest in technology and development",
    members: 1240,
    isVerified: true,
  },
  {
    id: "202",
    name: "ArtCollective",
    handle: "art-collective",
    avatar: "https://images.pexels.com/photos/3094799/pexels-photo-3094799.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    description: "A community for artists and art enthusiasts",
    members: 890,
    isVerified: true,
  },
  {
    id: "203",
    name: "FitnessHub",
    handle: "fitness-hub",
    avatar: "https://images.pexels.com/photos/2247179/pexels-photo-2247179.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    description: "Join us for workouts, tips, and fitness events",
    members: 2150,
    isVerified: false,
  },
];