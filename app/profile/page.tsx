"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Link as LinkIcon, MapPin, Pencil, Users, Calendar, Loader2, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { motion } from "framer-motion";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  location?: string;
  website?: string;
  emailVerified?: boolean;
  createdAt: string;
  stats: {
    communitiesOwned: number;
    communitiesJoined: number;
    eventsAttended: number;
    eventsCreated: number;
    followersCount: number;
    followingCount: number;
  };
}

interface Community {
  _id: string;
  name: string;
  handle: string;
  description: string;
  avatar: string;
  membersCount: number;
  isVerified: boolean;
  userRole: 'admin' | 'member';
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
  status: 'upcoming' | 'past';
  userRegistered: boolean;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchProfileData();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const fetchProfileData = async () => {
    try {
      const [profileResponse, communitiesResponse, eventsResponse] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/communities'),
        fetch('/api/user/events')
      ]);

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUserProfile(profileData);
      }

      if (communitiesResponse.ok) {
        const communitiesData = await communitiesResponse.json();
        setCommunities(communitiesData);
      }

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-200px)] flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">Please Sign In</h1>
        <p className="text-muted-foreground mb-4">You need to be signed in to view this page.</p>
        <Button asChild>
          <Link href="/auth/signin">Sign In</Link>
        </Button>
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

  if (!userProfile) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-200px)] flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">Profile Not Found</h1>
        <p className="text-muted-foreground">Unable to load your profile data.</p>
      </div>
    );
  }

  const upcomingEvents = events.filter(event => event.status === 'upcoming');
  const pastEvents = events.filter(event => event.status === 'past');
  const ownedCommunities = communities.filter(community => community.userRole === 'admin');
  const joinedCommunities = communities.filter(community => community.userRole === 'member');

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="relative h-48 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 md:h-64">
          <div className="absolute inset-x-0 bottom-0 flex items-end p-6">
            <div className="relative flex items-end">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={userProfile.image || ""} />
                <AvatarFallback>{userProfile.name?.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="ml-6 pb-3">
                <h1 className="text-2xl font-bold text-white md:text-3xl">
                  {userProfile.name}
                </h1>
                <p className="text-white/90">{userProfile.email}</p>
                {userProfile.bio && (
                  <p className="text-white/80 mt-1">{userProfile.bio}</p>
                )}
              </div>
            </div>
          </div>
          <div className="absolute top-4 right-4">
            <Button asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users size={16} />
              <span>{userProfile.stats.followersCount} followers</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={16} />
              <span>{userProfile.stats.followingCount} following</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarDays size={16} />
              <span>Joined {new Date(userProfile.createdAt).toLocaleDateString()}</span>
            </div>
            {userProfile.location && (
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>{userProfile.location}</span>
              </div>
            )}
            {userProfile.website && (
              <div className="flex items-center gap-1">
                <LinkIcon size={16} />
                <a 
                  href={userProfile.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {new URL(userProfile.website).hostname}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{userProfile.stats.communitiesOwned}</div>
            <div className="text-sm text-muted-foreground">Communities Owned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{userProfile.stats.communitiesJoined}</div>
            <div className="text-sm text-muted-foreground">Communities Joined</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{userProfile.stats.eventsCreated}</div>
            <div className="text-sm text-muted-foreground">Events Created</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{userProfile.stats.eventsAttended}</div>
            <div className="text-sm text-muted-foreground">Events Attended</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-6">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events ({upcomingEvents.length})</CardTitle>
                <CardDescription>Events you're registered for</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No upcoming events</p>
                    <Button asChild className="mt-4">
                      <Link href="/explore">Discover Events</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                              <h3 className="text-lg font-bold">{event.title}</h3>
                            </div>
                            <div className="absolute top-4 right-4">
                              <Badge className="bg-green-500 text-white">Registered</Badge>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={event.community.avatar} />
                                <AvatarFallback>{event.community.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{event.community.name}</span>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{event.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{event.location}</span>
                              </div>
                            </div>
                            <Button asChild className="w-full mt-3" size="sm">
                              <Link href={`/events/${event._id}`}>View Event</Link>
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Past Events ({pastEvents.length})</CardTitle>
                  <CardDescription>Events you've attended</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pastEvents.slice(0, 6).map((event, index) => (
                      <motion.div
                        key={event._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
                          <div className="relative">
                            <div 
                              className="h-24 w-full bg-gradient-to-r from-gray-400 to-gray-600"
                              style={{
                                backgroundImage: event.image 
                                  ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${event.image})`
                                  : undefined,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                            />
                            <div className="absolute bottom-0 left-0 p-3 text-white">
                              <h4 className="font-medium">{event.title}</h4>
                            </div>
                          </div>
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={event.community.avatar} />
                                <AvatarFallback>{event.community.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-medium">{event.community.name}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {event.date}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                  {pastEvents.length > 6 && (
                    <div className="text-center mt-4">
                      <Button variant="outline">View All Past Events</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="communities">
          <div className="space-y-6">
            {/* Owned Communities */}
            {ownedCommunities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Communities You Own ({ownedCommunities.length})</CardTitle>
                  <CardDescription>Communities where you're an admin</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ownedCommunities.map((community, index) => (
                      <motion.div
                        key={community._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar>
                                <AvatarImage src={community.avatar} />
                                <AvatarFallback>{community.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Link href={`/communities/${community.handle}`} className="font-medium hover:underline">
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
                              <Badge className="bg-red-500 text-white">Admin</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {community.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                {community.membersCount} members
                              </span>
                              <Button asChild size="sm">
                                <Link href={`/communities/${community.handle}`}>Manage</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Joined Communities */}
            <Card>
              <CardHeader>
                <CardTitle>Communities You've Joined ({joinedCommunities.length})</CardTitle>
                <CardDescription>Communities where you're a member</CardDescription>
              </CardHeader>
              <CardContent>
                {joinedCommunities.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No communities joined yet</p>
                    <Button asChild className="mt-4">
                      <Link href="/explore">Explore Communities</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {joinedCommunities.map((community, index) => (
                      <motion.div
                        key={community._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar>
                                <AvatarImage src={community.avatar} />
                                <AvatarFallback>{community.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Link href={`/communities/${community.handle}`} className="font-medium hover:underline">
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
                              <Badge className="bg-blue-500 text-white">Member</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {community.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                {community.membersCount} members
                              </span>
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/communities/${community.handle}`}>View</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent actions and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Activity tracking coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}