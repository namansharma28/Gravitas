"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Upload, X, FileText, Image, Video, File, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useDropzone } from "react-dropzone";

// Dynamically import MD Editor to avoid SSR issues
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  content: z.string().min(1, "Content is required"),
  visibility: z.enum(["everyone", "members"]),
  attachedFormId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
}

interface DocumentFile {
  id: string;
  url: string;
  name: string;
  size: number;
}

interface Form {
  id: string;
  title: string;
  description: string;
}

export default function CreateUpdatePage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      visibility: "everyone",
      attachedFormId: "",
    },
  });

  useEffect(() => {
    // Fetch available forms for this event
    const fetchForms = async () => {
      try {
        const response = await fetch(`/api/events/${params.id}/forms`);
        if (response.ok) {
          const data = await response.json();
          setForms(data);
        }
      } catch (error) {
        console.error('Error fetching forms:', error);
      }
    };

    fetchForms();
  }, [params.id]);

  // Media upload dropzone
  const mediaDropzone = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: async (acceptedFiles) => {
      for (const file of acceptedFiles) {
        await uploadMedia(file);
      }
    },
  });

  // Document upload dropzone
  const documentDropzone = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: async (acceptedFiles) => {
      for (const file of acceptedFiles) {
        await uploadDocument(file);
      }
    },
  });

  const uploadMedia = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload media');
      }

      const data = await response.json();
      const mediaFile: MediaFile = {
        id: crypto.randomUUID(),
        url: data.url,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        name: file.name,
      };

      setMedia(prev => [...prev, mediaFile]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload media file",
        variant: "destructive",
      });
    }
  };

  const uploadDocument = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      const data = await response.json();
      const documentFile: DocumentFile = {
        id: crypto.randomUUID(),
        url: data.url,
        name: file.name,
        size: file.size,
      };

      setDocuments(prev => [...prev, documentFile]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    }
  };

  const removeMedia = (id: string) => {
    setMedia(prev => prev.filter(item => item.id !== id));
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(item => item.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  async function onSubmit(data: FormValues) {
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to create an update",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/events/${params.id}/updates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          content,
          media,
          documents,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create update");
      }

      toast({
        title: "Success",
        description: "Update created successfully",
      });

      router.push(`/events/${params.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create update",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Button variant="ghost" className="mb-4" asChild>
          <Link href={`/events/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Event
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Create Update</h1>
        <p className="mt-2 text-muted-foreground">
          Share news and information about your event
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Update Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="Enter update title"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <div className="min-h-[300px]">
                <MDEditor
                  value={content}
                  onChange={(val) => {
                    setContent(val || "");
                    form.setValue("content", val || "");
                  }}
                  preview="edit"
                  hideToolbar={false}
                  data-color-mode="light"
                />
              </div>
              {form.formState.errors.content && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.content.message}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Visibility</Label>
              <RadioGroup
                defaultValue="everyone"
                onValueChange={(value) => form.setValue("visibility", value as "everyone" | "members")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="everyone" id="everyone" />
                  <Label htmlFor="everyone">Everyone - Visible to all visitors</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="members" id="members" />
                  <Label htmlFor="members">Members Only - Only community members can see</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Media Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Media (Photos & Videos)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              {...mediaDropzone.getRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <input {...mediaDropzone.getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium">Drop media files here or click to upload</p>
              <p className="text-sm text-gray-500">
                Supports images (JPG, PNG, GIF) and videos (MP4, MOV, AVI) up to 50MB
              </p>
            </div>

            {media.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {media.map((item) => (
                  <div key={item.id} className="relative group">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Video className="h-8 w-8 text-gray-400" />
                        <span className="ml-2 text-sm text-gray-600">{item.name}</span>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeMedia(item.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <File className="h-5 w-5" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              {...documentDropzone.getRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <input {...documentDropzone.getInputProps()} />
              <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="font-medium">Drop documents here or click to upload</p>
              <p className="text-sm text-gray-500">
                Supports PDF, DOC, DOCX, TXT up to 10MB
              </p>
            </div>

            {documents.length > 0 && (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(doc.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDocument(doc.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Attachment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Attach Form (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Select onValueChange={(value) => form.setValue("attachedFormId", value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a form to attach" />
                </SelectTrigger>
                <SelectContent>
                  {forms.map((formItem) => (
                    <SelectItem key={formItem.id} value={formItem.id}>
                      {formItem.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Form
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Form</DialogTitle>
                  </DialogHeader>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      You&apos;ll be redirected to create a new form. After creating it, 
                      you can come back and attach it to this update.
                    </p>
                    <Button asChild className="w-full">
                      <Link href={`/events/${params.id}/forms/create`}>
                        Create Form
                      </Link>
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {forms.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No forms available. Create a form first to attach it to updates.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Update"}
          </Button>
        </div>
      </form>
    </div>
  );
}