export interface FeedItem {
  id: string;
  type: "event" | "update";
  title: string;
  content: string;
  community: {
    name: string;
    handle: string;
    avatar: string;
  };
  date: string;
  eventDate?: string;
  eventId?: string;
  eventTitle?: string;
  image?: string;
  tags?: string[];
}