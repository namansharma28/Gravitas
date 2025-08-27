"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { handleApiResponse } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Community {
  _id: string;
  name: string;
  handle: string;
  avatar: string;
  description: string;
  membersCount: number;
  isVerified: boolean;
  userRelation?: 'member' | 'follower' | 'admin' | 'none';
}

export default function TrendingCommunities() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchTrendingCommunities();
  }, []);

  const fetchTrendingCommunities = async () => {
    try {
      const response = await fetch('/api/home/trending-communities');
      const data = await handleApiResponse<Community[]>(response, {
        router,
        toast,
        errorMessage: {
          title: "Error",
          description: "Failed to fetch trending communities"
        }
      });
      
      if (data) {
        setCommunities(data);
        
        // Initialize following states
        const followingMap: Record<string, boolean> = {};
        data.forEach((community: Community) => {
          followingMap[community._id] = community.userRelation === 'follower';
        });
        setFollowingStates(followingMap);
      }
    } catch (error) {
      console.error('Error fetching trending communities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFollow = async (communityId: string, communityHandle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

      const data = await handleApiResponse<{following: boolean}>(response, {
        router,
        toast,
        errorMessage: {
          title: "Error",
          description: "Failed to follow/unfollow community"
        },
        redirectOnAuthError: true
      });
      
      if (data) {
        setFollowingStates(prev => ({
          ...prev,
          [communityId]: data.following
        }));

        toast({
          title: data.following ? "Following community" : "Unfollowed community",
          description: data.following 
            ? "You'll now see updates from this community" 
            : "You'll no longer see updates from this community",
        });
      }
    } catch (error) {
      // Error is already handled by handleApiResponse
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
      {communities.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">No trending communities</p>
          <Button variant="link" className="mt-2" asChild>
            <Link href="/explore">Explore</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {communities.map((community, index) => (
            <motion.div
              key={community._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                href={`/communities/${community.handle}`}
                className="group flex items-center gap-3 rounded-lg border p-3 transition-all hover:bg-accent hover:shadow-md"
              >
                <Avatar className="transition-transform group-hover:scale-105">
                  <AvatarImage src={community.avatar} />
                  <AvatarFallback>{community.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium group-hover:text-primary transition-colors">{community.name}</p>
                    {community.isVerified && (
                      <Badge variant="outline" className="h-4 border-blue-300 dark:border-blue-700 px-1 text-[10px] text-blue-500 dark:text-blue-400">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">@{community.handle}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Users size={12} />
                    <span>{community.membersCount} members</span>
                  </div>
                </div>
                {session && community.userRelation !== 'member' && community.userRelation !== 'admin' && (
                  <Button
                    size="sm"
                    variant={followingStates[community._id] ? "default" : "outline"}
                    onClick={(e) => toggleFollow(community._id, community.handle, e)}
                    className="h-8 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {followingStates[community._id] ? "Following" : "Follow"}
                  </Button>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
      
      <div className="flex justify-center">
        <Button variant="outline" size="sm" asChild>
          <Link href="/explore">Discover more</Link>
        </Button>
      </div>
    </div>
  );
}