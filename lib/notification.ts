import { toast } from "@/hooks/use-toast";

// Check if browser notifications are supported
export const isBrowserNotificationSupported = () => {
  return 'Notification' in window;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isBrowserNotificationSupported()) {
    toast({
      title: "Notifications not supported",
      description: "Your browser doesn't support notifications",
      variant: "destructive",
    });
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Check current notification permission
export const getNotificationPermission = (): NotificationPermission | null => {
  if (!isBrowserNotificationSupported()) {
    return null;
  }
  return Notification.permission;
};

// Send a browser notification
export const sendBrowserNotification = (
  title: string, 
  options: NotificationOptions = {}
): Notification | null => {
  if (!isBrowserNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }

  // Set default icon if not provided
  const defaultOptions: NotificationOptions = {
    icon: '/logo.svg',
    badge: '/logo.svg',
    ...options,
  };

  try {
    const notification = new Notification(title, defaultOptions);
    
    // Handle notification click
    notification.onclick = () => {
      window.focus();
      if (options.data?.url) {
        window.location.href = options.data.url;
      }
      notification.close();
    };
    
    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
};

// Format notification data for browser notification
export const formatNotificationForBrowser = (notification: any) => {
  return {
    title: notification.title,
    options: {
      body: notification.description,
      icon: '/logo.svg',
      badge: '/logo.svg',
      data: {
        url: notification.linkUrl || '/',
        id: notification.id,
      },
      tag: notification.id, // Prevents duplicate notifications
    }
  };
};

// Notification types
export enum NotificationType {
  EVENT_CREATED = 'event_created',
  EVENT_UPDATED = 'event_updated',
  EVENT_REMINDER = 'event_reminder',
  COMMUNITY_POST = 'community_post',
  COMMUNITY_JOINED = 'community_joined',
  FORM_RESPONSE = 'form_response',
  RSVP_CONFIRMED = 'rsvp_confirmed',
  EVENT_CANCELLED = 'event_cancelled',
  COMMUNITY_UPDATE = 'community_update',
}

// Calculate time until event
export const getTimeUntilEvent = (eventDate: string, eventTime: string): string => {
  const eventDateTime = new Date(`${eventDate} ${eventTime}`);
  const now = new Date();
  const timeDiff = eventDateTime.getTime() - now.getTime();
  
  if (timeDiff <= 0) {
    return 'Event has started or passed';
  }
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
};

// Send event reminder notification
export const sendEventReminderNotification = async (
  eventId: string,
  eventTitle: string,
  eventDate: string,
  eventTime: string,
  eventLocation: string
) => {
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: NotificationType.EVENT_REMINDER,
        title: `Event Reminder: ${eventTitle}`,
        description: `${eventTitle} starts in ${getTimeUntilEvent(eventDate, eventTime)} at ${eventLocation}`,
        linkUrl: `/events/${eventId}`,
        eventId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending event reminder:', error);
    throw error;
  }
};