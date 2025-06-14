"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, MapPin, Calendar, Clock, Users, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CommunityHeader from "@/components/communities/community-header";
import AddMemberDialog from "@/components/communities/add-member-dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StructuredData from '@/components/seo/structured-data';

interface Community {
  id: string;
  name: string;
  handle: string;
  description: string;
  banner: string;
  avatar: string;
  website?: string;
  location?: string;
  membersCount: number;
  followersCount: number;
  isVerified: boolean;
  createdAt: string;
}

interface UserPermissions {
  isVisitor: boolean;
  isUser: boolean;
  isMember: boolean;
  isFollower: boolean;
  isAdmin: boolean;
  canEdit: boolean;
  canCreateEvents: boolean;
  canCreateForms: boolean;
  canCreateUpdates: boolean;
  canManageMembers: boolean;
  canViewMembers: boolean;
  canFollow: boolean;
}

interface Member {
  id: string;
  name: string;
  image: string;
  email: string;
  isAdmin: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  image?: string;
  attendees: string[];
  interested: string[];
}

export default function CommunityPage({ params }: { params: { handle: string } }) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [community, setCommunity] = useState<Community | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCommunityData = async () => {
    try {
      // Fetch community permissions and data
      const permissionsResponse = await fetch(`/api/communities/${params.handle}/permissions`);
      if (permissionsResponse.ok) {
        const permissionsData = await permissionsResponse.json();
        setCommunity(permissionsData.community);
        setUserPermissions(permissionsData.userPermissions);
      } else {
        throw new Error('Community not found');
      }

      // Fetch member details if user has permission
      const membersResponse = await fetch(`/api/communities/${params.handle}/members`);
      if (membersResponse.ok) {
        const memberData = await membersResponse.json();
        setMembers(memberData);
      }

      // Fetch events
      const eventsResponse = await fetch(`/api/communities/${params.handle}/events`);
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData);
      }
    } catch (error) {
      console.error('Error fetching community:', error);
      toast({
        title: "Error",
        description: "Failed to load community data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityData();
  }, [params.handle, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-200px)] flex-col items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading community...</p>
      </div>
    );
  }

  if (!community || !userPermissions) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-200px)] flex-col items-center justify-center py-10">
        <h1 className="text-3xl font-bold">Community Not Found</h1>
        <p className="mb-6 text-muted-foreground">The community you&apos;re looking for doesn&apos;t exist.</p>
        <Button asChild>
          <Link href="/explore">Explore Communities</Link>
        </Button>
      </div>
    );
  }

  const getTabsList = () => {
    const tabs = [
      { value: "feed", label: "Feed" },
      { value: "events", label: "Events" },
    ];

    // Only show members tab if user can view members
    if (userPermissions.canViewMembers) {
      tabs.push({ value: "members", label: "Members" });
    }

    // Only show settings tab for members and admins
    if (userPermissions.isMember || userPermissions.isAdmin) {
      tabs.push({ value: "settings", label: "Settings" });
    }

    return tabs;
  };

  return (
    <>
      <StructuredData
        type="community"
        data={{
          name: community.name,
          description: community.description,
          handle: community.handle,
          memberCount: community.membersCount,
          createdAt: new Date(community.createdAt).toISOString(),
          image: community.avatar,
        }}
      />
      <div className="container mx-auto pb-16">
        <CommunityHeader community={community} userPermissions={userPermissions} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {community.location && (
            <Card>
              <CardContent className="flex flex-row items-center gap-2 p-4">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{community.location}</p>
                </div>
              </CardContent>
            </Card>
          )}
          {community.website && (
            <Card>
              <CardContent className="flex flex-row items-center gap-2 p-4">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <a 
                    href={community.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {new URL(community.website).hostname}
                  </a>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs defaultValue="feed" className="mt-6">
          <TabsList className="mb-4 grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:w-[400px]">
            {getTabsList().map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="feed" className="mt-0">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                {userPermissions.isVisitor ? (
                  <Card className="p-4 sm:p-8 text-center">
                    <h3 className="mb-2 text-lg font-semibold">Join the Community</h3>
                    <p className="mb-4 text-muted-foreground">
                      Sign in to see updates and interact with this community.
                    </p>
                    <Button asChild>
                      <Link href="/auth/signin">Sign In</Link>
                    </Button>
                  </Card>
                ) : (
                  <Card className="p-4 sm:p-8 text-center">
                    <p className="text-muted-foreground">This community hasn&apos;t posted any updates yet.</p>
                    {userPermissions.canCreateUpdates && (
                      <Button className="mt-4">
                        <Plus className="mr-2 h-4 w-4" /> Create Update
                      </Button>
                    )}
                  </Card>
                )}
              </div>
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="mb-4 font-semibold">About {community.name}</h3>
                    <p className="text-sm">{community.description}</p>
                    <div className="mt-4">
                      <h4 className="mb-2 text-sm font-medium">Created</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(community.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-0">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userPermissions.canCreateEvents && (
                <Card className="p-6">
                  <CardContent className="flex flex-col items-center justify-center gap-4">
                    <Button className="w-full" asChild>
                      <Link href={`/communities/${community.handle}/events/create`}>
                        <Plus className="mr-2 h-4 w-4" /> Create Event
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {events.length > 0 ? (
                events.map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <Card className="transition-colors hover:bg-accent">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div 
                            className="h-20 w-20 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600"
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
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{event.attendees.length} going</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No events scheduled yet.</p>
                  {userPermissions.canCreateEvents && (
                    <Button className="mt-4" asChild>
                      <Link href={`/communities/${community.handle}/events/create`}>
                        Create Event
                      </Link>
                    </Button>
                  )}
                </Card>
              )}
            </div>
          </TabsContent>

          {userPermissions.canViewMembers && (
            <TabsContent value="members" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Members ({members.length})</h3>
                    {userPermissions.isAdmin && (
                      <AddMemberDialog 
                        communityHandle={community.handle} 
                        onMemberAdded={fetchCommunityData}
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted">
                        <Avatar>
                          <AvatarImage src={member.image} />
                          <AvatarFallback>
                            {member.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {member.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.isAdmin ? "Admin" : "Member"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {(userPermissions.isMember || userPermissions.isAdmin) && (
            <TabsContent value="settings" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  {userPermissions.isAdmin ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Community Settings</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage your community settings and permissions.
                      </p>
                      <div className="flex gap-2">
                        <Button asChild>
                          <Link href={`/communities/${community.handle}/edit`}>
                            Edit Community
                          </Link>
                        </Button>
                        <Button variant="outline">
                          Manage Members
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Member Settings</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage your membership settings.
                      </p>
                      <Button variant="destructive">
                        Leave Community
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </>
  );
}