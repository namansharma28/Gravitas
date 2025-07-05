"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Heart, Users, Calendar, MapPin, Loader2, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { motion } from "framer-motion";

interface Community {
  _id: string;
  name: string;
  handle: string;
  description: string;
  avatar: string;
  banner: string;
  location?: string;
  membersCount: number;
  followersCount: number;
  isVerified: boolean;
  upcomingEventsCount: number;
  followedAt: string;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  community: {
    name: string;
    handle: string;
    avatar: string;
  };
  registrationCount: number;
  capacity: number;
  userRegistered: boolean;
}

export default function FollowingPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [followedCommunities, setFollowedCommunities] = useState<Community[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("communities");

  useEffect(() => {
    if (session) {
      fetchFollowedData();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const fetchFollowedData = async () => {
    try {
      const [communitiesResponse, eventsResponse] = await Promise.all([
        fetch('/api/following/communities'),
        fetch('/api/following/events')
      ]);

      if (communitiesResponse.ok) {
        const communitiesData = await communitiesResponse.json();
        setFollowedCommunities(communitiesData);
      }

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setUpcomingEvents(eventsData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load following data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollow = async (communityHandle: string) => {
    try {
      const response = await fetch(`/api/communities/${communityHandle}/follow`, {
        method: 'POST',
      });

      if (response.ok) {
        setFollowedCommunities(prev => 
          prev.filter(community => community.handle !== communityHandle)
        );
        
        toast({
          title: "Unfollowed community",
          description: "You'll no longer see updates from this community",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unfollow community",
        variant: "destructive",
      });
    }
  };

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Following</h1>
          <p className="text-muted-foreground">Communities and events you follow</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Sign in to see your following</h3>
            <p className="text-muted-foreground text-center mb-4">
              Sign in to view communities you follow and their upcoming events
            </p>
            <Button asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Following</h1>
        <p className="text-muted-foreground">
          Communities and events from {followedCommunities.length} communities you follow
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="communities">
            Communities ({followedCommunities.length})
          </TabsTrigger>
          <TabsTrigger value="events">
            Upcoming Events ({upcomingEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="communities" className="mt-0">
          {followedCommunities.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No communities followed</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start following communities to see their updates and events here
                </p>
                <Button asChild>
                  <Link href="/explore">Explore Communities</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {followedCommunities.map((community, index) => (
                <motion.div
                  key={community._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <div 
                        className="h-32 w-full bg-gradient-to-r from-blue-500 to-purple-600"
                        style={{
                          backgroundImage: community.banner 
                            ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${community.banner})`
                            : undefined,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                      <div className="absolute -bottom-6 left-4">
                        <Avatar className="h-12 w-12 border-4 border-background">
                          <AvatarImage src={community.avatar} />
                          <AvatarFallback>{community.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-purple-500 text-white">
                          <Heart className="w-3 h-3 mr-1" />
                          Following
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="pt-8 pb-4">
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/communities/${community.handle}`} className="font-semibold hover:underline">
                            {community.name}
                          </Link>
                          {community.isVerified && (
                            <Badge variant="outline" className="border-blue-300 text-blue-500">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">@{community.handle}</p>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {community.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{community.membersCount} members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{community.upcomingEventsCount} events</span>
                        </div>
                        {community.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{community.location}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button asChild className="flex-1" size="sm">
                          <Link href={`/communities/${community.handle}`}>
                            View
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnfollow(community.handle)}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>

                      <p className="text-xs text-muted-foreground mt-2">
                        Following since {new Date(community.followedAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="events" className="mt-0">
          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No upcoming events</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Communities you follow don't have any upcoming events yet
                </p>
                <Button asChild>
                  <Link href="/explore">Discover More Communities</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
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
                        <Badge className="mb-1 bg-primary/80">Event</Badge>
                        <h3 className="text-lg font-bold">{event.title}</h3>
                      </div>
                      {event.userRegistered && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-green-500 text-white">Registered</Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={event.community.avatar} />
                          <AvatarFallback>{event.community.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <Link href={`/communities/${event.community.handle}`} className="text-sm font-medium hover:underline">
                          {event.community.name}
                        </Link>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {event.description}
                      </p>

                      <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{event.registrationCount}/{event.capacity}</span>
                        </div>
                        <div className="text-xs">
                          {event.time}
                        </div>
                      </div>

                      <Button asChild className="w-full" size="sm">
                        <Link href={`/events/${event._id}`}>
                          View Event
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}