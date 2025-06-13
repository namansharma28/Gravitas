"use client";

import { useState, useEffect } from "react";
import { Bell, Search, X, Menu, CalendarDays, Loader2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import Image from 'next/image';

interface Notification {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  type: 'event' | 'community' | 'system';
  linkUrl?: string;
}

interface SearchResult {
  id: string;
  title: string;
  type: 'event' | 'community';
  handle?: string;
  date?: string;
  image?: string;
  url: string;
}

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Fetch notifications when user is logged in
  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
    }
  }, [session]);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!session?.user) return;
    
    setIsLoadingNotifications(true);
    try {
      const response = await fetch('/api/user/notifications/list');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        
        // Check if there are unread notifications
        const hasUnread = data.some((notification: Notification) => !notification.read);
        setHasNotifications(hasUnread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    if (!session?.user) return;
    
    try {
      const response = await fetch(`/api/user/notifications/${id}/read`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id ? { ...notification, read: true } : notification
          )
        );
        
        // If all notifications are read, remove the notification dot
        if (notifications.every(n => n.id === id ? true : n.read)) {
          setHasNotifications(false);
        }

        // If notification has a link, navigate to it
        const notification = notifications.find(n => n.id === id);
        if (notification?.linkUrl) {
          setIsNotificationOpen(false);
          router.push(notification.linkUrl);
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!session?.user) return;
    
    try {
      const response = await fetch('/api/user/notifications/read-all', {
        method: 'POST',
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
        setHasNotifications(false);
        
        toast({
          title: "All notifications marked as read",
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Search functionality
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search result selection
  const handleSelectSearchResult = (url: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(url);
  };

  // Format notification time
  const formatNotificationTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "recently";
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <CalendarDays className="h-4 w-4 text-blue-500" />;
      case 'community':
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="top-navbar fixed left-0 right-0 top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Gravitas"
            width={32}
            height={32}
            className="h-8 w-auto"
          />
          <span className="text-xl font-bold">Gravitas</span>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile Search Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>
          
          {/* Desktop Search */}
          <div className="relative hidden md:block w-64">
            <Popover open={searchQuery.length > 1} onOpenChange={() => {}}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events, communities..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] p-0" align="start">
                <Command>
                  <CommandList>
                    {isSearching ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <>
                        <CommandGroup heading="Events">
                          {searchResults
                            .filter(result => result.type === 'event')
                            .map(result => (
                              <CommandItem 
                                key={result.id}
                                onSelect={() => handleSelectSearchResult(result.url)}
                                className="flex items-center gap-2 py-2"
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <CalendarDays className="h-4 w-4 text-blue-500" />
                                  <div>
                                    <p className="text-sm font-medium">{result.title}</p>
                                    {result.date && (
                                      <p className="text-xs text-muted-foreground">{result.date}</p>
                                    )}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandGroup heading="Communities">
                          {searchResults
                            .filter(result => result.type === 'community')
                            .map(result => (
                              <CommandItem 
                                key={result.id}
                                onSelect={() => handleSelectSearchResult(result.url)}
                                className="flex items-center gap-2 py-2"
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <div 
                                    className="h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs"
                                  >
                                    {result.title.substring(0, 2)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{result.title}</p>
                                    {result.handle && (
                                      <p className="text-xs text-muted-foreground">@{result.handle}</p>
                                    )}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </>
                    ) : (
                      <CommandEmpty>No results found</CommandEmpty>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Mobile Search Expanded */}
          {isSearchOpen && (
            <div className="absolute inset-x-0 top-full mt-1 p-2 bg-background border-b md:hidden">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events, communities..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  autoFocus
                />
              </div>
              {searchQuery.length > 1 && (
                <div className="mt-2 max-h-60 overflow-y-auto rounded-md border bg-popover shadow-md">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="p-1">
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        Events
                      </div>
                      {searchResults
                        .filter(result => result.type === 'event')
                        .map(result => (
                          <div 
                            key={result.id}
                            className="flex items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-accent cursor-pointer"
                            onClick={() => handleSelectSearchResult(result.url)}
                          >
                            <CalendarDays className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="text-sm">{result.title}</p>
                              {result.date && (
                                <p className="text-xs text-muted-foreground">{result.date}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      
                      <div className="mt-2 px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        Communities
                      </div>
                      {searchResults
                        .filter(result => result.type === 'community')
                        .map(result => (
                          <div 
                            key={result.id}
                            className="flex items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-accent cursor-pointer"
                            onClick={() => handleSelectSearchResult(result.url)}
                          >
                            <div 
                              className="h-5 w-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs"
                            >
                              {result.title.substring(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm">{result.title}</p>
                              {result.handle && (
                                <p className="text-xs text-muted-foreground">@{result.handle}</p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <ModeToggle />
          
          {/* Notification Bell */}
          <Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {hasNotifications && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between border-b p-3">
                <h4 className="font-medium">Notifications</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs h-8"
                  disabled={!notifications.some(n => !n.read)}
                >
                  Mark all as read
                </Button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {isLoadingNotifications ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer ${notification.read ? 'opacity-70' : ''}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${notification.read ? 'bg-transparent' : 'bg-primary'}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {getNotificationIcon(notification.type)}
                              <p className="font-medium text-sm">{notification.title}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">{formatNotificationTime(notification.createdAt)}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">No notifications</p>
                  </div>
                )}
              </div>
              <div className="p-3 border-t text-center">
                <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                  <Link href="/settings">Manage notifications</Link>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={session.user?.image || ""} />
                  <AvatarFallback>
                    {session.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="font-medium">
                  {session.user?.name}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={() => router.push("/auth/signin")}
              size="sm"
              className="h-8"
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}