"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Compass, Users, Plus, Loader2, Clock, MapPin, Heart, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { useEnhancedToast } from "@/components/ui/enhanced-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { FeedCardSkeleton } from "@/components/skeletons/feed-card-skeleton";
import { EmptyState } from "@/components/ui/empty-state";

// Dynamically import MD Viewer to avoid SSR issues
const Markdown = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  { ssr: false }
);

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
  eventTitle?: string;
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
  const { showToast } = useEnhancedToast();
  const { theme } = useTheme();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [trendingCommunities, setTrendingCommunities] = useState<TrendingCommunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  // Lazy loading states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [visibleItems, setVisibleItems] = useState<FeedItem[]>([]);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchHomeData();
  }, [session]);

  // Update visible items when feed items change
  useEffect(() => {
    const endIndex = page * itemsPerPage;
    setVisibleItems(feedItems.slice(0, endIndex));
    setHasMore(endIndex < feedItems.length);
  }, [feedItems, page]);

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

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    setPage(prev => prev + 1);
    setIsLoadingMore(false);
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById('feed-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [hasMore, isLoadingMore]);

  const handleFollow = async (communityId: string, communityHandle: string) => {
    if (!session) {
      showToast({
        title: "Sign in required",
        description: "Please sign in to follow communities",
        type: "error",
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

        showToast({
          title: data.following ? "Following community" : "Unfollowed community",
          description: data.following
            ? "You'll now see updates from this community"
            : "You'll no longer see updates from this community",
          type: "success",
        });
      }
    } catch (error) {
      showToast({
        title: "Error",
        description: "Failed to follow/unfollow community",
        type: "error",
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast({
      title: "Link copied",
      description: "Feed link copied to clipboard",
      type: "success",
    });
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
      <div className="container mx-auto space-y-8 py-6">
        {/* Hero Section Skeleton */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pb-8"
        >
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-[#91D6FF] via-blue-600 to-purple-600 dark:from-[#91D6FF] dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              {session ? `Welcome back, ${session.user?.name?.split(' ')[0]}!` : 'Welcome to Gravitas'}
            </h1>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            {[...Array(3)].map((_, i) => (
              <FeedCardSkeleton key={i} />
            ))}
          </div>
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
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-[#91D6FF] via-blue-600 to-purple-600 dark:from-[#91D6FF] dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            {session ? `Welcome back, ${session.user?.name?.split(' ')[0]}!` : 'Welcome to Gravitas'}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {session
              ? "Discover what's happening in your communities and never miss an event"
              : "Connect with communities, discover amazing events, and build meaningful relationships"
            }
          </p>
          {!session && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold">Your Feed</h2>
            </div>

            {!session ? (
              <div className="text-center py-16 px-4 md:px-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Users className="h-16 w-16 md:h-20 md:w-20 text-blue-500 dark:text-blue-400 mx-auto mb-6" />
                  <h3 className="text-xl md:text-2xl font-bold mb-4">Join the Community</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                    Sign in to see personalized updates from communities you follow and events you&apos;re interested in
                  </p>
                  <Button size="lg" asChild>
                    <Link href="/auth/signin">Sign In to Continue</Link>
                  </Button>
                </motion.div>
              </div>
            ) : feedItems.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Your Feed Awaits"
                description="Follow some communities to see their latest updates and events here"
                actionLabel="Discover Communities"
                actionHref="/explore"
              />
            ) : (
              <div className="space-y-6 md:space-y-8">
                <AnimatePresence>
                  {visibleItems.map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 shadow-md cursor-pointer"
                        onClick={() => handleCardClick(item)}
                      >
                        {item.type === "event" && item.image && (
                          <div
                            className="relative aspect-video w-full bg-gradient-to-r from-[#91D6FF] to-purple-600"
                            style={{
                              backgroundImage: `url(${item.image})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          >
                            <div className="absolute inset-0 flex items-end p-4 md:p-6 text-white">
                              <div className="space-y-2">
                                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30" style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)' }}>
                                  🎉 Event
                                </Badge>
                                <h3 className="text-xl md:text-2xl font-bold leading-tight" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 0px 0px 8px rgba(0, 0, 0, 0.6)' }}>{item.title}</h3>
                                {item.eventDate && (
                                  <p className="flex items-center gap-2 text-white/90" style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)' }}>
                                    <CalendarDays size={16} /> {item.eventDate}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="absolute top-4 right-4">
                              <Badge className="bg-green-500/90 text-white" style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)' }}>
                                Upcoming
                              </Badge>
                            </div>
                          </div>
                        )}

                        <CardContent className={`p-4 md:p-6 ${item.type === "event" && item.image ? "pt-4" : ""}`}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                                <AvatarImage src={item.community.avatar} />
                                <AvatarFallback className="bg-gradient-to-br from-[#91D6FF] to-purple-500 text-white">
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

                          <div className="prose prose-sm max-w-none dark:prose-invert mb-4">
                            <div data-color-mode={theme === "dark" ? "dark" : "light"}>
                              <Markdown source={item.content.length > 200 ? item.content.substring(0, 200) + "..." : item.content} />
                            </div>
                          </div>

                          {item.eventId && item.type === "update" && (
                            <Link
                              href={`/events/${item.eventId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="block"
                            >
                              <div className="mt-4 p-4 rounded-lg bg-muted border hover:border-primary/30 transition-colors">
                                <p className="text-sm font-medium text-primary mb-1">📅 Related Event</p>
                                <p className="font-semibold">{item.eventTitle}</p>
                              </div>
                            </Link>
                          )}

                          {/* Interaction Bar */}
                          <div className="flex items-center justify-between pt-4 border-t mt-4 border-border">
                            <div className="flex items-center gap-6">
                              <button
                                className="flex items-center gap-2 text-muted-foreground hover:text-green-500 dark:hover:text-green-400 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShare();
                                }}
                              >
                                <Share2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Mobile: Insert horizontal scroll sections after 2nd and 4th feed items */}
                      {index === 1 && (
                        <div className="md:hidden mt-6">
                          {/* Upcoming Events Horizontal Scroll */}
                          <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-bold flex items-center gap-2">
                                <CalendarDays className="h-5 w-5 text-green-600 dark:text-green-400" />
                                Upcoming Events
                              </h3>
                              <Link href="/calendar">
                                <Button variant="ghost" size="sm" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                                  View All
                                </Button>
                              </Link>
                            </div>
                            {upcomingEvents.length > 0 ? (
                              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {upcomingEvents.slice(0, 5).map((event, eventIndex) => (
                                  <motion.div
                                    key={event._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + eventIndex * 0.1 }}
                                    className="flex-shrink-0 w-72"
                                  >
                                    <Link
                                      href={`/events/${event._id}`}
                                      className="block rounded-lg border p-4 transition-all hover:shadow-md hover:border-primary/30 bg-card"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div
                                          className="aspect-video w-16 rounded-lg bg-gradient-to-r from-[#91D6FF] to-indigo-600 flex-shrink-0 flex items-center justify-center"
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
                                          <p className="font-semibold truncate text-sm">{event.title}</p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <Avatar className="h-3 w-3">
                                              <AvatarImage src={event.community.avatar} />
                                              <AvatarFallback>{event.community.name.substring(0, 2)}</AvatarFallback>
                                            </Avatar>
                                            <p className="text-xs text-muted-foreground truncate">{event.community.name}</p>
                                          </div>
                                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                            <div className="flex items-center gap-1">
                                              <CalendarDays className="h-3 w-3" />
                                              <span>{event.date}</span>
                                            </div>
                                          </div>
                                        </div>
                                        {event.userRegistered && (
                                          <Badge className="bg-green-500 dark:bg-green-600 text-white text-xs">
                                            ✓
                                          </Badge>
                                        )}
                                      </div>
                                    </Link>
                                  </motion.div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 px-4">
                                <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">No upcoming events</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Show trending communities after 3rd item or at the end if fewer items */}
                      {(index === 3 || (index === visibleItems.length - 1 && index < 3)) && (
                        <div className="md:hidden mt-6">
                          {/* Trending Communities Horizontal Scroll */}
                          <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-bold flex items-center gap-2">
                                <Compass className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                Trending Communities
                              </h3>
                              <Link href="/explore">
                                <Button variant="ghost" size="sm" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                                  Explore
                                </Button>
                              </Link>
                            </div>
                            {trendingCommunities.length > 0 ? (
                              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {trendingCommunities.slice(0, 5).map((community, commIndex) => (
                                  <motion.div
                                    key={community._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + commIndex * 0.1 }}
                                    className="flex-shrink-0 w-64"
                                  >
                                    <div className="flex items-center gap-3 rounded-lg border p-4 transition-all hover:shadow-md hover:border-primary/30 bg-card">
                                      <Avatar className="ring-2 ring-primary/10">
                                        <AvatarImage src={community.avatar} />
                                        <AvatarFallback className="bg-gradient-to-br from-[#91D6FF] to-pink-500 text-white">
                                          {community.name.substring(0, 2)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <Link
                                            href={`/communities/${community.handle}`}
                                            className="font-semibold hover:text-primary transition-colors truncate text-sm"
                                          >
                                            {community.name}
                                          </Link>
                                          {community.isVerified && (
                                            <Badge variant="outline" className="h-3 border-blue-300 dark:border-blue-700 px-1 text-[8px] text-blue-500 dark:text-blue-400">
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
                                          className="h-6 text-xs px-2"
                                        >
                                          {followingStates[community._id] ? "Following" : "Follow"}
                                        </Button>
                                      )}
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 px-4">
                                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">No trending communities</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Loading indicator */}
                {isLoadingMore && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center py-8"
                  >
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading more...</span>
                    </div>
                  </motion.div>
                )}

                {/* Intersection Observer Sentinel */}
                {hasMore && (
                  <div
                    id="feed-sentinel"
                    className="h-4 w-full"
                  />
                )}

                {/* End of feed indicator */}
                {!hasMore && visibleItems.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-px w-8 bg-border" />
                      <span className="text-sm">You&apos;ve reached the end</span>
                      <div className="h-px w-8 bg-border" />
                    </div>
                  </motion.div>
                )}

                {/* Mobile: Show sections even if no feed items or few items */}
                {feedItems.length === 0 && (
                  <div className="md:hidden space-y-6">
                    {/* Upcoming Events Horizontal Scroll */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          <CalendarDays className="h-5 w-5 text-green-600 dark:text-green-400" />
                          Upcoming Events
                        </h3>
                        <Link href="/calendar">
                          <Button variant="ghost" size="sm" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                            View All
                          </Button>
                        </Link>
                      </div>
                      {upcomingEvents.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                          {upcomingEvents.slice(0, 5).map((event, eventIndex) => (
                            <motion.div
                              key={event._id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 + eventIndex * 0.1 }}
                              className="flex-shrink-0 w-72"
                            >
                              <Link
                                href={`/events/${event._id}`}
                                className="block rounded-lg border p-4 transition-all hover:shadow-md hover:border-primary/30 bg-card"
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className="aspect-video w-16 rounded-lg bg-gradient-to-r from-[#91D6FF] to-indigo-600 flex-shrink-0 flex items-center justify-center"
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
                                    <p className="font-semibold truncate text-sm">{event.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Avatar className="h-3 w-3">
                                        <AvatarImage src={event.community.avatar} />
                                        <AvatarFallback>{event.community.name.substring(0, 2)}</AvatarFallback>
                                      </Avatar>
                                      <p className="text-xs text-muted-foreground truncate">{event.community.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                      <div className="flex items-center gap-1">
                                        <CalendarDays className="h-3 w-3" />
                                        <span>{event.date}</span>
                                      </div>
                                    </div>
                                  </div>
                                  {event.userRegistered && (
                                    <Badge className="bg-green-500 dark:bg-green-600 text-white text-xs">
                                      ✓
                                    </Badge>
                                  )}
                                </div>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 px-4">
                          <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No upcoming events</p>
                        </div>
                      )}
                    </div>

                    {/* Trending Communities Horizontal Scroll */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          <Compass className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          Trending Communities
                        </h3>
                        <Link href="/explore">
                          <Button variant="ghost" size="sm" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                            Explore
                          </Button>
                        </Link>
                      </div>
                      {trendingCommunities.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                          {trendingCommunities.slice(0, 5).map((community, commIndex) => (
                            <motion.div
                              key={community._id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 + commIndex * 0.1 }}
                              className="flex-shrink-0 w-64"
                            >
                              <div className="flex items-center gap-3 rounded-lg border p-4 transition-all hover:shadow-md hover:border-primary/30 bg-card">
                                <Avatar className="ring-2 ring-primary/10">
                                  <AvatarImage src={community.avatar} />
                                  <AvatarFallback className="bg-gradient-to-br from-[#91D6FF] to-pink-500 text-white">
                                    {community.name.substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Link
                                      href={`/communities/${community.handle}`}
                                      className="font-semibold hover:text-primary transition-colors truncate text-sm"
                                    >
                                      {community.name}
                                    </Link>
                                    {community.isVerified && (
                                      <Badge variant="outline" className="h-3 border-blue-300 dark:border-blue-700 px-1 text-[8px] text-blue-500 dark:text-blue-400">
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
                                    className="h-6 text-xs px-2"
                                  >
                                    {followingStates[community._id] ? "Following" : "Follow"}
                                  </Button>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 px-4">
                          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No trending communities</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 md:space-y-8 lg:col-span-4">
          {/* Upcoming Events - Hidden on mobile */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="hidden md:block"
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
                  <div className="flex flex-col items-center justify-center py-8 px-4 md:px-6">
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
                          className="block rounded-lg border p-3 md:p-4 transition-all hover:shadow-md hover:border-primary/30 bg-card"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="h-12 w-12 md:h-14 md:w-14 rounded-lg bg-gradient-to-r from-[#91D6FF] to-indigo-600 flex-shrink-0 flex items-center justify-center"
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

          {/* Trending Communities - Hidden on mobile */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="hidden md:block"
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
                  <div className="flex flex-col items-center justify-center py-8 px-4 md:px-6">
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
                          <AvatarFallback className="bg-gradient-to-br from-[#91D6FF] to-pink-500 text-white">
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

          </motion.div>
        </div>
      </div>
    </div>
  );
}