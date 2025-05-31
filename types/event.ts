export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  community: {
    name: string;
    handle: string;
    avatar: string;
  };
  image?: string;
}