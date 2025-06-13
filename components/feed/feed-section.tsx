"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import FeedCard from "@/components/feed/feed-card";
import { mockFeedItems } from "@/lib/mock-data";
import { FeedItem } from "@/types/feed";

export default function FeedSection() {
  const [activeTab, setActiveTab] = useState<"all" | "event" | "update">("all");
  
  const filteredItems = mockFeedItems.filter(item => {
    if (activeTab === "all") return true;
    return item.type === activeTab;
  });

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setActiveTab(value as "all" | "event" | "update")}>
        <div className="border-b px-3 py-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All <Badge className="ml-1 hidden sm:inline-flex">{mockFeedItems.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="event" className="text-xs sm:text-sm">
              Events <Badge className="ml-1 hidden sm:inline-flex">
                {mockFeedItems.filter(item => item.type === "event").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="update" className="text-xs sm:text-sm">
              Updates <Badge className="ml-1 hidden sm:inline-flex">
                {mockFeedItems.filter(item => item.type === "update").length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value={activeTab} className="m-0">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-4 p-4">
              {filteredItems.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">No items to display</p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <FeedCard key={item.id} item={item} />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}