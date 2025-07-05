"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { 
  Share2, 
  FileText, 
  Download, 
  Eye, 
  Users, 
  Pencil,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  CheckSquare
} from "lucide-react";
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
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";

// Dynamically import MD Viewer to avoid SSR issues
const Markdown = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  { ssr: false }
);

interface Update {
  id: string;
  title: string;
  content: string;
  visibility: 'everyone' | 'members' | 'shortlisted';
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
  eventId: string;
  eventTitle: string;
  targetFormId?: string;
  userPermissions?: {
    canEdit: boolean;
  };
}

export default function UpdatePage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [update, setUpdate] = useState<Update | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchUpdate = async () => {
      try {
        const response = await fetch(`/api/updates/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch update');
        }
        const data = await response.json();
        setUpdate(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load update",
          variant: "destructive",
        });
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpdate();
  }, [params.id, toast, router]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
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

  const navigateMedia = (direction: 'prev' | 'next') => {
    if (!update || selectedMediaIndex === null) return;
    
    if (direction === 'prev') {
      const newIndex = selectedMediaIndex > 0 ? selectedMediaIndex - 1 : update.media.length - 1;
      setSelectedMediaIndex(newIndex);
      setSelectedMedia(update.media[newIndex].url);
    } else {
      const newIndex = selectedMediaIndex < update.media.length - 1 ? selectedMediaIndex + 1 : 0;
      setSelectedMediaIndex(newIndex);
      setSelectedMedia(update.media[newIndex].url);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-200px)] flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!update) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-200px)] flex-col items-center justify-center py-10">
        <h1 className="text-3xl font-bold">Update Not Found</h1>
        <p className="mb-6 text-muted-foreground">The update you&apos;re looking for doesn&apos;t exist.</p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(update.createdAt), { addSuffix: true });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Button variant="ghost" className="mb-4" asChild>
          <Link href={`/events/${update.eventId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Event
          </Link>
        </Button>
      </div>

      <div className="mx-auto max-w-4xl">
        <Card className="overflow-hidden">
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={update.community.avatar} />
                  <AvatarFallback>{update.community.name?.charAt(0) || 'C'}</AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/communities/${update.community.handle}`} className="text-lg font-semibold hover:underline">
                    {update.community.name}
                  </Link>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{timeAgo}</span>
                    <Badge variant={update.visibility !== 'everyone' ? 'secondary' : 'outline'}>
                      {update.visibility === 'members' ? (
                        <>
                          <Users className="w-3 h-3 mr-1" />
                          Members Only
                        </>
                      ) : update.visibility === 'shortlisted' ? (
                        <>
                          <CheckSquare className="w-3 h-3 mr-1" />
                          Shortlisted Only
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
              {session && update.userPermissions?.canEdit && (
                <Button variant="outline" asChild>
                  <Link href={`/events/${update.eventId}/updates/${update.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Update
                  </Link>
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{update.title}</h1>
              <p className="text-muted-foreground">
                Update for <Link href={`/events/${update.eventId}`} className="text-primary hover:underline">
                  {update.eventTitle}
                </Link>
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div data-color-mode={theme === "dark" ? "dark" : "light"}>
                <Markdown source={update.content} />
              </div>
            </div>

            {/* Media Grid */}
            {update.media.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {update.media.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="relative group cursor-pointer rounded-lg overflow-hidden"
                      onClick={() => {
                        setSelectedMediaIndex(index);
                        setSelectedMedia(item.url);
                      }}
                    >
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-transform group-hover:scale-105">
                          <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-2 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-lg">▶</span>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">{item.name}</span>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            {update.documents.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Documents</h3>
                <div className="grid gap-3">
                  {update.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-gray-400" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(doc.size)}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDownload(doc.url, doc.name)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attached Form */}
            {update.attachedForm && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Registration Form</h3>
                <div className="p-6 border rounded-lg bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900/50">
                  <div className="flex items-start gap-4">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        {update.attachedForm.title}
                      </h4>
                      <p className="text-blue-700 dark:text-blue-200 mb-4">
                        {update.attachedForm.description}
                      </p>
                      <Button size="lg" asChild>
                        <Link href={`/events/${update.eventId}/forms/${update.attachedForm.id}/submit`}>
                          Fill Out Form
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Share Action */}
            <div className="flex items-center justify-end pt-6 border-t">
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Media Viewer Dialog with Navigation */}
      <Dialog open={selectedMedia !== null} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Media Viewer</span>
              {update.media.length > 1 && selectedMediaIndex !== null && (
                <span className="text-sm text-muted-foreground">
                  {selectedMediaIndex + 1} of {update.media.length}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedMediaIndex !== null && update.media[selectedMediaIndex] && (
            <div className="relative">
              <div className="flex justify-center">
                {update.media[selectedMediaIndex].type === 'video' ? (
                  <video controls className="max-w-full max-h-[70vh]">
                    <source src={update.media[selectedMediaIndex].url} />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img 
                    src={update.media[selectedMediaIndex].url} 
                    alt={update.media[selectedMediaIndex].name}
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                )}
              </div>
              
              {/* Navigation Buttons */}
              {update.media.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2"
                    onClick={() => navigateMedia('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    onClick={() => navigateMedia('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {/* Media Info */}
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {update.media[selectedMediaIndex].name}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}