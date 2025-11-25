"use client";

import { useState, useEffect, useRef } from "react";
import { Search, CalendarDays, Loader2, Briefcase, BookOpen, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import Link from "next/link";
import NotificationBell from "@/components/notifications/notification-bell";
import Image from 'next/image';

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
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search functionality with debouncing
  useEffect(() => {
    const performSearch = async () => {
      // Clear results if query is too short
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setShowSearchResults(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
        if (response.ok) {
          const data = await response.json();
          // Safely handle the response structure
          const results = data.results || {};
          const combinedResults = [
            ...(results.events || []).map((item: any) => ({
              ...item,
              url: `/events/${item.id}`
            })),
            ...(results.communities || []).map((item: any) => ({
              ...item,
              url: `/communities/${item.handle}`
            }))
          ];
          setSearchResults(combinedResults);
          setShowSearchResults(true);
        } else {
          console.error('Search API returned error:', response.status);
          setSearchResults([]);
          setShowSearchResults(false);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
        setShowSearchResults(false);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce the search with 300ms delay
    const debounceTimer = setTimeout(performSearch, 300);

    // Cleanup function to cancel the previous timer
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search result selection
  const handleSelectSearchResult = (url: string) => {
    setSearchQuery("");
    setShowSearchResults(false);
    router.push(url);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-primary/10 bg-background/90 backdrop-blur">
      <div className="flex h-14 items-center px-4">
        <div className="flex w-full items-center justify-between md:justify-start">
          {/* Logo - only visible on mobile */}
          <div className="md:hidden">
            <Link href="/home" className="flex items-center">
              <Image src="/logo.svg" alt="Gravitas Logo" width={28} height={28} className="rounded-md" />
            </Link>
          </div>

          {/* Logo and title - visible on desktop */}
          <div className="hidden md:flex items-center gap-2 w-[68px] xl:w-[275px] justify-center xl:justify-start px-4">
            <Link href="/home" className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Gravitas Logo" width={32} height={32} className="rounded-lg" />
              <span className="hidden font-bold xl:inline-block">Gravitas</span>
            </Link>
          </div>

          {/* Center section with search */}
          <div className="flex items-center justify-center md:flex-1 mx-6">
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-md" ref={searchInputRef}>
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events, communities..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) {
                      setShowSearchResults(true);
                    }
                  }}
                />

                {/* Search Results Dropdown */}
                {showSearchResults && searchQuery.length > 1 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-background border border-border rounded-md shadow-lg max-h-96 overflow-hidden">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="py-2">
                        {/* Events */}
                        {searchResults.filter(result => result.type === 'event').length > 0 && (
                          <div>
                            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Events
                            </div>
                            {searchResults.filter(result => result.type === 'event').map(result => (
                              <div
                                key={result.id}
                                onClick={() => handleSelectSearchResult(result.url)}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-muted cursor-pointer"
                              >
                                <CalendarDays className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">{result.title}</p>
                                  {result.date && (
                                    <p className="text-xs text-muted-foreground truncate">{result.date}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Communities */}
                        {searchResults.filter(result => result.type === 'community').length > 0 && (
                          <div>
                            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Communities
                            </div>
                            {searchResults.filter(result => result.type === 'community').map(result => (
                              <div
                                key={result.id}
                                onClick={() => handleSelectSearchResult(result.url)}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-muted cursor-pointer"
                              >
                                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs flex-shrink-0">
                                  {result.title.substring(0, 2)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">{result.title}</p>
                                  {result.handle && (
                                    <p className="text-xs text-muted-foreground truncate">@{result.handle}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                        No results found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right section with user controls */}
          <div className="flex items-center gap-1">
            {/* Theme Toggle - visible on tablet and desktop */}
            <div className="block">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-8 w-8"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
            <NotificationBell />
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ""} />
                      <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{session.user?.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{session.user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings/notifications" className="cursor-pointer">Notification Settings</Link>
                  </DropdownMenuItem>
                  {/* Show operator dashboard for operators and admins */}
                  {((session.user as any)?.role === 'operator' || (session.user as any)?.role === 'admin') && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/operator/dashboard" className="cursor-pointer">Operator Dashboard</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {/* Show admin dashboard for admins */}
                  {(session.user as any)?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard" className="cursor-pointer">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
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
    </header>
  );
}