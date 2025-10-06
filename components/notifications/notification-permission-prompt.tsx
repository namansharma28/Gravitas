"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  isBrowserNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission
} from "@/lib/notification";

interface NotificationPermissionPromptProps {
  onClose: () => void;
}

export default function NotificationPermissionPrompt({ onClose }: NotificationPermissionPromptProps) {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(isBrowserNotificationSupported());
    if (isBrowserNotificationSupported()) {
      const currentPermission = getNotificationPermission();
      setPermission(currentPermission);

      // If permission is already granted, close the prompt immediately
      if (currentPermission === 'granted') {
        onClose();
      }
    }
  }, [onClose]);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');
    if (granted) {
      onClose();
    }
  };

  // Don't show if not supported, already granted, or denied
  if (!isSupported || permission === 'granted' || permission === 'denied') {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle>Enable Notifications</CardTitle>
        </div>
        <CardDescription>
          Get notified about new events, updates, and messages from your communities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="rounded-full bg-primary/10 p-4">
            <Bell className="h-8 w-8 text-primary" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Stay up-to-date with notifications about events, community updates, and messages.
            You can change your notification settings at any time.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Maybe Later
        </Button>
        <Button onClick={handleRequestPermission}>
          Enable Notifications
        </Button>
      </CardFooter>
    </Card>
  );
}