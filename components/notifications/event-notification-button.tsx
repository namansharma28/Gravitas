"use client";

import { useState } from "react";
import { Bell, Clock, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getTimeUntilEvent, NotificationType } from "@/lib/notification";

interface EventNotificationButtonProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  className?: string;
}

export default function EventNotificationButton({
  eventId,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  className,
}: EventNotificationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const { toast } = useToast();

  const timeUntilEvent = getTimeUntilEvent(eventDate, eventTime);

  const sendEventReminder = async () => {
    setIsLoading(true);
    try {
      const message = customMessage.trim() || 
        `Don't forget! ${eventTitle} starts in ${timeUntilEvent} at ${eventLocation}. See you there!`;

      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: NotificationType.EVENT_REMINDER,
          title: `Event Reminder: ${eventTitle}`,
          description: message,
          linkUrl: `/events/${eventId}`,
          eventId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      const result = await response.json();
      
      toast({
        title: "Notification Sent!",
        description: result.message,
      });

      setIsOpen(false);
      setCustomMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const defaultMessage = `Don't forget! ${eventTitle} starts in ${timeUntilEvent} at ${eventLocation}. See you there!`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Bell className="mr-2 h-4 w-4" />
          Send Reminder
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Send Event Reminder
          </DialogTitle>
          <DialogDescription>
            Send a notification reminder to all event attendees and interested users.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Event Info */}
          <div className="rounded-lg border p-4 space-y-2">
            <h4 className="font-medium">{eventTitle}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{eventDate} at {eventTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{eventLocation}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Starts in {timeUntilEvent}</span>
            </div>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder={defaultMessage}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use the default reminder message
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={sendEventReminder} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reminder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}