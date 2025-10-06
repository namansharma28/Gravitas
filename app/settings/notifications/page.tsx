"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Bell, Check, X, Calendar, Users, FileText, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/components/notifications/notification-provider";

export default function NotificationSettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { isSupported, permission, requestPermission } = useNotifications();
  const [settings, setSettings] = useState({
    eventCreated: true,
    eventUpdated: true,
    eventReminder: true,
    communityJoined: true,
    formResponse: true,
    rsvpConfirmed: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Only include working notification types
  const notificationTypes = [
    {
      key: 'eventCreated',
      title: 'New Events',
      description: 'Get notified when communities you\'re a member of create new events',
      icon: <Calendar className="h-4 w-4" />,
      status: 'active'
    },
    {
      key: 'eventUpdated',
      title: 'Event Updates',
      description: 'Get notified when events you\'re attending are updated',
      icon: <Calendar className="h-4 w-4" />,
      status: 'active'
    },
    {
      key: 'eventReminder',
      title: 'Event Reminders',
      description: 'Receive manual reminders sent by event organizers',
      icon: <Bell className="h-4 w-4" />,
      status: 'active'
    },
    {
      key: 'communityJoined',
      title: 'New Members',
      description: 'Get notified when someone joins communities you manage (admins only)',
      icon: <UserPlus className="h-4 w-4" />,
      status: 'active'
    },
    {
      key: 'formResponse',
      title: 'Form Responses',
      description: 'Get notified about new form submissions for your events (organizers only)',
      icon: <FileText className="h-4 w-4" />,
      status: 'active'
    },
    {
      key: 'rsvpConfirmed',
      title: 'RSVP Confirmations',
      description: 'Get notified when someone RSVPs to your events (organizers only)',
      icon: <Users className="h-4 w-4" />,
      status: 'active'
    },
  ];

  // Load preferences on component mount
  useEffect(() => {
    if (session?.user?.id) {
      loadPreferences();
    }
  }, [session?.user?.id]);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const preferences = await response.json();
        setSettings(preferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load notification preferences",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async (newSettings: typeof settings) => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        toast({
          title: "Settings saved",
          description: "Your notification preferences have been updated",
        });
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingChange = async (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await savePreferences(newSettings);
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast({
        title: "Notifications enabled",
        description: "You'll now receive browser notifications",
      });
    }
  };

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in required</h1>
          <p className="text-muted-foreground">Please sign in to manage your notification settings.</p>
          <Button className="mt-4" asChild>
            <a href="/auth/signin">Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="ml-3 text-muted-foreground">Loading notification settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
        <p className="text-muted-foreground">
          Manage how and when you receive notifications about events and communities.
        </p>
      </div>

      {/* Browser Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Browser Notifications
          </CardTitle>
          <CardDescription>
            Enable browser notifications to receive real-time alerts even when the app is closed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSupported ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <X className="h-4 w-4" />
              <span>Browser notifications are not supported on this device</span>
            </div>
          ) : permission === 'granted' ? (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-4 w-4" />
              <span>Browser notifications are enabled</span>
            </div>
          ) : permission === 'denied' ? (
            <div className="flex items-center gap-2 text-red-600">
              <X className="h-4 w-4" />
              <span>Browser notifications are blocked. Please enable them in your browser settings.</span>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Browser notifications are not enabled. Click the button below to enable them.
              </p>
              <Button onClick={handleEnableNotifications}>
                Enable Browser Notifications
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive. Only active notification types are shown.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span className="ml-2 text-sm text-muted-foreground">Loading preferences...</span>
            </div>
          ) : (
            notificationTypes.map((type, index) => (
              <div key={type.key}>
                <div className="flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      {type.icon}
                      <Label htmlFor={type.key} className="text-sm font-medium">
                        {type.title}
                      </Label>
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                  <Switch
                    id={type.key}
                    checked={settings[type.key as keyof typeof settings]}
                    onCheckedChange={(checked) => handleSettingChange(type.key, checked)}
                    disabled={isSaving}
                  />
                </div>
                {index < notificationTypes.length - 1 && <Separator className="mt-4" />}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Status and Help */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">6 notification types active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${permission === 'granted' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm">
                Browser notifications {permission === 'granted' ? 'enabled' : 'pending'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">In-app notifications always active</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Notifications appear in the notification bell (top right)</p>
            <p>• Browser notifications work even when the app is closed</p>
            <p>• Settings are saved automatically when changed</p>
            <p>• Some notifications are role-specific (organizers, admins)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}