'use client';

import { Button } from '@/components/ui/button';
import { useNotifications } from './notification-provider';
import { Bell, BellOff } from 'lucide-react';

export function NotificationButton() {
  const { requestPermission, sendNotification, isSupported, permission } = useNotifications();

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  const handleTestNotification = () => {
    sendNotification('Test Notification', {
      body: 'This is a test notification from Gravitas!',
      icon: '/logo.svg',
      data: {
        url: '/',
      },
    });
  };

  if (!isSupported) {
    return (
      <Button variant="outline" disabled>
        <BellOff className="h-4 w-4 mr-2" />
        Notifications not supported
      </Button>
    );
  }

  if (permission === 'default') {
    return (
      <Button onClick={handleRequestPermission} variant="outline">
        <Bell className="h-4 w-4 mr-2" />
        Enable Notifications
      </Button>
    );
  }

  if (permission === 'denied') {
    return (
      <Button variant="outline" disabled>
        <BellOff className="h-4 w-4 mr-2" />
        Notifications blocked
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleTestNotification} variant="outline">
        <Bell className="h-4 w-4 mr-2" />
        Test Notification
      </Button>
    </div>
  );
} 