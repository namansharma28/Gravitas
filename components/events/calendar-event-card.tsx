import Link from "next/link";
// import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Event } from "@/types/event";
import { Globe, MapPin, Calendar, Clock, Users, Plus, CalendarDays } from "lucide-react";

interface CalendarEventCardProps {
  event: Event;
  variant?: "default" | "horizontal";
}

export function CalendarEventCard({ event, variant = "default" }: CalendarEventCardProps) {
  // Add null checks for community properties
  const communityName = event.community?.name || "Community";
  const communityInitials = communityName.substring(0, 2);
  const communityHandle = event.community?.handle || "";
  const communityAvatar = event.community?.avatar || "";
  
  // Horizontal variant layout
  if (variant === "horizontal") {
    return (
      
  <Card className="transition-colors hover:bg-accent">
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <div
          className="aspect-video w-32 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex-shrink-0"
          style={{
            backgroundImage: event.image
              ? `url(${event.image})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="flex-1 space-y-1">
          <h3 className="font-semibold">{event.title}</h3>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
            
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
  }
  
  // Default vertical layout
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <div 
          className="aspect-video w-full bg-gradient-to-r from-blue-500 to-purple-600"
          style={{
            backgroundImage: event.image 
              ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${event.image})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <Badge className="mb-1 bg-primary/80 hover:bg-primary/70">Event</Badge>
          <h3 className="text-lg font-bold">{event.title}</h3>
        </div>
      </div>
      
      <CardContent className="p-4 pt-3">
        <div className="mb-3 flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={communityAvatar} />
            <AvatarFallback>{communityInitials}</AvatarFallback>
          </Avatar>
          <Link href={`/communities/${communityHandle}`} className="text-sm font-medium hover:underline">
            {communityName}
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-start gap-2 text-sm">
            <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <span>{event.location || "Downtown Center"}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <span>{event.attendees?.length || 0} attendees</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2 border-t px-4 py-3">
        <Button className="w-full" asChild>
          <Link href={`/events/${event.id}`}>View Details</Link>
        </Button>
        <Button variant="outline" className="w-full">RSVP</Button>
      </CardFooter>
    </Card>
  );
}

