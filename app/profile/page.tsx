"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Link as LinkIcon, MapPin, Pencil, Users } from "lucide-react";
import { mockUpcomingEvents } from "@/lib/mock-data";
import CalendarEventCard from "@/components/events/calendar-event-card";

export default function ProfilePage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-200px)] flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">Please Sign In</h1>
        <p className="text-muted-foreground">You need to be signed in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="relative h-48 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 md:h-64">
          <div className="absolute inset-x-0 bottom-0 flex items-end p-6">
            <div className="relative flex items-end">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={session.user?.image || ""} />
                <AvatarFallback>{session.user?.name?.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="ml-6 pb-3">
                <h1 className="text-2xl font-bold text-white md:text-3xl">
                  {session.user?.name}
                </h1>
                <p className="text-white/90">{session.user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button variant="outline" className="gap-2">
            <Pencil size={16} /> Edit Profile
          </Button>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users size={16} />
              <span>2.1k followers</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarDays size={16} />
              <span>Joined April 2024</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              <span>San Francisco, CA</span>
            </div>
            <div className="flex items-center gap-1">
              <LinkIcon size={16} />
              <a href="#" className="hover:underline">website.com</a>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="events" className="space-y-6">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockUpcomingEvents.map(event => (
              <CalendarEventCard key={event.id} event={event} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="communities">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>Community {i + 1}</CardTitle>
                  <CardDescription>Active Member</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Community details and activity...</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This is where your bio would go. Tell others about yourself, your interests,
                and what kind of events you enjoy attending or organizing.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}