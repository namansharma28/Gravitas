"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserCheck, UserPlus, Loader2 } from "lucide-react";

interface RegisterButtonProps {
  eventId: string;
  rsvpStatus: {
    registrationEnabled: boolean;
    registrationType: 'direct' | 'form' | null;
    rsvpFormId: string | null;
    userRegistered: boolean;
    registrationCount: number;
    capacity: number;
  };
  onRegistrationChange: () => void;
}

export default function RegisterButton({ eventId, rsvpStatus, onRegistrationChange }: RegisterButtonProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (rsvpStatus.registrationType === 'form' && rsvpStatus.rsvpFormId) {
      // Redirect to form
      router.push(`/events/${eventId}/forms/${rsvpStatus.rsvpFormId}/submit`);
      return;
    }

    if (rsvpStatus.registrationType === 'direct') {
      setIsLoading(true);
      
      try {
        const response = await fetch(`/api/events/${eventId}/rsvp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'register',
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to register');
        }

        toast({
          title: "Registration Successful",
          description: "You have been registered for this event!",
        });

        onRegistrationChange();
      } catch (error: any) {
        toast({
          title: "Registration Failed",
          description: error.message || "Failed to register for event",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!rsvpStatus.registrationEnabled) {
    return (
      <Button disabled variant="outline" className="w-full">
        Registration Not Available
      </Button>
    );
  }

  if (rsvpStatus.userRegistered) {
    return (
      <Button disabled variant="default" className="w-full gap-2">
        <UserCheck className="h-4 w-4" />
        Registered
      </Button>
    );
  }

  if (rsvpStatus.registrationCount >= rsvpStatus.capacity) {
    return (
      <Button disabled variant="outline" className="w-full">
        Event Full
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleRegister} 
      disabled={isLoading}
      className="w-full gap-2"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Registering...
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          {rsvpStatus.registrationType === 'form' ? 'Fill Registration Form' : 'Register Now'}
        </>
      )}
    </Button>
  );
}