"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { handleApiResponse } from '@/lib/utils';
import { useSession } from "next-auth/react";
import { UserCheck, UserPlus, Loader2 } from "lucide-react";
import Link from "next/link";

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
      toast({
        title: "Login Required",
        description: "Please sign in to register for this event",
        variant: "default"
      });
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

        const data = await handleApiResponse(response, {
          router,
          toast,
          successMessage: {
            title: "Registration Successful",
            description: "You have been registered for this event!",
          },
          errorMessage: {
            title: "Registration Failed",
            description: "Failed to register for event",
          }
        });

        if (data) {
          onRegistrationChange();
        }
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
    // For non-logged in users, show sign in to register button instead of disabled button
    if (!session) {
      return (
        <Button asChild className="w-full gap-2" size="lg">
          <Link href="/auth/signin">
            <UserPlus className="h-4 w-4" />
            Sign in to Register
          </Link>
        </Button>
      );
    }
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

  // For non-logged in users, show a direct sign in button instead of going through handleRegister
  if (!session) {
    return (
      <Button asChild className="w-full gap-2" size="lg">
        <Link href="/auth/signin">
          <UserPlus className="h-4 w-4" />
          Sign in to Register
        </Link>
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