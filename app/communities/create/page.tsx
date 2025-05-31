"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight, Upload } from "lucide-react";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Community Created",
      description: `Successfully created @${values.handle}`,
    });
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
                <div className="flex flex-col gap-6 md:flex-row">
                  <div className="flex flex-col items-center md:w-1/3">
                    <div className="mb-2 text-center">
                      <FormLabel>Community Avatar</FormLabel>
                    </div>
                    <div className="relative mb-4 h-36 w-36 overflow-hidden rounded-full border-2 border-dashed bg-muted/50">
                      {avatarPreview ? (
                        <img 
                          src={avatarPreview} 
                          alt="Avatar preview" 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Upload className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <label htmlFor="avatar-upload">
                      <Button variant="outline" size="sm" className="cursor-pointer" type="button">
                        Choose Image
                      </Button>
                      <Input 
                        id="avatar-upload"
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
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

                <Button type="submit" className="w-full gap-1">
                  Create Community
                  <ArrowRight size={16} />
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}