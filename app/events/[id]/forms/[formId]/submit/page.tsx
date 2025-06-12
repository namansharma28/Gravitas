"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Upload, X, FileText } from "lucide-react";

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
    fileTypes?: string[];
    maxFileSize?: number;
  }[];
}

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
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
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile>>({});
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

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
      
      // Initialize form data with default values
      const initialData: Record<string, any> = {};
      data.fields.forEach((field: any) => {
        if (field.type === "checkbox") {
          if (field.options && field.options.length > 1) {
            initialData[field.id] = []; // Multiple checkboxes
          } else {
            initialData[field.id] = false; // Single checkbox
          }
        } else if (field.type === "file") {
          initialData[field.id] = null; // File field
        } else {
          initialData[field.id] = "";
        }
      });
      setFormData(initialData);
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

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleFileUpload = async (fieldId: string, file: File, field: any) => {
    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (field.fileTypes && !field.fileTypes.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: `Please upload a file with one of these extensions: ${field.fileTypes.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    const maxSizeBytes = (field.maxFileSize || 5) * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSizeBytes) {
      toast({
        title: "File too large",
        description: `File size must be less than ${field.maxFileSize || 5}MB`,
        variant: "destructive",
      });
      return;
    }

    setUploadingFiles(prev => ({ ...prev, [fieldId]: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      const uploadedFile: UploadedFile = {
        id: crypto.randomUUID(),
        name: file.name,
        url: data.url,
        size: file.size,
      };

      setUploadedFiles(prev => ({ ...prev, [fieldId]: uploadedFile }));
      handleInputChange(fieldId, uploadedFile.url);

      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(prev => ({ ...prev, [fieldId]: false }));
    }
  };

  const removeFile = (fieldId: string) => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[fieldId];
      return newFiles;
    });
    handleInputChange(fieldId, null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateForm = () => {
    if (!form) return false;

    for (const field of form.fields) {
      if (field.required) {
        const value = formData[field.id];
        
        if (field.type === "checkbox") {
          if (field.options && field.options.length > 1) {
            // Multiple checkboxes - check if at least one is selected
            if (!Array.isArray(value) || value.length === 0) {
              toast({
                title: "Error",
                description: `${field.label} is required`,
                variant: "destructive",
              });
              return false;
            }
          } else {
            // Single checkbox
            if (!value) {
              toast({
                title: "Error",
                description: `${field.label} is required`,
                variant: "destructive",
              });
              return false;
            }
          }
        } else if (field.type === "file") {
          if (!value) {
            toast({
              title: "Error",
              description: `${field.label} is required`,
              variant: "destructive",
            });
            return false;
          }
        } else {
          if (!value || (typeof value === "string" && !value.trim())) {
            toast({
              title: "Error",
              description: `${field.label} is required`,
              variant: "destructive",
            });
            return false;
          }
        }
      }
    }
    return true;
  };

  async function onSubmit() {
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit the form",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const answers = Object.entries(formData).map(([fieldId, value]) => ({
        fieldId,
        value,
      }));

      const response = await fetch(`/api/events/${params.id}/forms/${params.formId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit form");
      }

      toast({
        title: "Success",
        description: "Form submitted successfully",
      });

      router.push(`/events/${params.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit form",
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
              The form you&apos;re looking for doesn&apos;t exist or has been removed
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
          <div className="space-y-6">
            {form.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                
                {field.type === "text" && (
                  <Input
                    id={field.id}
                    value={formData[field.id] || ""}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                )}
                
                {field.type === "email" && (
                  <Input
                    id={field.id}
                    type="email"
                    value={formData[field.id] || ""}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder="Enter your email"
                  />
                )}
                
                {field.type === "number" && (
                  <Input
                    id={field.id}
                    type="number"
                    value={formData[field.id] || ""}
                    onChange={(e) => handleInputChange(field.id, parseFloat(e.target.value) || "")}
                    placeholder="Enter a number"
                  />
                )}
                
                {field.type === "select" && (
                  <Select
                    onValueChange={(value) => handleInputChange(field.id, value)}
                    value={formData[field.id] || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.filter(option => option.trim()).map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {field.type === "checkbox" && (
                  <div className="space-y-2">
                    {field.options && field.options.length > 1 ? (
                      // Multiple checkbox options
                      field.options.filter(option => option.trim()).map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${field.id}-${option}`}
                            checked={(formData[field.id] || []).includes(option)}
                            onCheckedChange={(checked) => {
                              const currentValues = formData[field.id] || [];
                              if (checked) {
                                handleInputChange(field.id, [...currentValues, option]);
                              } else {
                                handleInputChange(field.id, currentValues.filter((v: string) => v !== option));
                              }
                            }}
                          />
                          <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                        </div>
                      ))
                    ) : (
                      // Single checkbox
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={field.id}
                          checked={formData[field.id] || false}
                          onCheckedChange={(checked) => handleInputChange(field.id, checked)}
                        />
                        <Label htmlFor={field.id}>
                          {field.options?.[0]?.trim() || field.label}
                        </Label>
                      </div>
                    )}
                  </div>
                )}

                {field.type === "file" && (
                  <div className="space-y-4">
                    {!uploadedFiles[field.id] ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          id={field.id}
                          className="hidden"
                          accept={field.fileTypes?.map(type => `.${type}`).join(',')}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(field.id, file, field);
                            }
                          }}
                          disabled={uploadingFiles[field.id]}
                        />
                        <label
                          htmlFor={field.id}
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <Upload className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="font-medium">
                              {uploadingFiles[field.id] ? "Uploading..." : "Click to upload"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {field.fileTypes?.join(', ').toUpperCase()} up to {field.maxFileSize || 5}MB
                            </p>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{uploadedFiles[field.id].name}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(uploadedFiles[field.id].size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(field.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            <Button 
              onClick={onSubmit} 
              className="w-full" 
              disabled={isSubmitting || Object.values(uploadingFiles).some(Boolean)}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}