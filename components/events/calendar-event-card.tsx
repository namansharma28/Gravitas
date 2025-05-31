import Link from "next/link";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Event } from "@/types/event";

interface CalendarEventCardProps {
  event: Event;
}

export default function CalendarEventCard({ event }: CalendarEventCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <div 
          className="h-32 w-full bg-gradient-to-r from-blue-500 to-purple-600"
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
            <AvatarImage src={event.community.avatar} />
            <AvatarFallback>{event.community.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <Link href={`/communities/${event.community.handle}`} className="text-sm font-medium hover:underline">
            {event.community.name}
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
            <span>Downtown Center</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <span>120 attendees</span>
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