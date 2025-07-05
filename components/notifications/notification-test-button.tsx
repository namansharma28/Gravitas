"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  isBrowserNotificationSupported, 
  getNotificationPermission, 
  requestNotificationPermission,
  sendBrowserNotification
} from "@/lib/notification";

export default function NotificationTestButton() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleTestNotification = async () => {
    setIsLoading(true);
    
    try {
      // Check if notifications are supported
      if (!isBrowserNotificationSupported()) {
        toast({
          title: "Notifications not supported",
          description: "Your browser doesn't support notifications",
          variant: "destructive",
        });
        return;
      }
      
      // Check permission
      let permission = getNotificationPermission();
      
      // Request permission if not granted
      if (permission !== 'granted') {
        const granted = await requestNotificationPermission();
        if (!granted) {
          toast({
            title: "Permission denied",
            description: "Please enable notifications in your browser settings",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Send test notification
      const notification = sendBrowserNotification(
        "Test Notification", 
        {
          body: "This is a test notification from Gravitas",
          icon: "/logo.svg",
          data: {
            url: "/settings",
          },
        }
      );
      
      if (notification) {
        toast({
          title: "Test notification sent",
          description: "Check your browser notifications",
        });
      } else {
        toast({
          title: "Failed to send notification",
          description: "There was an error sending the test notification",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error testing notification:', error);
      toast({
        title: "Error",
        description: "Failed to test notification",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleTestNotification} 
      disabled={isLoading}
      variant="outline"
      className="gap-2"
    >
      <Bell className="h-4 w-4" />
      Test Notification
    </Button>
  );
}