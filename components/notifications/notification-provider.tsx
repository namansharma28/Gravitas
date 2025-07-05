"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { 
  isBrowserNotificationSupported, 
  getNotificationPermission, 
  sendBrowserNotification,
  formatNotificationForBrowser
} from "@/lib/notification";

interface Notification {
  id: string;
  title: string;
  description: string;
  type: string;
  read: boolean;
  createdAt: string;
  linkUrl?: string;
}

interface NotificationContextType {
  requestPermission: () => Promise<boolean>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
  isSupported: boolean;
  permission: NotificationPermission;
  unreadCount: number;
  notifications: Notification[];
  fetchNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if (isBrowserNotificationSupported()) {
      setIsSupported(true);
      setPermission(getNotificationPermission() || 'default');
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support notifications",
        variant: "destructive",
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast({
          title: "Notifications enabled",
          description: "You'll now receive notifications for important updates",
        });
      } else {
        toast({
          title: "Notifications disabled",
          description: "You can enable notifications in your browser settings",
          variant: "destructive",
        });
      }
      
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Error",
        description: "Failed to request notification permission",
        variant: "destructive",
      });
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      // Fallback to toast notification
      toast({
        title,
        description: options?.body || '',
      });
      return;
    }

    const notification = sendBrowserNotification(title, options);
    if (!notification) {
      // Fallback to toast if browser notification fails
      toast({
        title,
        description: options?.body || '',
      });
    }
  };

  const value: NotificationContextType = {
    requestPermission,
    sendNotification,
    isSupported,
    permission,
    unreadCount: 0, // TODO: Implement actual unread count logic
    notifications: [], // TODO: Implement actual notifications fetching
    fetchNotifications: () => {}, // TODO: Implement actual fetch logic
    markAsRead: () => {}, // TODO: Implement actual mark as read logic
    markAllAsRead: () => {}, // TODO: Implement actual mark all as read logic
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}