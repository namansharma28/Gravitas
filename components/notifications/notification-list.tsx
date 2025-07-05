"use client";

import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, Calendar, Users, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/components/notifications/notification-provider";
import Link from "next/link";

interface NotificationListProps {
  onClose?: () => void;
}

export default function NotificationList({ onClose }: NotificationListProps) {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();

  // Fetch notifications when component mounts
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Format notification time
  const formatNotificationTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "recently";
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'community':
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (onClose) onClose();
  };

  return (
    <div>
      <div className="flex items-center justify-between border-b p-3">
        <h4 className="font-medium">Notifications</h4>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={markAllAsRead}
          className="text-xs h-8"
          disabled={unreadCount === 0}
        >
          Mark all as read
        </Button>
      </div>
      
      <ScrollArea className="max-h-[70vh] md:max-h-[400px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Bell className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <Link 
                key={notification.id} 
                href={notification.linkUrl || '#'}
                onClick={() => handleNotificationClick(notification)}
                className={`block border-b last:border-b-0 hover:bg-muted/50 transition-colors ${notification.read ? 'opacity-70' : ''}`}
              >
                <div className="p-3">
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notification.read ? 'bg-transparent' : 'bg-primary'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {getNotificationIcon(notification.type)}
                          <p className="font-medium text-sm">{notification.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatNotificationTime(notification.createdAt)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </ScrollArea>
      
      <Separator />
      
      <div className="p-3 text-center">
        <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
          <Link href="/settings">Manage notifications</Link>
        </Button>
      </div>
    </div>
  );
}