"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from "@/components/notifications/notification-provider";
import NotificationList from "@/components/notifications/notification-list";
import NotificationPermissionPrompt from "@/components/notifications/notification-permission-prompt";
import { 
  isBrowserNotificationSupported, 
  getNotificationPermission 
} from "@/lib/notification";

export default function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  // Check if we should show the permission prompt
  useEffect(() => {
    if (isBrowserNotificationSupported()) {
      const permission = getNotificationPermission();
      
      // Show prompt if permission is not granted or denied
      if (permission === 'default') {
        // Only show after user has been on the site for a while
        const timer = setTimeout(() => {
          setShowPermissionPrompt(true);
        }, 30000); // 30 seconds
        
        return () => clearTimeout(timer);
      }
    }
  }, []);

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <NotificationList onClose={() => setIsOpen(false)} />
        </PopoverContent>
      </Popover>

      {showPermissionPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <NotificationPermissionPrompt onClose={() => setShowPermissionPrompt(false)} />
        </div>
      )}
    </>
  );
}