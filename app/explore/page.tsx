"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Search, Filter, Users, MapPin, Calendar, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  website?: string;
  membersCount: number;
  followersCount: number;
  isVerified: boolean;
  createdAt: string;
  userRelation?: 'member' | 'follower' | 'admin' | 'none';
  upcomingEventsCount: number;
}

export default function ExplorePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [filterBy, setFilterBy] = useState("all");
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchCommunities();
  }, []);

  useEffect(() => {
    filterAndSortCommunities();
  }, [communities, searchQuery, sortBy, filterBy]);

  const fetchCommunities = async () => {
    try {
      const response = await fetch('/api/explore/communities');
      if (response.ok) {
        const data = await response.json();
        setCommunities(data);
        
        // Initialize following states
        const followingMap: Record<string, boolean> = {};
        data.forEach((community: Community) => {
          followingMap[community._id] = community.userRelation === 'follower';
        });
        setFollowingStates(followingMap);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load communities",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortCommunities = () => {
    let filtered = [...communities];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(community =>
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.handle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filterBy !== "all") {
      filtered = filtered.filter(community => {
        switch (filterBy) {
          case "verified":
            return community.isVerified;
          case "new":
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(community.createdAt) > weekAgo;
          case "active":
            return community.upcomingEventsCount > 0;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return (b.membersCount + b.followersCount) - (a.membersCount + a.followersCount);
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "alphabetical":
          return a.name.localeCompare(b.name);
        case "events":
          return b.upcomingEventsCount - a.upcomingEventsCount;
        default:
          return 0;
      }
    });

    setFilteredCommunities(filtered);
  };

  const handleFollow = async (communityId: string, communityHandle: string) => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow communities",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/communities/${communityHandle}/follow`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setFollowingStates(prev => ({
          ...prev,
          [communityId]: data.following
        }));

        // Update community in the list
        setCommunities(prev => prev.map(community => 
          community._id === communityId 
            ? { 
                ...community, 
                followersCount: data.following 
                  ? community.followersCount + 1 
                  : community.followersCount - 1,
                userRelation: data.following ? 'follower' : 'none'
              }
            : community
        ));

        toast({
          title: data.following ? "Following community" : "Unfollowed community",
          description: data.following 
            ? "You'll now see updates from this community" 
            : "You'll no longer see updates from this community",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to follow/unfollow community",
        variant: "destructive",
      });
    }
  };

  const getRelationshipBadge = (community: Community) => {
    switch (community.userRelation) {
      case 'admin':
        return <Badge className="bg-red-500 text-white">Admin</Badge>;
      case 'member':
        return <Badge className="bg-blue-500 text-white">Member</Badge>;
      case 'follower':
        return <Badge className="bg-purple-500 text-white">Following</Badge>;
      default:
        return null;
    }
  };

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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Explore Communities</h1>
            <p className="text-muted-foreground">Discover and join communities that match your interests</p>
          </div>
          <Button asChild>
            <Link href="/communities/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Community
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="alphabetical">A-Z</SelectItem>
                <SelectItem value="events">Most Active</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="active">Active</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {filteredCommunities.length} of {communities.length} communities
        </p>
      </div>

      {filteredCommunities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No communities found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery 
                ? "Try adjusting your search terms or filters"
                : "Be the first to create a community!"
              }
            </p>
            <Button asChild>
              <Link href="/communities/create">Create Community</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map((community, index) => (
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
                    {getRelationshipBadge(community)}
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
                    {session && community.userRelation !== 'member' && community.userRelation !== 'admin' && (
                      <Button
                        variant={followingStates[community._id] ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFollow(community._id, community.handle)}
                      >
                        {followingStates[community._id] ? "Following" : "Follow"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}