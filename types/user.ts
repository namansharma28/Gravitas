export interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    bio?: string;
    location?: string;
    website?: string;
    joinedAt: Date;
    communities?: string[];
    following?: string[];
    followers?: string[];
  }
  
  export interface UserProfile extends User {
    eventsAttending?: string[];
    eventsOrganizing?: string[];
    totalEvents?: number;
  }