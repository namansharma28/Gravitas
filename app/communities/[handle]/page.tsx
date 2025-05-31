import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Globe, Mail, MapPin, Share2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { mockFeedItems, mockTrendingCommunities } from "@/lib/mock-data";
import FeedCard from "@/components/feed/feed-card";

export default function CommunityPage({ params }: { params: { handle: string } }) {
  const community = mockTrendingCommunities.find(c => c.handle === params.handle);
  
  if (!community) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-200px)] flex-col items-center justify-center py-10">
        <h1 className="text-3xl font-bold">Community Not Found</h1>
        <p className="mb-6 text-muted-foreground">The community you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/explore">Explore Communities</Link>
        </Button>
      </div>
    );
  }

  const communityFeed = mockFeedItems.filter(item => item.community.handle === params.handle);

  return (
    <div className="container mx-auto pb-16">
      <div className="mb-6 space-y-6">
        {/* Header/Banner */}
        <div className="relative h-48 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 md:h-64">
          <div className="absolute inset-x-0 bottom-0 flex items-end p-6">
            <div className="relative flex items-end">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={community.avatar} />
                <AvatarFallback>{community.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="ml-6 pb-3">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white md:text-3xl">{community.name}</h1>
                  {community.isVerified && (
                    <Badge className="border-blue-300 bg-blue-500/10 text-white">Verified</Badge>
                  )}
                </div>
                <p className="text-sm text-white/90">@{community.handle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Community Info */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="col-span-2">
            <p className="text-lg">{community.description || "A vibrant community focused on bringing people together through engaging events and thoughtful discussions."}</p>
          </div>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center md:justify-end">
            <Button size="lg" className="gap-1">
              <Users size={16} />
              Follow
            </Button>
            <Button variant="outline" size="icon">
              <Share2 size={16} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Card>
            <CardContent className="flex flex-row items-center gap-2 p-4">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Members</p>
                <p className="font-medium">{community.members.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-row items-center gap-2 p-4">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Events</p>
                <p className="font-medium">12</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-row items-center gap-2 p-4">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">San Francisco, CA</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-row items-center gap-2 p-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="font-medium truncate">{community.handle}@example.com</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-row items-center gap-2 p-4">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Website</p>
                <a href="#" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                  {community.handle}.org
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-0">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {communityFeed.length > 0 ? (
                communityFeed.map(item => (
                  <FeedCard key={item.id} item={item} />
                ))
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">This community hasn't posted any updates yet.</p>
                </Card>
              )}
            </div>
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 font-semibold">About {community.name}</h3>
                  <p className="text-sm">
                    {community.description || "This community is dedicated to bringing people together through engaging events and thoughtful discussions."}
                  </p>
                  <div className="mt-4">
                    <h4 className="mb-2 text-sm font-medium">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {community.handle === "tech-talks" && (
                        <>
                          <Badge variant="secondary">#technology</Badge>
                          <Badge variant="secondary">#coding</Badge>
                          <Badge variant="secondary">#innovation</Badge>
                        </>
                      )}
                      {community.handle === "art-collective" && (
                        <>
                          <Badge variant="secondary">#art</Badge>
                          <Badge variant="secondary">#creative</Badge>
                          <Badge variant="secondary">#exhibition</Badge>
                        </>
                      )}
                      {community.handle === "fitness-hub" && (
                        <>
                          <Badge variant="secondary">#fitness</Badge>
                          <Badge variant="secondary">#health</Badge>
                          <Badge variant="secondary">#workout</Badge>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 font-semibold">Community Admins</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg" />
                        <AvatarFallback>SJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Sarah Johnson</p>
                        <p className="text-xs text-muted-foreground">Founder</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg" />
                        <AvatarFallback>MT</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Mike Thompson</p>
                        <p className="text-xs text-muted-foreground">Events Manager</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-0">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* This would be populated with actual events from the community */}
            {Array.from({ length: 6 }).map((_, i) => (
              <Card className="overflow-hidden" key={i}>
                <div 
                  className="h-48 w-full bg-gradient-to-r from-blue-500 to-purple-600"
                  style={{
                    backgroundImage: i % 2 === 0 
                      ? "linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)"
                      : "linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold">
                    {i % 2 === 0 ? "Tech Workshop Series" : "Community Hackathon"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {i % 2 === 0 ? "A series of hands-on workshops" : "48-hour collaborative coding event"}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {i % 2 === 0 ? "May 15, 2025" : "June 2, 2025"}
                    </span>
                  </div>
                  <Button className="mt-4 w-full">View Details</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="members" className="mt-0">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted">
                    <Avatar>
                      <AvatarImage src={`https://images.pexels.com/photos/${220453 + i * 100}/pexels-photo-${220453 + i * 100}.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`} />
                      <AvatarFallback>{String.fromCharCode(65 + i % 26)}{String.fromCharCode(65 + (i + 1) % 26)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {["John Doe", "Jane Smith", "Alex Johnson", "Sam Wilson", "Taylor Brown", "Jordan Lee", "Casey Miller", "Robin Garcia", "Quinn Chen", "Riley Patel", "Morgan Davis", "Avery Williams"][i % 12]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {i < 2 ? "Admin" : "Member"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}