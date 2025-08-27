"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Calendar, Clock, MapPin, Users, Share2, ArrowLeft, Pencil, Plus, FileText, Mail, User, Trash2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import UpdateCard from "@/components/events/update-card";
import RegisterButton from "@/components/events/register-button";
import RegistrationControl from "@/components/events/registration-control";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  image: string;
  creatorId: string;
  community: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
  };
  attendees: string[];
  interested: string[];
  userPermissions: {
    isMember: boolean;
    isAdmin: boolean;
    isCreator: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canCreateForms: boolean;
    canCreateUpdates: boolean;
  };
}

interface Update {
  id: string;
  title: string;
  content: string;
  visibility: 'everyone' | 'members';
  media: any[];
  documents: any[];
  attachedForm: any;
  community: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
  };
  comments: any[];
  createdAt: string;
}

interface RSVPStatus {
  registrationEnabled: boolean;
  registrationType: 'direct' | 'form' | null;
  rsvpFormId: string | null;
  userRegistered: boolean;
  registrationCount: number;
  capacity: number;
}

export default function EventPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [rsvpStatus, setRSVPStatus] = useState<RSVPStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  // Check if user is logged in
  const isLoggedIn = !!session?.user;

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        // Fetch event details
        const eventResponse = await fetch(`/api/events/${params.id}`);
        if (!eventResponse.ok) {
          // Handle 401 Unauthorized by setting event to null instead of throwing an error
          if (eventResponse.status === 401) {
            setEvent(null);
            return;
          }
          throw new Error('Failed to fetch event');
        }
        const eventData = await eventResponse.json();
        setEvent(eventData);

        // Fetch updates
        const updatesResponse = await fetch(`/api/events/${params.id}/updates`);
        if (updatesResponse.ok) {
          const updatesData = await updatesResponse.json();
          setUpdates(updatesData);
        }

        // Fetch RSVP status for all users
        const rsvpResponse = await fetch(`/api/events/${params.id}/rsvp`);
        if (rsvpResponse.ok) {
          const rsvpData = await rsvpResponse.json();
          setRSVPStatus(rsvpData);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load event details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [params.id, toast, isLoggedIn]);

  const handleDeleteEvent = async () => {
    // Check if user is logged in
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "You need to be logged in to delete an event.",
        variant: "destructive",
      });
      return;
    }
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/events/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete event');
      }

      toast({
        title: "Event Deleted",
        description: "The event has been deleted successfully.",
      });
      router.push(`/communities/${event?.community.handle}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRegistrationChange = async () => {
    // Refresh RSVP status when registration settings change
    try {
      const rsvpResponse = await fetch(`/api/events/${params.id}/rsvp`);
      if (rsvpResponse.ok) {
        const rsvpData = await rsvpResponse.json();
        setRSVPStatus(rsvpData);
      }
    } catch (error) {
      console.error('Failed to refresh RSVP status:', error);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Event link copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-200px)] flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-200px)] flex-col items-center justify-center py-10">
        <h1 className="text-3xl font-bold">Event Not Found</h1>
        <p className="mb-6 text-muted-foreground">The event you&apos;re looking for doesn&apos;t exist.</p>
        <Button asChild>
          <Link href="/calendar">Explore Events</Link>
        </Button>
      </div>
    );
  }

  const userPermissions = event?.userPermissions;

  return (
    <div className="container mx-auto pb-16">
      {/* Event Banner */}
      <div 
        className="relative mb-6 h-64 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 md:h-80"
        style={{
          backgroundImage: event.image 
            ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${event.image})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <Badge className="mb-2 bg-primary/80 hover:bg-primary/70">Event</Badge>
          <h1 className="mb-1 text-2xl font-bold md:text-4xl">{event.title}</h1>
          
          <div className="mt-2 flex items-center gap-2">
            <Avatar className="h-6 w-6 border-2 border-white">
              <AvatarImage src={event.community.avatar} />
              <AvatarFallback>{event.community.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <Link 
              href={`/communities/${event.community.handle}`} 
              className="text-sm font-medium text-white hover:underline"
            >
              {event.community.name}
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Admin/Member Controls */}
          {isLoggedIn ? (
            userPermissions.isMember ? (
              <div className="flex flex-wrap gap-3">
                {userPermissions.canEdit && (
                  <Button className="gap-2" asChild>
                    <Link href={`/events/${event.id}/edit`}>
                      <Pencil size={16} /> Edit Event
                    </Link>
                  </Button>
                )}
                {userPermissions.canCreateUpdates && (
                  <Button className="gap-2" asChild>
                    <Link href={`/events/${event.id}/updates/create`}>
                      <Plus size={16} /> Create Update
                    </Link>
                  </Button>
                )}
                {userPermissions.canCreateForms && (
                  <Button asChild className="gap-2">
                    <Link href={`/events/${event.id}/forms`}>
                      <FileText size={16} /> Forms
                    </Link>
                  </Button>
                )}
                {/* QR Scanner Button for Members and Admins */}
                <Button asChild variant="outline" className="gap-2">
                  <Link href={`/events/${event.id}/scan`}>
                    <QrCode size={16} /> Scan QR Codes
                  </Link>
                </Button>
                {/* Registration Control */}
                {rsvpStatus && (
                  <RegistrationControl 
                    eventId={event.id} 
                    registrationEnabled={rsvpStatus.registrationEnabled}
                    onRegistrationChange={handleRegistrationChange}
                  />
                )}
                {userPermissions.canDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2">
                        <Trash2 size={16} /> Delete Event
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the event
                          and all associated data including forms and responses.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteEvent}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? "Deleting..." : "Delete Event"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={`/events/${event.id}/register`}>
                    <Plus size={16} /> Register
                  </Link>
                </Button>
              </div>
            )
          ) : (

            <Card className="mb-6">
              <CardContent className="p-6 text-center">
                <h3 className="mb-2 text-lg font-semibold">Join this event</h3>
                <p className="mb-4 text-muted-foreground">
                  Sign in to register for this event and access more features.
                </p>
                <Button asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-6">
                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p>{event.date}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p>{event.time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p>{event.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Attendees</p>
                    <p>{rsvpStatus?.registrationCount || 0} registered</p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h2 className="mb-4 text-xl font-semibold">About This Event</h2>
                <p className="text-muted-foreground">{event.description}</p>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="updates" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-1">
              <TabsTrigger value="updates">Updates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="updates" className="mt-0 space-y-4">
              {updates.length > 0 ? (
                updates.map(update => (
                  <UpdateCard 
                    key={update.id} 
                    update={update} 
                    eventId={event.id}
                    userPermissions={userPermissions}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No updates for this event yet.</p>
                    {userPermissions.canCreateUpdates && (
                      <Button className="mt-4" asChild>
                        <Link href={`/events/${event.id}/updates/create`}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create First Update
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
        

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between">
                <h3 className="font-semibold">Registration</h3>
                <Badge variant="outline" className="border-green-300 text-green-600 dark:border-green-800 dark:text-green-400">
                  {rsvpStatus?.registrationEnabled ? 'Open' : 'Closed'}
                </Badge>
              </div>
              <div className="mt-4 space-y-4">
                {rsvpStatus && (
                  <RegisterButton 
                    eventId={event.id}
                    rsvpStatus={rsvpStatus}
                    onRegistrationChange={handleRegistrationChange}
                  />
                )}
                <Button variant="outline" className="w-full" size="lg" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
              </div>
              <Separator className="my-4" />
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total spots</span>
                  <span className="text-sm font-medium">{event.capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Registered</span>
                  <span className="text-sm font-medium">{rsvpStatus?.registrationCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Available</span>
                  <span className="text-sm font-medium">{event.capacity - (rsvpStatus?.registrationCount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Registration closes</span>
                  <span className="text-sm font-medium">{event.date}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 font-semibold">Organizer</h3>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={event.community.avatar} />
                  <AvatarFallback>{event.community.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/communities/${event.community.handle}`} className="font-medium hover:underline">
                    {event.community.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">Community</p>
                </div>
              </div>
              <Separator className="my-4" />
              <h3 className="mb-3 font-semibold">Contact</h3>
              <div className="text-sm">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href="#" className="hover:underline">
                    {event.community.handle}@example.com
                  </a>
                </p>
                <p className="mt-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Event Coordinator</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* QR Scanner Quick Access for Mobile */}
          {isLoggedIn && userPermissions.isMember && (
            <Card className="lg:hidden">
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">Event Management</h3>
                <Button asChild className="w-full gap-2">
                  <Link href={`/events/${event.id}/scan`}>
                    <QrCode className="h-4 w-4" />
                    Scan QR Codes
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Scan participant tickets for check-in
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}