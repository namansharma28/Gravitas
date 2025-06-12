"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Share2, FileText, Download, Eye, Users, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import MD Viewer to avoid SSR issues
const Markdown = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  { ssr: false }
);

interface Update {
  id: string;
  title: string;
  content: string;
  visibility: 'everyone' | 'members';
  media: {
    id: string;
    url: string;
    type: 'image' | 'video';
    name: string;
  }[];
  documents: {
    id: string;
    url: string;
    name: string;
    size: number;
  }[];
  attachedForm: {
    id: string;
    title: string;
    description: string;
  } | null;
  community: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
  };
  comments: any[];
  createdAt: string;
}

interface UpdateCardProps {
  update: Update;
  eventId: string;
  userPermissions: {
    isMember: boolean;
    isAdmin: boolean;
  };
}

export default function UpdateCard({ update, eventId, userPermissions }: UpdateCardProps) {
  const { toast } = useToast();
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  const timeAgo = formatDistanceToNow(new Date(update.createdAt), { addSuffix: true });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/updates/${update.id}`);
    toast({
      title: "Link copied",
      description: "Update link copied to clipboard",
    });
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Download started",
        description: `${filename} is being downloaded`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderMediaGrid = () => {
    if (update.media.length === 0) return null;

    const getGridClass = () => {
      switch (update.media.length) {
        case 1:
          return "grid-cols-1";
        case 2:
          return "grid-cols-2";
        case 3:
          return "grid-cols-2 md:grid-cols-3";
        default:
          return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      }
    };

    return (
      <div className={`grid gap-2 mt-4 ${getGridClass()}`}>
        {update.media.slice(0, 4).map((item, index) => (
          <div key={item.id} className="relative group cursor-pointer">
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt={item.name}
                className="w-full h-32 object-cover rounded-lg"
                onClick={() => setSelectedMedia(item.url)}
              />
            ) : (
              <div 
                className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center"
                onClick={() => setSelectedMedia(item.url)}
              >
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-1 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">▶</span>
                  </div>
                  <span className="text-xs text-gray-600">{item.name}</span>
                </div>
              </div>
            )}
            {index === 3 && update.media.length > 4 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold">+{update.media.length - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={update.community.avatar} />
                <AvatarFallback>{update.community.name?.charAt(0) || 'C'}</AvatarFallback>
              </Avatar>
              <div>
                <Link href={`/communities/${update.community.handle}`} className="font-medium hover:underline">
                  {update.community.name}
                </Link>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{timeAgo}</span>
                  <Badge variant={update.visibility === 'members' ? 'secondary' : 'outline'} className="text-xs">
                    {update.visibility === 'members' ? (
                      <>
                        <Users className="w-3 h-3 mr-1" />
                        Members Only
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        Public
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>
            {(userPermissions.isMember || userPermissions.isAdmin) && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/events/${eventId}/updates/${update.id}/edit`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <Link href={`/updates/${update.id}`} className="block hover:opacity-80 transition-opacity">
            <h3 className="text-lg font-semibold mb-3 hover:text-primary">{update.title}</h3>
          </Link>
          
          <div className="prose prose-sm max-w-none">
            <div data-color-mode="light">
              <Markdown source={update.content.length > 200 ? update.content.substring(0, 200) + "..." : update.content} />
            </div>
          </div>

          {update.content.length > 200 && (
            <Link href={`/updates/${update.id}`} className="text-primary hover:underline text-sm">
              Read more
            </Link>
          )}

          {renderMediaGrid()}

          {/* Documents */}
          {update.documents.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Attachments</h4>
              {update.documents.slice(0, 2).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDownload(doc.url, doc.name)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {update.documents.length > 2 && (
                <Link href={`/updates/${update.id}`} className="text-primary hover:underline text-sm">
                  +{update.documents.length - 2} more documents
                </Link>
              )}
            </div>
          )}

          {/* Attached Form */}
          {update.attachedForm && (
            <div className="mt-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    {update.attachedForm.title}
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                    {update.attachedForm.description}
                  </p>
                  <Button size="sm" className="mt-3" asChild>
                    <Link href={`/events/${eventId}/forms/${update.attachedForm.id}/submit`}>
                      Fill Form
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t bg-muted/20 p-3">
          <div className="flex w-full items-center justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Media Viewer Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Media Viewer</DialogTitle>
          </DialogHeader>
          {selectedMedia && (
            <div className="flex justify-center">
              {selectedMedia.includes('.mp4') || selectedMedia.includes('.mov') || selectedMedia.includes('.avi') ? (
                <video controls className="max-w-full max-h-[70vh]">
                  <source src={selectedMedia} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img 
                  src={selectedMedia} 
                  alt="Media" 
                  className="max-w-full max-h-[70vh] object-contain"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}