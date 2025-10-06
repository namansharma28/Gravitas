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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Check if notifications are supported
    if (isBrowserNotificationSupported()) {
      setIsSupported(true);
      setPermission(getNotificationPermission() || 'default');
    }
  }, []);

  useEffect(() => {
    // Fetch notifications when user is logged in
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session?.user?.id]);

  const fetchNotifications = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId: id }),
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

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
    unreadCount,
    notifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
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