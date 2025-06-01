"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Form {
  id: string;
  title: string;
  description: string;
  fields: {
    id: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
  }[];
}

export default function SubmitFormPage({
  params,
}: {
  params: { id: string; formId: string };
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create dynamic form schema based on form fields
  const formSchema = z.object(
    form?.fields.reduce((acc, field) => {
      let fieldSchema = z.any();
      switch (field.type) {
        case "text":
          fieldSchema = z.string().min(1, `${field.label} is required`);
          break;
        case "email":
          fieldSchema = z.string().email("Invalid email address");
          break;
        case "number":
          fieldSchema = z.number().min(0, "Must be a positive number");
          break;
        case "select":
          fieldSchema = z.string().min(1, `${field.label} is required`);
          break;
        case "checkbox":
          fieldSchema = z.boolean();
          break;
      }
      if (field.required) {
        fieldSchema = fieldSchema.refine((val) => val !== undefined && val !== "", {
          message: `${field.label} is required`,
        });
      }
      return { ...acc, [field.id]: fieldSchema };
    }, {}) || {}
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    fetchForm();
  }, []);

  async function fetchForm() {
    try {
      const response = await fetch(`/api/events/${params.id}/forms/${params.formId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch form");
      }
      const data = await response.json();
      setForm(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load form",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(data: any) {
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit the form",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/events/${params.id}/forms/${params.formId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: Object.entries(data).map(([fieldId, value]) => ({
            fieldId,
            value,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      toast({
        title: "Success",
        description: "Form submitted successfully",
      });

      router.push(`/events/${params.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit form",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="mb-2 text-lg font-medium">Form Not Found</h3>
            <p className="mb-4 text-center text-muted-foreground">
              The form you're looking for doesn't exist or has been removed
            </p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>{form.title}</CardTitle>
          <p className="text-muted-foreground">{form.description}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {form.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </Label>
                {field.type === "text" && (
                  <Input
                    id={field.id}
                    {...register(field.id)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                )}
                {field.type === "email" && (
                  <Input
                    id={field.id}
                    type="email"
                    {...register(field.id)}
                    placeholder="Enter your email"
                  />
                )}
                {field.type === "number" && (
                  <Input
                    id={field.id}
                    type="number"
                    {...register(field.id, { valueAsNumber: true })}
                    placeholder="Enter a number"
                  />
                )}
                {field.type === "select" && (
                  <Select
                    onValueChange={(value) => setValue(field.id, value)}
                    defaultValue=""
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {field.type === "checkbox" && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={field.id}
                      {...register(field.id)}
                    />
                    <Label htmlFor={field.id}>Yes</Label>
                  </div>
                )}
                {errors[field.id] && (
                  <p className="text-sm text-red-500">
                    {errors[field.id]?.message as string}
                  </p>
                )}
              </div>
            ))}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 