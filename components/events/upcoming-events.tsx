"use client";

import { useState } from "react";
import { Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { mockUpcomingEvents } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function UpcomingEvents() {
  const [activeEvent, setActiveEvent] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {mockUpcomingEvents.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">No upcoming events</p>
          <Button variant="link" className="mt-2" asChild>
            <Link href="/explore">Discover events</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {mockUpcomingEvents.map((event) => (
            <Link 
              key={event.id}
              href={`/events/${event.id}`}
              className={cn(
                "group block rounded-lg border p-3 transition-all hover:bg-accent",
                activeEvent === event.id ? "ring-2 ring-ring" : ""
              )}
              onMouseEnter={() => setActiveEvent(event.id)}
              onMouseLeave={() => setActiveEvent(null)}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="h-12 w-12 rounded-md bg-gradient-to-r from-blue-500 to-indigo-600"
                  style={{
                    backgroundImage: event.image 
                      ? `url(${event.image})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="flex-1 space-y-1">
                  <p className="line-clamp-1 font-medium">{event.title}</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={event.community.avatar} />
                      <AvatarFallback>{event.community.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-muted-foreground">{event.community.name}</p>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{event.time}</span>
                </div>
              </div>
            </Link>
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