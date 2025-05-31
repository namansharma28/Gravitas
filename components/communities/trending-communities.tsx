"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { mockTrendingCommunities } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export default function TrendingCommunities() {
  const [following, setFollowing] = useState<Record<string, boolean>>({});

  const toggleFollow = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFollowing(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="space-y-4">
      {mockTrendingCommunities.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">No trending communities</p>
          <Button variant="link" className="mt-2" asChild>
            <Link href="/explore">Explore</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {mockTrendingCommunities.map((community) => (
            <Link 
              key={community.id}
              href={`/communities/${community.handle}`}
              className="group flex items-center gap-3 rounded-lg border p-3 transition-all hover:bg-accent"
            >
              <Avatar>
                <AvatarImage src={community.avatar} />
                <AvatarFallback>{community.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{community.name}</p>
                  {community.isVerified && (
                    <Badge variant="outline" className="h-4 border-blue-300 px-1 text-[10px] text-blue-500 dark:border-blue-700 dark:text-blue-400">
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">@{community.handle}</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Users size={12} />
                  <span>{community.members} members</span>
                </div>
              </div>
              <Button
                size="sm"
                variant={following[community.id] ? "default" : "outline"}
                onClick={(e) => toggleFollow(community.id, e)}
                className="h-8 text-xs"
              >
                {following[community.id] ? "Following" : "Follow"}
              </Button>
            </Link>
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