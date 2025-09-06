"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import dynamic from 'next/dynamic';

const MDMarkdown = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default.Markdown),
  { ssr: false }
);
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, Filter, MapPin, Clock, Users, Calendar as CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import FeedCard from "@/components/feed/feed-card";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  image?: string;
  community: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
  };
  registrationCount: number;
  userRegistered: boolean;
  userRelation: 'member' | 'follower' | 'admin';
  isMultiDay?: boolean;
  endDate?: string;
}

interface EventsByDate {
  [date: string]: CalendarEvent[];
}

export default function CalendarPage() {
  const { data: session } = useSession();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventsByDate, setEventsByDate] = useState<EventsByDate>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filterType, setFilterType] = useState<'all' | 'member' | 'follower' | 'registered'>('all');
  const [selectedCommunity, setSelectedCommunity] = useState<string>('all');
  const [communities, setCommunities] = useState<any[]>([]);

  useEffect(() => {
    if (session) {
      fetchEvents();
      fetchUserCommunities();
    }
  }, [session, currentMonth, filterType, selectedCommunity]);

  const fetchEvents = async () => {
    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const params = new URLSearchParams({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        filter: filterType,
        community: selectedCommunity,
      });

      const response = await fetch(`/api/calendar/events?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
        
        // Group events by date
        const grouped: EventsByDate = {};
        data.forEach((event: CalendarEvent) => {
          // Ensure we're working with the date string in ISO format (YYYY-MM-DD)
          const eventDate = event.date;
          if (!grouped[eventDate]) {
            grouped[eventDate] = [];
          }
          grouped[eventDate].push(event);
          
          // Handle multi-day events
          if (event.isMultiDay && event.endDate) {
            const start = new Date(event.date);
            const end = new Date(event.endDate);
            const current = new Date(start);
            current.setDate(current.getDate() + 1);
            
            while (current <= end) {
              const dateStr = current.toISOString().split('T')[0];
              if (!grouped[dateStr]) {
                grouped[dateStr] = [];
              }
              grouped[dateStr].push({
                ...event,
                title: `${event.title} (Day ${Math.ceil((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1})`,
              });
              current.setDate(current.getDate() + 1);
            }
          }
        });
        
        setEventsByDate(grouped);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load calendar events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserCommunities = async () => {
    try {
      const response = await fetch('/api/calendar/communities');
      if (response.ok) {
        const data = await response.json();
        setCommunities(data);
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  const getEventsForDate = (date: Date) => {
    // Format the date consistently to match the format used when grouping events
    const dateStr = date.toISOString().split('T')[0];
    return eventsByDate[dateStr] || [];
  };

  const getSelectedDateEvents = () => {
    // Create a date string in YYYY-MM-DD format without timezone offset
    const dateStr = selectedDate.toISOString().split('T')[0];
    return eventsByDate[dateStr] || [];
  };

  const hasEventsOnDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return eventsByDate[dateStr] && eventsByDate[dateStr].length > 0;
  };

  const getEventTypeForDate = (date: Date) => {
    // Create a date string in YYYY-MM-DD format without timezone offset
    const dateStr = date.toISOString().split('T')[0];
    const events = eventsByDate[dateStr] || [];
    if (events.length === 0) return null;
    
    const hasRegistered = events.some(e => e.userRegistered);
    const hasMember = events.some(e => e.userRelation === 'member' || e.userRelation === 'admin');
    const hasFollower = events.some(e => e.userRelation === 'follower');
    
    if (hasRegistered) return 'registered';
    if (hasMember) return 'member';
    if (hasFollower) return 'follower';
    return 'other';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const formatEventTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch {
      return time;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'registered': return 'bg-green-500';
      case 'member': return 'bg-blue-500';
      case 'follower': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventTypeBadge = (event: CalendarEvent) => {
    if (event.userRegistered) {
      return <Badge className="bg-green-500 text-white">Registered</Badge>;
    }
    if (event.userRelation === 'admin') {
      return <Badge className="bg-red-500 text-white">Admin</Badge>;
    }
    if (event.userRelation === 'member') {
      return <Badge className="bg-blue-500 text-white">Member</Badge>;
    }
    if (event.userRelation === 'follower') {
      return <Badge className="bg-purple-500 text-white">Following</Badge>;
    }
    return null;
  };

  if (!session) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">Sign in to see events from your communities</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Sign in to view your calendar</h3>
            <p className="text-muted-foreground text-center mb-4">
              See events from communities you follow and are a member of
            </p>
            <Button asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">Keep track of all your upcoming events</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Type</label>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="registered">Registered</SelectItem>
                  <SelectItem value="member">My Communities</SelectItem>
                  <SelectItem value="follower">Following</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Community</label>
              <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
                <SelectTrigger className="w-[180px] md:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Communities</SelectItem>
                  {communities.map((community) => (
                    <SelectItem key={community.id} value={community.id}>
                      {community.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Calendar */}
        <Card className="col-span-1 lg:col-span-5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>Select a date to see events</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border"
              modifiers={{
                hasEvents: (date) => hasEventsOnDate(date),
                registered: (date) => getEventTypeForDate(date) === 'registered',
                member: (date) => getEventTypeForDate(date) === 'member',
                follower: (date) => getEventTypeForDate(date) === 'follower',
              }}
              modifiersStyles={{
                hasEvents: { fontWeight: 'bold' },
                registered: { backgroundColor: '#10b981', color: 'white' },
                member: { backgroundColor: '#3b82f6', color: 'white' },
                follower: { backgroundColor: '#8b5cf6', color: 'white' },
              }}
              classNames={{
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              }}
            />
            
            {/* Legend */}
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Legend</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span>Registered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <span>Member</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-500"></div>
                  <span>Following</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gray-500"></div>
                  <span>Other</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events for Selected Date */}
        <Card className="col-span-1 lg:col-span-7">
          <CardHeader>
            <CardTitle>
              Events for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
            <CardDescription>
              {getSelectedDateEvents().length} event(s) scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] md:h-[600px] pr-4">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : getSelectedDateEvents().length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <CalendarDays className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No events scheduled</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      There are no events on this date from your communities
                    </p>
                    <Button asChild>
                      <Link href="/explore">Discover Events</Link>
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key={selectedDate.toISOString()}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {getSelectedDateEvents().map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link key={event.id} href={`/events/${event.id}`}>
                            <FeedCard
                              item={{
                                id: event.id,
                                type: "event",
                                title: event.title,
                                content: event.description,
                                date: event.date,
                                image: event.image,
                                community: event.community,
                                eventId: event.id,
                                eventDate: `${new Date(event.date).toLocaleDateString()} ${formatEventTime(event.time)}`,
                              }}
                            />
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Upcoming Events This Month</CardTitle>
          <CardDescription>
            Quick overview of events from your communities
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Tabs defaultValue="registered" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="registered">Registered ({events.filter(e => e.userRegistered).length})</TabsTrigger>
              <TabsTrigger value="member">My Communities ({events.filter(e => e.userRelation === 'member' || e.userRelation === 'admin').length})</TabsTrigger>
              <TabsTrigger value="follower" className="hidden md:inline-flex">Following ({events.filter(e => e.userRelation === 'follower').length})</TabsTrigger>
              <TabsTrigger value="all" className="hidden md:inline-flex">All ({events.length})</TabsTrigger>
            </TabsList>
            
            {['registered', 'member', 'follower', 'all'].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events
                    .filter((event) => {
                      if (tab === 'registered') return event.userRegistered;
                      if (tab === 'member') return event.userRelation === 'member' || event.userRelation === 'admin';
                      if (tab === 'follower') return event.userRelation === 'follower';
                      return true;
                    })
                    .slice(0, 6)
                    .map((event) => (
                      <Card key={event.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-3 md:p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div 
                              className="w-10 h-10 md:w-12 md:h-12 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 flex-shrink-0"
                              style={{
                                backgroundImage: event.image 
                                  ? `url(${event.image})`
                                  : undefined,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{event.title}</h4>
                              <p className="text-sm text-muted-foreground">{event.community.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                            <span>{formatEventTime(event.time)}</span>
                          </div>
                          <Button asChild size="sm" className="w-full mt-3">
                            <Link href={`/events/${event.id}`}>View Event</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
                {events.filter((event) => {
                  if (tab === 'registered') return event.userRegistered;
                  if (tab === 'member') return event.userRelation === 'member' || event.userRelation === 'admin';
                  if (tab === 'follower') return event.userRelation === 'follower';
                  return true;
                }).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No events in this category</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}