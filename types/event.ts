export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  capacity?: number;
  image?: string;
  creatorId: string;
  community: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
  };
  attendees?: string[];
  interested?: string[];
  userPermissions?: {
    isMember: boolean;
    isAdmin: boolean;
    isCreator: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canCreateForms: boolean;
    canCreateUpdates: boolean;
  };
}