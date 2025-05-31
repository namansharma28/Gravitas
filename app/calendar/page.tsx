import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockUpcomingEvents } from "@/lib/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import CalendarEventCard from "@/components/events/calendar-event-card";

export default function CalendarPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">Keep track of all your upcoming events</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" /> Calendar
            </CardTitle>
            <CardDescription>Select a date to see events</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar 
              mode="single" 
              className="rounded-md border"
              selected={new Date()}
              classNames={{
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              }}
            />
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-8">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Events from communities you follow</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {mockUpcomingEvents.map(event => (
                  <CalendarEventCard key={event.id} event={event} />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}