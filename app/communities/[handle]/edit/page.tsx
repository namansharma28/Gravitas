"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useSession } from "next-auth/react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Community name must be at least 2 characters.",
  }).max(50, {
    message: "Community name must not exceed 50 characters."
  }),
  description: z.string().max(500, {
    message: "Description must not exceed 500 characters."
  }).optional(),
  website: z.string().url({
    message: "Please enter a valid URL."
  }).optional().or(z.literal("")),
  location: z.string().max(100, {
    message: "Location must not exceed 100 characters."
  }).optional(),
});

interface Community {
  id: string;
  name: string;
  handle: string;
  description: string;
  banner: string;
  avatar: string;
  website?: string;
  location?: string;
  admins: string[];
}

export default function EditCommunityPage({ params }: { params: { handle: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [community, setCommunity] = useState<Community | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      website: "",
      location: "",
    },
  });

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const response = await fetch(`/api/communities/${params.handle}`);
        if (response.ok) {
          const data = await response.json();
          setCommunity(data);
          setAvatarPreview(data.avatar);
          setBannerPreview(data.banner);
          form.reset({
            name: data.name,
            description: data.description || "",
            website: data.website || "",
            location: data.location || "",
          });

          // Check if user is admin
          if (!data.admins.includes(session?.user?.id)) {
            toast({
              title: "Unauthorized",
              description: "You don't have permission to edit this community",
              variant: "destructive",
            });
            router.push(`/communities/${params.handle}`);
          }
        }
      } catch (error) {
        console.error('Error fetching community:', error);
        toast({
          title: "Error",
          description: "Failed to load community data",
          variant: "destructive",
        });
      }
    };

    if (session?.user) {
      fetchCommunity();
    }
  }, [params.handle, form, toast, session, router]);

  const handleImageUpload = async (file: File, type: 'avatar' | 'banner') => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      if (type === 'avatar') {
        setAvatarPreview(data.url);
      } else {
        setBannerPreview(data.url);
      }
      return data.url;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'avatar') {
          setAvatarPreview(e.target?.result as string);
        } else {
          setBannerPreview(e.target?.result as string);
        }
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      await handleImageUpload(file, type);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!avatarPreview || !bannerPreview) {
      toast({
        title: "Missing Images",
        description: "Please upload both a banner and an avatar image.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/communities/${params.handle}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          avatar: avatarPreview,
          banner: bannerPreview,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update community');
      }

      toast({
        title: "Community Updated",
        description: "Successfully updated community details",
      });
      router.push(`/communities/${params.handle}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update community. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!community) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-200px)] flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Button variant="ghost" className="mb-4" asChild>
          <Link href={`/communities/${params.handle}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Community
          </Link>
        </Button>
        <h1 className="text-4xl font-bold tracking-tight">Edit Community</h1>
        <p className="text-muted-foreground">Update your community's information</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Community Details</CardTitle>
            <CardDescription>
              Update your community's information below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormItem>
                    <FormLabel>Community Banner</FormLabel>
                    <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg border-2 border-dashed bg-muted/50 group">
                      {bannerPreview ? (
                        <div className="relative h-full w-full">
                          <img 
                            src={bannerPreview} 
                            alt="Banner preview" 
                            className="h-full w-full object-cover" 
                          />
                          <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <Upload className="h-8 w-8 text-white" />
                            <Input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileChange(e, 'banner')}
                            />
                          </label>
                        </div>
                      ) : (
                        <label className="flex h-full cursor-pointer flex-col items-center justify-center">
                          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Upload banner image</span>
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, 'banner')}
                          />
                        </label>
                      )}
                    </div>
                  </FormItem>

                  <div className="flex flex-col gap-6 md:flex-row">
                    <div className="flex flex-col items-center md:w-1/3">
                      <div className="mb-2 text-center">
                        <FormLabel>Community Avatar</FormLabel>
                      </div>
                      <div className="relative mb-4 h-36 w-36 overflow-hidden rounded-full border-2 border-dashed bg-muted/50 group">
                        {avatarPreview ? (
                          <div className="relative h-full w-full">
                            <img 
                              src={avatarPreview} 
                              alt="Avatar preview" 
                              className="h-full w-full object-cover" 
                            />
                            <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <Upload className="h-8 w-8 text-white" />
                              <Input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, 'avatar')}
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="flex h-full cursor-pointer flex-col items-center justify-center">
                            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Upload avatar</span>
                            <Input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileChange(e, 'avatar')}
                            />
                          </label>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Recommended: 400x400px JPG, PNG
                      </p>
                    </div>

                    <div className="space-y-4 md:w-2/3">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Community Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <p className="text-sm text-muted-foreground">
                        Handle: @{community.handle} (cannot be changed)
                      </p>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            className="min-h-[120px] resize-y"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating Community..." : "Update Community"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}