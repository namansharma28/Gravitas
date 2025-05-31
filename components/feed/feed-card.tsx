import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { CalendarDays, Heart, MessageSquare, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FeedItem } from "@/types/feed";

interface FeedCardProps {
  item: FeedItem;
}

export default function FeedCard({ item }: FeedCardProps) {
  const timeAgo = formatDistanceToNow(new Date(item.date), { addSuffix: true });

  return (
    <Card className="overflow-hidden">
      {item.type === "event" && (
        <div 
          className="relative h-32 w-full bg-gradient-to-r from-blue-500 to-purple-600 bg-opacity-90" 
          style={{
            backgroundImage: item.image 
              ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${item.image})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 flex items-end p-4 text-white">
            <div>
              <Badge className="mb-1 bg-primary/80 hover:bg-primary/70">Event</Badge>
              <h3 className="text-lg font-bold">{item.title}</h3>
              {item.eventDate && (
                <p className="flex items-center gap-1 text-sm">
                  <CalendarDays size={14} /> {item.eventDate}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <CardContent className={`p-4 ${item.type === "event" ? "pt-3" : "pt-4"}`}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={item.community.avatar} />
              <AvatarFallback>{item.community.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <Link href={`/communities/${item.community.handle}`}>
                <p className="text-sm font-medium hover:underline">{item.community.name}</p>
              </Link>
              <p className="text-xs text-muted-foreground">@{item.community.handle}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>

        {item.type === "update" && <h4 className="mb-2 font-semibold">{item.title}</h4>}

        <p className="text-sm">{item.content}</p>

        {item.eventId && item.type === "update" && (
          <Link href={`/events/${item.eventId}`}>
            <div className="mt-3 rounded-md border p-3">
              <p className="text-xs font-medium text-muted-foreground">Related to event:</p>
              <p className="text-sm font-medium">{item.eventTitle}</p>
            </div>
          </Link>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t bg-muted/20 p-2 px-4">
        <div className="flex w-full items-center justify-between">
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground">
            <Heart size={16} /> 
            <span className="text-xs">{item.likes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground">
            <MessageSquare size={16} /> 
            <span className="text-xs">{item.comments}</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-muted-foreground">
            <Share2 size={16} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}