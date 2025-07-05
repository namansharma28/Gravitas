"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarDays, Clock, MapPin, ArrowLeft, Upload, X } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Event title must be at least 2 characters.",
  }).max(100, {
    message: "Event title must not exceed 100 characters."
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters."
  }).max(1000, {
    message: "Description must not exceed 1000 characters."
  }),
  startDate: z.string().min(1, {
    message: "Please select a start date."
  }),
  endDate: z.string().optional(),
  time: z.string().min(1, {
    message: "Please select a time."
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters."
  }).max(200, {
    message: "Location must not exceed 200 characters."
  }),
  capacity: z.number().min(1, {
    message: "Capacity must be at least 1."
  }).max(10000, {
    message: "Capacity must not exceed 10000."
  }),
  image: z.string().optional(),
  isMultiDay: z.boolean().default(false),
});

export default function CreateEventPage({ params }: { params: { handle: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      time: "",
      location: "",
      capacity: 100,
      image: "",
      isMultiDay: false,
    },
  });

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
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
      form.setValue('image', data.url);
      setImagePreview(data.url);
      return data.url;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      try {
        await handleImageUpload(file);
      } catch (error) {
        setImagePreview(null);
      }
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isUploading) {
      toast({
        title: "Please wait",
        description: "Image is still uploading. Please wait before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Prepare the data for submission
      const eventData = {
        title: values.title,
        description: values.description,
        date: values.startDate,
        endDate: values.isMultiDay ? values.endDate : undefined,
        time: values.time,
        location: values.location,
        capacity: values.capacity,
        image: values.image,
        isMultiDay: values.isMultiDay,
      };

      const response = await fetch(`/api/communities/${params.handle}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const data = await response.json();
      toast({
        title: "Event Created",
        description: "Your event has been created successfully.",
      });
      router.push(`/communities/${params.handle}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
        <h1 className="text-4xl font-bold tracking-tight">Create Event</h1>
        <p className="text-muted-foreground">Create a new event for your community</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>
              Fill out the information below to create your event.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Web Development Workshop" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell people what your event is about..."
                          className="min-h-[120px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isMultiDay"
                      checked={isMultiDay}
                      onCheckedChange={(checked) => {
                        setIsMultiDay(!!checked);
                        form.setValue('isMultiDay', !!checked);
                        if (!checked) {
                          form.setValue('endDate', '');
                        }
                      }}
                    />
                    <Label htmlFor="isMultiDay">Multi-day event</Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isMultiDay ? 'Start Date' : 'Date'}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input type="date" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {isMultiDay && (
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input type="date" className="pl-10" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {!isMultiDay && (
                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input type="time" className="pl-10" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {isMultiDay && (
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input type="time" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Event venue or address" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="100"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Image</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="relative">
                            <Input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="event-image"
                              onChange={handleFileChange}
                            />
                            <label
                              htmlFor="event-image"
                              className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed p-8 hover:bg-accent"
                            >
                              <div className="flex flex-col items-center gap-2 text-center">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">Click to upload</p>
                                  <p className="text-xs text-muted-foreground">
                                    PNG, JPG or GIF (max. 5MB)
                                  </p>
                                </div>
                              </div>
                            </label>
                          </div>
                          
                          {imagePreview && (
                            <div className="relative aspect-video overflow-hidden rounded-lg">
                              <img
                                src={imagePreview}
                                alt="Event preview"
                                className="h-full w-full object-cover"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2"
                                onClick={() => {
                                  setImagePreview(null);
                                  form.setValue('image', '');
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Event..." : "Create Event"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}