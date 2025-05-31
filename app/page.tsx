import FeedSection from "@/components/feed/feed-section";
import { Button } from "@/components/ui/button";
import { CalendarDays, Compass, Users } from "lucide-react";
import Link from "next/link";
import UpcomingEvents from "@/components/events/upcoming-events";
import TrendingCommunities from "@/components/communities/trending-communities";

export default function Home() {
  return (
    <div className="container mx-auto space-y-8 py-6">
      <section className="space-y-4 pb-8">
        <h1 className="text-4xl font-bold tracking-tight">Your Feed</h1>
        <p className="text-muted-foreground">Updates from communities and events you follow</p>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <FeedSection />
        </div>
        <div className="space-y-8 lg:col-span-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Upcoming Events</h3>
              <Link href="/calendar">
                <Button variant="ghost" size="sm" className="flex gap-1 text-xs">
                  <CalendarDays size={14} />
                  Calendar
                </Button>
              </Link>
            </div>
            <UpcomingEvents />
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Trending Communities</h3>
              <Link href="/explore">
                <Button variant="ghost" size="sm" className="flex gap-1 text-xs">
                  <Compass size={14} />
                  Explore
                </Button>
              </Link>
            </div>
            <TrendingCommunities />
          </div>

          <div className="flex justify-center">
            <Link href="/communities/create">
              <Button className="flex gap-1">
                <Users size={16} />
                Create a Community
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}