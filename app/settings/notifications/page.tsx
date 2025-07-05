"use client";

import { useState, useEffect } from "react";
import { Bell, Volume2, Calendar, Users, Mail, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import NotificationTestButton from "@/components/notifications/notification-test-button";
import { 
  isBrowserNotificationSupported, 
  getNotificationPermission, 
  requestNotificationPermission 
} from "@/lib/notification";

interface NotificationSettings {
  emailNotifications: boolean;
  browserNotifications: boolean;
  eventReminders: boolean;
  communityUpdates: boolean;
  newFollowers: boolean;
  eventInvitations: boolean;
  weeklyDigest: boolean;
}

export default function NotificationSettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    browserNotifications: false,
    eventReminders: true,
    communityUpdates: true,
    newFollowers: false,
    eventInvitations: true,
    weeklyDigest: false,
  });
  const [browserNotificationsSupported, setBrowserNotificationsSupported] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    if (session) {
      fetchNotificationSettings();
      
      // Check browser notification support and permission
      const supported = isBrowserNotificationSupported();
      setBrowserNotificationsSupported(supported);
      
      if (supported) {
        setNotificationPermission(getNotificationPermission());
      }
    }
  }, [session]);

  const fetchNotificationSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/notifications');
      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({
          ...prev,
          ...data,
          // Set browser notifications based on permission
          browserNotifications: getNotificationPermission() === 'granted'
        }));
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to load notification settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
    // Special handling for browser notifications
    if (key === 'browserNotifications') {
      if (value) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          toast({
            title: "Permission denied",
            description: "Please enable notifications in your browser settings",
            variant: "destructive",
          });
          return;
        }
        setNotificationPermission('granted');
      }
      // We don't actually turn off browser notifications, just stop showing them
      setSettings(prev => ({ ...prev, [key]: value }));
      return;
    }

    // For other settings
    setIsSaving(true);
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      
      const response = await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      toast({
        title: "Settings updated",
        description: "Your notification preferences have been saved",
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
      // Revert the change
      setSettings(prev => ({ ...prev, [key]: !value }));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Notification Settings</h1>
        <p className="text-muted-foreground">Manage how and when you receive notifications</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Channels
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                disabled={isSaving}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Browser Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  {browserNotificationsSupported 
                    ? "Receive notifications in your browser when you're online" 
                    : "Your browser doesn't support notifications"}
                </p>
              </div>
              <Switch
                checked={settings.browserNotifications}
                onCheckedChange={(checked) => updateSetting('browserNotifications', checked)}
                disabled={!browserNotificationsSupported || notificationPermission === 'denied'}
              />
            </div>
            
            {browserNotificationsSupported && notificationPermission === 'granted' && (
              <div className="mt-2 flex justify-end">
                <NotificationTestButton />
              </div>
            )}
            
            {browserNotificationsSupported && notificationPermission === 'denied' && (
              <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4 text-sm text-yellow-800 dark:text-yellow-200">
                <p>
                  Notifications are blocked in your browser settings. To enable them, you&apos;ll need to update your browser permissions for this site.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Notification Types
            </CardTitle>
            <CardDescription>
              Choose which types of notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  Event Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded about upcoming events you&apos;re registered for
                </p>
              </div>
              <Switch
                checked={settings.eventReminders}
                onCheckedChange={(checked) => updateSetting('eventReminders', checked)}
                disabled={isSaving}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  Community Updates
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates from communities you follow
                </p>
              </div>
              <Switch
                checked={settings.communityUpdates}
                onCheckedChange={(checked) => updateSetting('communityUpdates', checked)}
                disabled={isSaving}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  New Followers
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when someone follows you
                </p>
              </div>
              <Switch
                checked={settings.newFollowers}
                onCheckedChange={(checked) => updateSetting('newFollowers', checked)}
                disabled={isSaving}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  Event Invitations
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive invitations to events from communities
                </p>
              </div>
              <Switch
                checked={settings.eventInvitations}
                onCheckedChange={(checked) => updateSetting('eventInvitations', checked)}
                disabled={isSaving}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <Rss className="h-4 w-4 text-orange-500" />
                  Weekly Digest
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get a weekly summary of activity in your communities
                </p>
              </div>
              <Switch
                checked={settings.weeklyDigest}
                onCheckedChange={(checked) => updateSetting('weeklyDigest', checked)}
                disabled={isSaving}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}