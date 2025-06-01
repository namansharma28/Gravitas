"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Globe, Mail, MapPin, Share2, Users, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Community {
  id: string;
  name: string;
  handle: string;
  description: string;
  banner: string;
  avatar: string;
  website?: string;
  location?: string;
  members: string[];
  admins: string[];
  isVerified: boolean;
  createdAt: string;
}

export default function CommunityPage({ params }: { params: { handle: string } }) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [community, setCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const response = await fetch(`/api/communities/${params.handle}`);
        if (response.ok) {
          const data = await response.json();
          setCommunity(data);
        } else {
          throw new Error('Community not found');
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

    fetchCommunity();
  }, [params.handle, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-200px)] flex-col items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading community...</p>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-200px)] flex-col items-center justify-center py-10">
        <h1 className="text-3xl font-bold">Community Not Found</h1>
        <p className="mb-6 text-muted-foreground">The community you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/explore">Explore Communities</Link>
        </Button>
      </div>
    );
  }

  const isAdmin = session?.user?.id && community.admins.includes(session.user.id);

  return (
    <div className="container mx-auto pb-16">
      <div className="mb-6 space-y-6">
        {/* Header/Banner */}
        <div className="relative h-48 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 md:h-64">
          {community.banner && (
            <img
              src={community.banner}
              alt={`${community.name} banner`}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-end p-6">
            <div className="relative flex items-end">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={community.avatar} />
                <AvatarFallback>{community.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="ml-6 pb-3">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white md:text-3xl">{community.name}</h1>
                  {community.isVerified && (
                    <Badge className="border-blue-300 bg-blue-500/10 text-white">Verified</Badge>
                  )}
                </div>
                <p className="text-sm text-white/90">@{community.handle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Community Info */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="col-span-2">
            <p className="text-lg">{community.description}</p>
          </div>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center md:justify-end">
            {!isAdmin && (
              <Button 
                size="lg" 
                className="gap-1"
                onClick={() => setIsFollowing(!isFollowing)}
              >
                <Users size={16} />
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
            <Button variant="outline" size="icon">
              <Share2 size={16} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Card>
            <CardContent className="flex flex-row items-center gap-2 p-4">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Members</p>
                <p className="font-medium">{community.members.length.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
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
      </div>

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-0">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">This community hasn't posted any updates yet.</p>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
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
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No events scheduled yet.</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="mt-0">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {community.members.map((memberId, index) => (
                  <div key={memberId} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted">
                    <Avatar>
                      <AvatarFallback>
                        {String.fromCharCode(65 + index % 26)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        Member {index + 1}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {community.admins.includes(memberId) ? "Admin" : "Member"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}