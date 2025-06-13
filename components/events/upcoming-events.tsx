"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface UpcomingEvent {
  _id: string;
  title: string;
  date: string;
  time: string;
  community: {
    name: string;
    handle: string;
    avatar: string;
  };
  image?: string;
  userRegistered: boolean;
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState<string | null>(null);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const response = await fetch('/api/home/upcoming-events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">No upcoming events</p>
          <Button variant="link" className="mt-2" asChild>
            <Link href="/explore">Discover events</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event, index) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                href={`/events/${event._id}`}
                className={cn(
                  "group block rounded-lg border p-3 transition-all hover:bg-accent hover:shadow-md",
                  activeEvent === event._id ? "ring-2 ring-ring" : ""
                )}
                onMouseEnter={() => setActiveEvent(event._id)}
                onMouseLeave={() => setActiveEvent(null)}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="h-14 w-14 rounded-md bg-gradient-to-r from-primary to-indigo-600 dark:from-primary dark:to-indigo-500 flex-shrink-0"
                    style={{
                      backgroundImage: event.image 
                        ? `url(${event.image})`
                        : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="flex-1 space-y-1">
                    <p className="line-clamp-1 font-medium group-hover:text-primary transition-colors">{event.title}</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={event.community.avatar} />
                        <AvatarFallback>{event.community.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <p className="text-xs text-muted-foreground">{event.community.name}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{event.time}</span>
                      </div>
                    </div>
                  </div>
                  {event.userRegistered && (
                    <Badge className="bg-green-500 dark:bg-green-600 text-white text-xs">Registered</Badge>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
      
      <div className="flex justify-center">
        <Button variant="outline" size="sm" asChild>
          <Link href="/calendar">View all</Link>
        </Button>
      </div>
    </div>
  );
}