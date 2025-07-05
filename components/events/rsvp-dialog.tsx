"use client";

import { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { UserPlus, FileText, Zap } from "lucide-react";

interface RSVPDialogProps {
  eventId: string;
  onRegistrationStarted: () => void;
}

export default function RSVPDialog({ eventId, onRegistrationStarted }: RSVPDialogProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [registrationType, setRegistrationType] = useState<'direct' | 'form'>('direct');
  const [isLoading, setIsLoading] = useState(false);

  const handleStartRegistration = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start',
          registrationType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start registration');
      }

      const data = await response.json();
      
      toast({
        title: "Registration Started",
        description: registrationType === 'direct' 
          ? "Direct registration is now enabled for this event"
          : "You can now create a custom registration form",
      });

      setIsOpen(false);
      onRegistrationStarted();

      if (data.redirectTo) {
        router.push(data.redirectTo);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Start Registration
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Start Event Registration</DialogTitle>
          <DialogDescription>
            Choose how you want people to register for your event
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <RadioGroup value={registrationType} onValueChange={(value) => setRegistrationType(value as 'direct' | 'form')}>
            <div className="space-y-3">
              <Card className={`cursor-pointer transition-all ${registrationType === 'direct' ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="direct" id="direct" />
                    <Label htmlFor="direct" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Direct Registration</span>
                      </div>
                    </Label>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription>
                    Users can register instantly with just one click. We'll automatically collect their name and email.
                    Perfect for simple events where you just need to know who's coming.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer transition-all ${registrationType === 'form' ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="form" id="form" />
                    <Label htmlFor="form" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Custom Registration Form</span>
                      </div>
                    </Label>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription>
                    Create a custom form to collect specific information from attendees. 
                    You can ask for dietary preferences, t-shirt sizes, or any other details you need.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </RadioGroup>
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
            onClick={handleStartRegistration}
            disabled={isLoading}
          >
            {isLoading ? "Starting..." : "Start Registration"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}