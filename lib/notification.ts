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