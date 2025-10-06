"use client";

import { Bell, Calendar, Users, FileText, UserPlus, MessageSquare, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function NotificationSummary() {
  const implementedNotifications = [
    {
      icon: <Calendar className="h-4 w-4" />,
      title: "Event Created",
      description: "Community members get notified when new events are created",
      trigger: "When an admin/member creates an event in a community",
      status: "implemented"
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      title: "Event Updated",
      description: "Attendees and interested users get notified about event changes",
      trigger: "When event details are modified",
      status: "implemented"
    },
    {
      icon: <Bell className="h-4 w-4" />,
      title: "Event Reminder",
      description: "Manual reminder notifications can be sent to event attendees",
      trigger: "When organizers click 'Send Reminder' button on event page",
      status: "implemented"
    },
    {
      icon: <UserPlus className="h-4 w-4" />,
      title: "RSVP Confirmed",
      description: "Event organizers get notified when someone RSVPs",
      trigger: "When users register for events (direct or form-based)",
      status: "implemented"
    },
    {
      icon: <FileText className="h-4 w-4" />,
      title: "Form Response",
      description: "Event organizers get notified about new form submissions",
      trigger: "When users submit event forms",
      status: "implemented"
    },
    {
      icon: <Users className="h-4 w-4" />,
      title: "Community Joined",
      description: "Community admins get notified about new members",
      trigger: "When users are added to communities",
      status: "implemented"
    },
    {
      icon: <MessageSquare className="h-4 w-4" />,
      title: "Community Posts",
      description: "Community members get notified about new posts",
      trigger: "When communities create new posts/updates",
      status: "ready-to-implement"
    },
    {
      icon: <AlertTriangle className="h-4 w-4" />,
      title: "Event Cancelled",
      description: "Attendees get notified when events are cancelled",
      trigger: "When events are deleted or marked as cancelled",
      status: "ready-to-implement"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Notification System Overview</h2>
        <p className="text-muted-foreground">
          Comprehensive notification system for events, communities, and user interactions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {implementedNotifications.map((notification, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  {notification.icon}
                  {notification.title}
                </CardTitle>
                <Badge 
                  variant={notification.status === 'implemented' ? 'default' : 'secondary'}
                  className={notification.status === 'implemented' ? 'bg-green-500' : ''}
                >
                  {notification.status === 'implemented' ? 'Live' : 'Ready'}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {notification.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground">
                <strong>Trigger:</strong> {notification.trigger}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Features Included</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">✓</Badge>
            <span className="text-sm">Browser notification permission management</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">✓</Badge>
            <span className="text-sm">In-app notification center with unread count</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">✓</Badge>
            <span className="text-sm">Event reminder button on event pages</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">✓</Badge>
            <span className="text-sm">Automatic notifications for key user actions</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">✓</Badge>
            <span className="text-sm">Notification settings page</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">✓</Badge>
            <span className="text-sm">Smart recipient targeting (organizers, attendees, community members)</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">✓</Badge>
            <span className="text-sm">Fallback to toast notifications when browser notifications are disabled</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}