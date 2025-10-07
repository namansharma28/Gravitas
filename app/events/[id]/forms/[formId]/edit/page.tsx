"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, ArrowLeft, X, ChevronUp, ChevronDown } from "lucide-react";
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
import Link from "next/link";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  fields: z.array(
    z.object({
      id: z.string(),
      label: z.string().min(1, "Label is required"),
      type: z.enum(["text", "email", "number", "select", "checkbox", "file"]),
      required: z.boolean(),
      options: z.array(z.string()).optional(),
      fileTypes: z.array(z.string()).optional(),
      maxFileSize: z.number().optional(),
      singleChoice: z.boolean().optional(),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditFormPage({ 
  params 
}: { 
  params: { id: string; formId: string } 
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      fields: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "fields",
  });

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/events/${params.id}/forms/${params.formId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch form");
        }
        const data = await response.json();
        
        form.reset({
          title: data.title,
          description: data.description,
          fields: data.fields.map((field: any) => ({
            ...field,
            options: field.options || [],
            fileTypes: field.fileTypes || [],
            maxFileSize: field.maxFileSize || 5,
            singleChoice: field.singleChoice || false,
          })),
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load form",
          variant: "destructive",
        });
        router.push(`/events/${params.id}/forms`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForm();
  }, [params.id, params.formId, form, toast, router]);

  const addOption = (fieldIndex: number) => {
    const currentOptions = form.getValues(`fields.${fieldIndex}.options`) || [];
    form.setValue(`fields.${fieldIndex}.options`, [...currentOptions, ""]);
  };

  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const currentOptions = [...(form.getValues(`fields.${fieldIndex}.options`) || [])];
    currentOptions[optionIndex] = value;
    form.setValue(`fields.${fieldIndex}.options`, currentOptions);
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const currentOptions = [...(form.getValues(`fields.${fieldIndex}.options`) || [])];
    currentOptions.splice(optionIndex, 1);
    form.setValue(`fields.${fieldIndex}.options`, currentOptions);
  };

  const updateFieldType = (fieldIndex: number, newType: string) => {
    const shouldHaveOptions = newType === "select" || newType === "checkbox";
    const isFileType = newType === "file";
    
    form.setValue(`fields.${fieldIndex}.type`, newType as any);
    
    if (shouldHaveOptions) {
      const currentOptions = form.getValues(`fields.${fieldIndex}.options`) || [];
      form.setValue(`fields.${fieldIndex}.options`, currentOptions.length > 0 ? currentOptions : [""]);
    } else {
      form.setValue(`fields.${fieldIndex}.options`, []);
    }
    
    if (isFileType) {
      const currentFileTypes = form.getValues(`fields.${fieldIndex}.fileTypes`) || [];
      form.setValue(`fields.${fieldIndex}.fileTypes`, currentFileTypes.length > 0 ? currentFileTypes : ["pdf", "doc", "docx", "txt", "jpg", "png"]);
      form.setValue(`fields.${fieldIndex}.maxFileSize`, form.getValues(`fields.${fieldIndex}.maxFileSize`) || 5);
    } else {
      form.setValue(`fields.${fieldIndex}.fileTypes`, []);
      form.setValue(`fields.${fieldIndex}.maxFileSize`, undefined);
    }
  };

  const updateFileType = (fieldIndex: number, fileTypeIndex: number, value: string) => {
    const currentFileTypes = [...(form.getValues(`fields.${fieldIndex}.fileTypes`) || [])];
    currentFileTypes[fileTypeIndex] = value;
    form.setValue(`fields.${fieldIndex}.fileTypes`, currentFileTypes);
  };

  const addFileType = (fieldIndex: number) => {
    const currentFileTypes = form.getValues(`fields.${fieldIndex}.fileTypes`) || [];
    form.setValue(`fields.${fieldIndex}.fileTypes`, [...currentFileTypes, ""]);
  };

  const removeFileType = (fieldIndex: number, fileTypeIndex: number) => {
    const currentFileTypes = [...(form.getValues(`fields.${fieldIndex}.fileTypes`) || [])];
    currentFileTypes.splice(fileTypeIndex, 1);
    form.setValue(`fields.${fieldIndex}.fileTypes`, currentFileTypes);
  };

  const updateFileSize = (fieldIndex: number, size: number) => {
    form.setValue(`fields.${fieldIndex}.maxFileSize`, size);
  };

  const moveFieldUp = (fieldIndex: number) => {
    if (fieldIndex > 0) {
      const currentFields = form.getValues("fields");
      const newFields = [...currentFields];
      [newFields[fieldIndex - 1], newFields[fieldIndex]] = [newFields[fieldIndex], newFields[fieldIndex - 1]];
      form.setValue("fields", newFields);
    }
  };

  const moveFieldDown = (fieldIndex: number) => {
    const currentFields = form.getValues("fields");
    if (fieldIndex < currentFields.length - 1) {
      const newFields = [...currentFields];
      [newFields[fieldIndex], newFields[fieldIndex + 1]] = [newFields[fieldIndex + 1], newFields[fieldIndex]];
      form.setValue("fields", newFields);
    }
  };

  async function onSubmit(data: FormValues) {
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to edit a form",
        variant: "destructive",
      });
      return;
    }

    // Validate that select and checkbox fields have options
    for (const field of data.fields) {
      if ((field.type === "select" || field.type === "checkbox") && (!field.options || field.options.length === 0 || field.options.every(opt => !opt.trim()))) {
        toast({
          title: "Error",
          description: `Field "${field.label}" requires at least one option`,
          variant: "destructive",
        });
        return;
      }
      
      if (field.type === "file" && (!field.fileTypes || field.fileTypes.length === 0 || field.fileTypes.every(type => !type.trim()))) {
        toast({
          title: "Error",
          description: `File field "${field.label}" requires at least one file type`,
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/events/${params.id}/forms/${params.formId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update form");
      }

      toast({
        title: "Success",
        description: "Form updated successfully",
      });

      router.push(`/events/${params.id}/forms`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update form",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const fileTypeOptions = [
    { value: "pdf", label: "PDF" },
    { value: "doc", label: "DOC" },
    { value: "docx", label: "DOCX" },
    { value: "txt", label: "TXT" },
    { value: "jpg", label: "JPG" },
    { value: "jpeg", label: "JPEG" },
    { value: "png", label: "PNG" },
    { value: "gif", label: "GIF" },
    { value: "zip", label: "ZIP" },
    { value: "rar", label: "RAR" },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Button variant="ghost" className="mb-4" asChild>
          <Link href={`/events/${params.id}/forms`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forms
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Form</h1>
        <p className="mt-2 text-muted-foreground">
          Update your registration form
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Form Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="Enter form title"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Enter form description"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Form Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => {
              const watchedField = form.watch(`fields.${index}`);
              
              return (
                <div key={field.id} className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Field {index + 1}</h3>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveFieldUp(index)}
                        disabled={index === 0}
                        title="Move field up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveFieldDown(index)}
                        disabled={index === fields.length - 1}
                        title="Move field down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        title="Delete field"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`fields.${index}.label`}>Label</Label>
                      <Input
                        id={`fields.${index}.label`}
                        {...form.register(`fields.${index}.label`)}
                        placeholder="Enter field label"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`fields.${index}.type`}>Type</Label>
                      <Select
                        onValueChange={(value) => updateFieldType(index, value)}
                        value={watchedField?.type || field.type}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="select">Select (Dropdown)</SelectItem>
                          <SelectItem value="checkbox">Checkbox</SelectItem>
                          <SelectItem value="file">File Upload</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`fields.${index}.required`}
                      checked={watchedField?.required || field.required}
                      onCheckedChange={(checked) => 
                        form.setValue(`fields.${index}.required`, !!checked)
                      }
                    />
                    <Label htmlFor={`fields.${index}.required`}>Required</Label>
                  </div>

                  {/* Options for select and checkbox fields */}
                  {(watchedField?.type === "select" || watchedField?.type === "checkbox") && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Options</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(index)}
                        >
                          <Plus className="mr-1 h-3 w-3" /> Add Option
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {(watchedField?.options || []).map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2">
                            <Input
                              placeholder={`Option ${optionIndex + 1}`}
                              value={option}
                              onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeOption(index, optionIndex)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {(!watchedField?.options || watchedField.options.length === 0) && (
                          <p className="text-sm text-muted-foreground">
                            Add at least one option for this field type
                          </p>
                        )}
                      </div>
                      
                      {/* Single Choice option for checkbox fields only */}
                      {watchedField?.type === "checkbox" && (
                        <div className="flex items-center space-x-2 pt-2 border-t">
                          <Checkbox
                            id={`fields.${index}.singleChoice`}
                            checked={watchedField?.singleChoice || false}
                            onCheckedChange={(checked) => 
                              form.setValue(`fields.${index}.singleChoice`, !!checked)
                            }
                          />
                          <Label htmlFor={`fields.${index}.singleChoice`} className="text-sm">
                            Single Choice (allow only one selection)
                          </Label>
                        </div>
                      )}
                    </div>
                  )}

                  {/* File upload configuration */}
                  {watchedField?.type === "file" && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Allowed File Types</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addFileType(index)}
                          >
                            <Plus className="mr-1 h-3 w-3" /> Add File Type
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {(watchedField?.fileTypes || []).map((fileType, fileTypeIndex) => (
                            <div key={fileTypeIndex} className="flex items-center gap-2">
                              <Select
                                value={fileType}
                                onValueChange={(value) => updateFileType(index, fileTypeIndex, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select file type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {fileTypeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFileType(index, fileTypeIndex)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {(!watchedField?.fileTypes || watchedField.fileTypes.length === 0) && (
                            <p className="text-sm text-muted-foreground">
                              Add at least one allowed file type
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`fields.${index}.maxFileSize`}>Max File Size (MB)</Label>
                        <Input
                          id={`fields.${index}.maxFileSize`}
                          type="number"
                          min="1"
                          max="50"
                          value={watchedField?.maxFileSize || 5}
                          onChange={(e) => updateFileSize(index, parseInt(e.target.value) || 5)}
                          placeholder="5"
                        />
                        <p className="text-xs text-muted-foreground">
                          Maximum file size allowed for upload (1-50 MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  id: crypto.randomUUID(),
                  label: "",
                  type: "text",
                  required: false,
                  options: [],
                  fileTypes: [],
                  maxFileSize: 5,
                  singleChoice: false,
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" /> Add Field
            </Button>
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
            {isSubmitting ? "Updating..." : "Update Form"}
          </Button>
        </div>
      </form>
    </div>
  );
}