"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight, Upload, X, Loader2 } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Community name must be at least 2 characters.",
  }).max(50, {
    message: "Community name must not exceed 50 characters."
  }),
  handle: z.string().min(3, {
    message: "Handle must be at least 3 characters."
  }).max(30, {
    message: "Handle must not exceed 30 characters."
  }).regex(/^[a-z0-9-]+$/, {
    message: "Handle can only contain lowercase letters, numbers, and hyphens."
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

export default function CreateCommunityPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { status } = useSession();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      handle: "",
      description: "",
      website: "",
      location: "",
    },
  });

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/communities/create");
      return;
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="container mx-auto flex h-[calc(100vh-200px)] flex-col items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto flex h-[calc(100vh-200px)] flex-col items-center justify-center py-10">
        <h1 className="text-3xl font-bold">Please Sign In</h1>
        <p className="text-muted-foreground mb-4">You need to be signed in to create a community.</p>
      </div>
    );
  }

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
      const response = await fetch('/api/communities', {
        method: 'POST',
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
        throw new Error(error.error || 'Failed to create community');
      }

      const data = await response.json();
      toast({
        title: "Community Created",
        description: `Successfully created @${values.handle}`,
      });
      router.push(`/communities/${data.handle}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create community. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Create a Community</h1>
        <p className="text-muted-foreground">Start building your own community and host events</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Community Details</CardTitle>
            <CardDescription>
              Fill out the information below to create your community. You can edit these details later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormItem>
                    <FormLabel>Community Banner</FormLabel>
                    <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg border-2 border-dashed bg-muted/50">
                      {bannerPreview ? (
                        <>
                          <img 
                            src={bannerPreview} 
                            alt="Banner preview" 
                            className="h-full w-full object-cover" 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2"
                            onClick={() => setBannerPreview(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
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
                      <div className="relative mb-4 h-36 w-36 overflow-hidden rounded-full border-2 border-dashed bg-muted/50">
                        {avatarPreview ? (
                          <>
                            <img 
                              src={avatarPreview} 
                              alt="Avatar preview" 
                              className="h-full w-full object-cover" 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1"
                              onClick={() => setAvatarPreview(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
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
                      <p className="mt-2 text-center text-xs text-muted-foreground">
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
                              <Input placeholder="Tech Enthusiasts" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="handle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Community Handle</FormLabel>
                            <div className="flex items-center">
                              <span className="mr-1 text-muted-foreground">@</span>
                              <FormControl>
                                <Input placeholder="tech-enthusiasts" {...field} />
                              </FormControl>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              This will be your unique identifier. Only lowercase letters, numbers, and hyphens.
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                            placeholder="Tell people what your community is about..."
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
                            <Input placeholder="https://example.com" {...field} />
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
                            <Input placeholder="San Francisco, CA" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full gap-1"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        <span>Creating Community...</span>
                      </div>
                    ) : (
                      <>
                        Create Community
                        <ArrowRight size={16} />
                      </>
                    )}
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