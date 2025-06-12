"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Edit, Share2, Users, UserPlus, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CommunityHeaderProps {
  community: {
    id: string;
    name: string;
    handle: string;
    description: string;
    banner: string;
    avatar: string;
    membersCount: number;
    followersCount: number;
    isVerified: boolean;
  };
  userPermissions: {
    isVisitor: boolean;
    isUser: boolean;
    isMember: boolean;
    isFollower: boolean;
    isAdmin: boolean;
    canEdit: boolean;
    canCreateEvents: boolean;
    canFollow: boolean;
  };
}

export default function CommunityHeader({ community, userPermissions }: CommunityHeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(userPermissions.isFollower);
  const [isLoading, setIsLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(community.followersCount);

  const handleFollow = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/communities/${community.handle}/follow`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.following);
        setFollowersCount(prev => data.following ? prev + 1 : prev - 1);
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
    } finally {
      setIsLoading(false);
    }
  };

  const getActionButtons = () => {
    if (userPermissions.isVisitor) {
      return (
        <div className="flex gap-2">
          <Button onClick={() => router.push('/auth/signin')}>
            Sign in to Follow
          </Button>
        </div>
      );
    }

    if (userPermissions.isAdmin) {
      return (
        <div className="flex gap-2">
          <Button onClick={() => router.push(`/communities/${community.handle}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Community
          </Button>
          <Button onClick={() => router.push(`/communities/${community.handle}/events/create`)}>
            <CalendarDays className="mr-2 h-4 w-4" />
            Create Event
          </Button>
          <Button variant="outline">
            <UserPlus className="mr-2 h-4 w-4" />
            Manage Members
          </Button>
        </div>
      );
    }

    if (userPermissions.isMember) {
      return (
        <div className="flex gap-2">
          <Button onClick={() => router.push(`/communities/${community.handle}/events/create`)}>
            <CalendarDays className="mr-2 h-4 w-4" />
            Create Event
          </Button>
          <Badge variant="secondary" className="px-3 py-1">
            <Users className="mr-1 h-3 w-3" />
            Member
          </Badge>
        </div>
      );
    }

    // Regular user (not member)
    return (
      <div className="flex gap-2">
        <Button 
          onClick={handleFollow}
          disabled={isLoading}
          variant={isFollowing ? "default" : "outline"}
        >
          <Heart className={`mr-2 h-4 w-4 ${isFollowing ? 'fill-current' : ''}`} />
          {isFollowing ? "Following" : "Follow"}
        </Button>
      </div>
    );
  };

  return (
    <div className="mb-6 space-y-6">
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
                <h1 className="text-2xl font-bold text-white md:text-3xl">
                  {community.name}
                </h1>
                {community.isVerified && (
                  <Badge className="border-blue-300 bg-blue-500/10 text-white">
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-white/90">@{community.handle}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{community.membersCount} members</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Heart className="h-4 w-4" />
            <span>{followersCount} followers</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>10 upcoming events</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getActionButtons()}
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}