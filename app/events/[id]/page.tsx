import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Share2, User, Users } from "lucide-react";
import { mockUpcomingEvents, mockFeedItems } from "@/lib/mock-data";
import FeedCard from "@/components/feed/feed-card";

export default function EventPage({ params }: { params: { id: string } }) {
  const event = mockUpcomingEvents.find(e => e.id === params.id);
  
  if (!event) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-200px)] flex-col items-center justify-center py-10">
        <h1 className="text-3xl font-bold">Event Not Found</h1>
        <p className="mb-6 text-muted-foreground">The event you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/calendar">Explore Events</Link>
        </Button>
      </div>
    );
  }

  // Get updates related to this event
  const eventUpdates = mockFeedItems.filter(item => 
    item.type === "update" && item.eventId === event.id
  );

  return (
    <div className="container mx-auto pb-16">
      {/* Event Banner */}
      <div 
        className="relative mb-6 h-64 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 md:h-80"
        style={{
          backgroundImage: event.image 
            ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${event.image})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <Badge className="mb-2 bg-primary/80 hover:bg-primary/70">Event</Badge>
          <h1 className="mb-1 text-2xl font-bold md:text-4xl">{event.title}</h1>
          
          <div className="mt-2 flex items-center gap-2">
            <Avatar className="h-6 w-6 border-2 border-white">
              <AvatarImage src={event.community.avatar} />
              <AvatarFallback>{event.community.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <Link 
              href={`/communities/${event.community.handle}`} 
              className="text-sm font-medium text-white hover:underline"
            >
              {event.community.name}
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-6">
                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p>{event.date}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p>{event.time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p>Downtown Convention Center</p>
                    <p className="text-xs text-muted-foreground">123 Main St, San Francisco</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Attendees</p>
                    <p>120 going • 45 interested</p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h2 className="mb-4 text-xl font-semibold">About This Event</h2>
                <p className="text-muted-foreground">
                  Join us for an engaging session where industry experts will share their knowledge and insights on modern web development practices. This workshop is perfect for both beginners and experienced developers looking to expand their skills.
                </p>
                <div className="mt-4 space-y-2">
                  <p className="text-muted-foreground">
                    <strong>What to expect:</strong> Hands-on coding sessions, networking opportunities, and Q&A with experienced developers.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>What to bring:</strong> Your laptop with a code editor installed. All other materials will be provided.
                  </p>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium">Speakers</h3>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <Avatar>
                        <AvatarImage src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">James Davidson</p>
                        <p className="text-sm text-muted-foreground">Senior Developer at TechCorp</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <Avatar>
                        <AvatarImage src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg" />
                        <AvatarFallback>EL</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Emily Lee</p>
                        <p className="text-sm text-muted-foreground">UX Designer at DesignStudio</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="updates" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="updates">Updates</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
            </TabsList>
            
            <TabsContent value="updates" className="mt-0 space-y-4">
              {eventUpdates.length > 0 ? (
                eventUpdates.map(update => (
                  <FeedCard key={update.id} item={update} />
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No updates for this event yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="discussion" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 space-y-2">
                    <h3 className="text-lg font-medium">Discussion</h3>
                    <p className="text-sm text-muted-foreground">
                      Join the conversation about this event.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg" />
                          <AvatarFallback>RB</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">Rebecca Brown</p>
                          <p className="text-xs text-muted-foreground">2 days ago</p>
                        </div>
                      </div>
                      <p className="text-sm">
                        Will this workshop cover Next.js 14 features? I'm particularly interested in the new data fetching methods.
                      </p>
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg" />
                          <AvatarFallback>MT</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">Mike Thompson</p>
                          <p className="text-xs text-muted-foreground">1 day ago</p>
                        </div>
                      </div>
                      <p className="text-sm">
                        Yes, we'll cover the latest Next.js features, including the new app router and data fetching patterns. Looking forward to seeing you there!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between">
                <h3 className="font-semibold">Registration</h3>
                <Badge variant="outline" className="border-green-300 text-green-600 dark:border-green-800 dark:text-green-400">Free</Badge>
              </div>
              <div className="mt-4 space-y-4">
                <Button className="w-full" size="lg">RSVP Now</Button>
                <Button variant="outline" className="w-full" size="lg">
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
              </div>
              <Separator className="my-4" />
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total spots</span>
                  <span className="text-sm font-medium">150</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Available</span>
                  <span className="text-sm font-medium">30</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Registration closes</span>
                  <span className="text-sm font-medium">{event.date}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 font-semibold">Organizer</h3>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={event.community.avatar} />
                  <AvatarFallback>{event.community.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/communities/${event.community.handle}`} className="font-medium hover:underline">
                    {event.community.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">Community</p>
                </div>
              </div>
              <Separator className="my-4" />
              <h3 className="mb-3 font-semibold">Contact</h3>
              <div className="text-sm">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href="#" className="hover:underline">
                    {event.community.handle}@example.com
                  </a>
                </p>
                <p className="mt-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Sarah Johnson (Event Coordinator)</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}