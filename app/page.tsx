"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Compass, Users, Plus, Loader2, Clock, MapPin, Heart, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface FeedItem {
  _id: string;
  type: 'event' | 'update';
  title: string;
  content: string;
  community: {
    name: string;
    handle: string;
    avatar: string;
  };
  createdAt: string;
  eventDate?: string;
  eventId?: string;
  image?: string;
}

interface UpcomingEvent {
  _id: string;
  title: string;
  date: string;
  time: string;
  community: {
    name: string;
    handle: string;
    avatar: string;
  };
  image?: string;
  userRegistered: boolean;
}

interface TrendingCommunity {
  _id: string;
  name: string;
  handle: string;
  avatar: string;
  description: string;
  membersCount: number;
  isVerified: boolean;
  userRelation?: 'member' | 'follower' | 'admin' | 'none';
}

export default function Home() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [trendingCommunities, setTrendingCommunities] = useState<TrendingCommunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchHomeData();
  }, [session]);

  const fetchHomeData = async () => {
    try {
      const [feedResponse, eventsResponse, communitiesResponse] = await Promise.all([
        fetch('/api/feed'),
        fetch('/api/home/upcoming-events'),
        fetch('/api/home/trending-communities')
      ]);

      if (feedResponse.ok) {
        const feedData = await feedResponse.json();
        setFeedItems(feedData);
      }

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setUpcomingEvents(eventsData);
      }

      if (communitiesResponse.ok) {
        const communitiesData = await communitiesResponse.json();
        setTrendingCommunities(communitiesData);
        
        // Initialize following states
        const followingMap: Record<string, boolean> = {};
        communitiesData.forEach((community: TrendingCommunity) => {
          followingMap[community._id] = community.userRelation === 'follower';
        });
        setFollowingStates(followingMap);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setIsLoading(false);
    }
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const handleCardClick = (item: FeedItem) => {
    if (item.type === 'event') {
      window.location.href = `/events/${item._id}`;
    } else {
      window.location.href = `/updates/${item._id}`;
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
    <div className="container mx-auto space-y-8 py-6">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 pb-8"
      >
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-blue-600 to-purple-600 dark:from-primary dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            {session ? `Welcome back, ${session.user?.name?.split(' ')[0]}!` : 'Welcome to Eventify'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {session 
              ? "Discover what's happening in your communities and never miss an event" 
              : "Connect with communities, discover amazing events, and build meaningful relationships"
            }
          </p>
          {!session && (
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/signup">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/explore">Explore Communities</Link>
              </Button>
            </div>
          )}
        </div>
      </motion.section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {/* Feed Section */}
          <Card className="overflow-hidden shadow-lg">
            <CardHeader className="bg-muted/50 border-b">
              <CardTitle className="text-2xl font-bold">Your Feed</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!session ? (
                <div className="text-center py-16 px-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Users className="h-20 w-20 text-blue-500 dark:text-blue-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold mb-4">Join the Community</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Sign in to see personalized updates from communities you follow and events you're interested in
                    </p>
                    <Button size="lg" asChild>
                      <Link href="/auth/signin">Sign In to Continue</Link>
                    </Button>
                  </motion.div>
                </div>
              ) : feedItems.length === 0 ? (
                <div className="text-center py-16 px-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <CalendarDays className="h-20 w-20 text-purple-500 dark:text-purple-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold mb-4">Your Feed Awaits</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Follow some communities to see their latest updates and events here
                    </p>
                    <Button size="lg" asChild>
                      <Link href="/explore">Discover Communities</Link>
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <div className="p-6 space-y-8">
                  <AnimatePresence>
                    {feedItems.map((item, index) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleCardClick(item)}
                        className="cursor-pointer"
                      >
                        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 shadow-md">
                          {item.type === "event" && item.image && (
                            <div 
                              className="relative h-48 w-full bg-gradient-to-r from-blue-500 to-purple-600"
                              style={{
                                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${item.image})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                            >
                              <div className="absolute inset-0 flex items-end p-6 text-white">
                                <div className="space-y-2">
                                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                                    🎉 Event
                                  </Badge>
                                  <h3 className="text-2xl font-bold leading-tight">{item.title}</h3>
                                  {item.eventDate && (
                                    <p className="flex items-center gap-2 text-white/90">
                                      <CalendarDays size={16} /> {item.eventDate}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="absolute top-4 right-4">
                                <Badge className="bg-green-500/90 text-white">
                                  Upcoming
                                </Badge>
                              </div>
                            </div>
                          )}

                          <CardContent className={`p-6 ${item.type === "event" && item.image ? "pt-4" : ""}`}>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                                  <AvatarImage src={item.community.avatar} />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                    {item.community.name.substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <Link 
                                    href={`/communities/${item.community.handle}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="font-semibold hover:text-primary transition-colors"
                                  >
                                    {item.community.name}
                                  </Link>
                                  <p className="text-sm text-muted-foreground">@{item.community.handle}</p>
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatTimeAgo(item.createdAt)}
                              </div>
                            </div>

                            {item.type === "update" && (
                              <h4 className="text-xl font-bold mb-3">{item.title}</h4>
                            )}

                            <p className="text-foreground/80 dark:text-foreground/90 leading-relaxed line-clamp-3 mb-4">
                              {item.content}
                            </p>

                            {item.eventId && item.type === "update" && (
                              <Link 
                                href={`/events/${item.eventId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="block"
                              >
                                <div className="mt-4 p-4 rounded-lg bg-muted border hover:border-primary/30 transition-colors">
                                  <p className="text-sm font-medium text-primary mb-1">📅 Related Event</p>
                                  <p className="font-semibold">{item.title}</p>
                                </div>
                              </Link>
                            )}

                            {/* Interaction Bar */}
                            <div className="flex items-center justify-between pt-4 border-t mt-4 border-border">
                              <div className="flex items-center gap-6">
                                <button 
                                  className="flex items-center gap-2 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Heart className="h-4 w-4" />
                                  <span className="text-sm">24</span>
                                </button>
                                <button 
                                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MessageCircle className="h-4 w-4" />
                                  <span className="text-sm">8</span>
                                </button>
                              </div>
                              <button 
                                className="flex items-center gap-2 text-muted-foreground hover:text-green-500 dark:hover:text-green-400 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Share2 className="h-4 w-4" />
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8 lg:col-span-4">
          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="overflow-hidden shadow-lg">
              <CardHeader className="bg-muted/50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CalendarDays className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Upcoming Events
                  </CardTitle>
                  <Link href="/calendar">
                    <Button variant="ghost" size="sm" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8 px-6">
                    <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">No upcoming events</p>
                    <Button asChild size="sm">
                      <Link href="/explore">Discover Events</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {upcomingEvents.slice(0, 3).map((event, index) => (
                      <motion.div
                        key={event._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <Link 
                          href={`/events/${event._id}`}
                          className="block rounded-lg border p-4 transition-all hover:shadow-md hover:border-primary/30 bg-card"
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="h-14 w-14 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex-shrink-0 flex items-center justify-center"
                              style={{
                                backgroundImage: event.image 
                                  ? `url(${event.image})`
                                  : undefined,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                            >
                              {!event.image && (
                                <CalendarDays className="h-6 w-6 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{event.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Avatar className="h-4 w-4">
                                  <AvatarImage src={event.community.avatar} />
                                  <AvatarFallback>{event.community.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <p className="text-xs text-muted-foreground truncate">{event.community.name}</p>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                                <div className="flex items-center gap-1">
                                  <CalendarDays className="h-3 w-3" />
                                  <span>{event.date}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{event.time}</span>
                                </div>
                              </div>
                            </div>
                            {event.userRegistered && (
                              <Badge className="bg-green-500 dark:bg-green-600 text-white text-xs">
                                ✓ Registered
                              </Badge>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Trending Communities */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="overflow-hidden shadow-lg">
              <CardHeader className="bg-muted/50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Compass className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    Trending Communities
                  </CardTitle>
                  <Link href="/explore">
                    <Button variant="ghost" size="sm" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                      Explore
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {trendingCommunities.length === 0 ? (
                  <div className="text-center py-8 px-6">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">No trending communities</p>
                    <Button asChild size="sm">
                      <Link href="/explore">Explore</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {trendingCommunities.slice(0, 4).map((community, index) => (
                      <motion.div
                        key={community._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center gap-3 rounded-lg border p-3 transition-all hover:shadow-md hover:border-primary/30 bg-card"
                      >
                        <Avatar className="ring-2 ring-primary/10">
                          <AvatarImage src={community.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                            {community.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/communities/${community.handle}`} 
                              className="font-semibold hover:text-primary transition-colors truncate"
                            >
                              {community.name}
                            </Link>
                            {community.isVerified && (
                              <Badge variant="outline" className="h-4 border-blue-300 dark:border-blue-700 px-1 text-[10px] text-blue-500 dark:text-blue-400">
                                ✓
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">@{community.handle}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Users size={10} />
                            <span>{community.membersCount} members</span>
                          </div>
                        </div>
                        {session && community.userRelation !== 'member' && community.userRelation !== 'admin' && (
                          <Button
                            size="sm"
                            variant={followingStates[community._id] ? "default" : "outline"}
                            onClick={(e) => {
                              e.preventDefault();
                              handleFollow(community._id, community.handle);
                            }}
                            className="h-7 text-xs px-3"
                          >
                            {followingStates[community._id] ? "Following" : "Follow"}
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Create Community CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="overflow-hidden shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-500 dark:from-primary dark:to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-2">Start Your Community</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a space for people who share your interests and passions
                </p>
                <Button asChild className="w-full bg-gradient-to-r from-primary to-purple-500 dark:from-primary dark:to-purple-400 hover:from-primary/90 hover:to-purple-500/90 dark:hover:from-primary/90 dark:hover:to-purple-400/90 text-primary-foreground">
                  <Link href="/communities/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Community
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}