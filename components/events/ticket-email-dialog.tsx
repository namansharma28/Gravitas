"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Mail, QrCode, Ticket } from "lucide-react";

interface FormResponse {
  id: string;
  formId?: string;
  user: {
    name: string;
    email: string;
  };
}

interface TicketEmailDialogProps {
  eventId: string;
  selectedResponses: FormResponse[];
  onSuccess: () => void;
  trigger: React.ReactNode;
}

interface EventDetails {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

export default function TicketEmailDialog({
  eventId,
  selectedResponses,
  onSuccess,
  trigger,
}: TicketEmailDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [includeQR, setIncludeQR] = useState(true);
  const [emailData, setEmailData] = useState({
    subject: "",
    message: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchEventDetails();
    }
  }, [isOpen]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (response.ok) {
        const data = await response.json();
        setEventDetails(data);
        setEmailData({
          subject: `Your ticket for ${data.title}`,
          message: `Dear participant,

We're excited to confirm your registration for ${data.title}!

Event Details:
📅 Date: ${data.date}
🕐 Time: ${data.time}
📍 Location: ${data.location}

${data.description}

Please keep this email as your confirmation. ${includeQR ? 'Your QR code is attached for easy check-in at the venue.' : ''}

We look forward to seeing you at the event!

Best regards,
The Event Team`,
        });
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
    }
  };

  const handleSendTickets = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/events/${eventId}/tickets/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: selectedResponses.map(r => ({
            id: r.id,
            formId: r.formId, // Include formId for form-specific QR codes
            name: r.user.name,
            email: r.user.email,
          })),
          emailSubject: emailData.subject,
          emailMessage: emailData.message,
          includeQR,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send tickets');
      }

      toast({
        title: "Tickets Sent",
        description: `Successfully sent tickets to ${selectedResponses.length} participant(s)`,
      });

      setIsOpen(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send tickets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Send Event Tickets
          </DialogTitle>
          <DialogDescription>
            Send personalized tickets to {selectedResponses.length} selected participant(s)
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Recipients Preview */}
          <div className="rounded-lg border p-4">
            <h4 className="font-medium mb-2">Recipients ({selectedResponses.length}):</h4>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {selectedResponses.map((response) => (
                <div key={response.id} className="flex items-center justify-between text-sm">
                  <span>{response.user.name}</span>
                  <span className="text-muted-foreground">{response.user.email}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Email Customization */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={emailData.subject}
                onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter email subject"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Email Message</Label>
              <Textarea
                id="message"
                value={emailData.message}
                onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter your custom message"
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                You can customize this message. Event details and participant names will be automatically included.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeQR"
                checked={includeQR}
                onCheckedChange={(checked) => setIncludeQR(!!checked)}
              />
              <Label htmlFor="includeQR" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Include QR code for check-in
              </Label>
            </div>
            
            {includeQR && (
              <div className="text-sm text-muted-foreground p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-blue-600" />
                  <strong>QR Code Feature:</strong>
                </p>
                <p className="mt-1">
                  Each participant will receive a unique QR code that contains their form submission details.
                  This QR code can be scanned at the event to verify their identity and mark them as checked in.
                </p>
              </div>
            )}
          </div>

          {/* Event Details Preview */}
          {eventDetails && (
            <div className="rounded-lg border p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Event Details (will be included in ticket):</h4>
              <div className="text-sm space-y-1">
                <p><strong>Event:</strong> {eventDetails.title}</p>
                <p><strong>Date:</strong> {eventDetails.date}</p>
                <p><strong>Time:</strong> {eventDetails.time}</p>
                <p><strong>Location:</strong> {eventDetails.location}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendTickets}
            disabled={isLoading || !emailData.subject.trim() || !emailData.message.trim()}
          >
            {isLoading ? "Sending..." : `Send Tickets (${selectedResponses.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}