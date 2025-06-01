"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, FileText, Users, Trash2, Pencil, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Form {
  id: string;
  title: string;
  description: string;
  fields: {
    id: string;
    label: string;
    type: string;
    required: boolean;
  }[];
  responses: FormResponse[];
  createdAt: string;
}

interface FormResponse {
  id: string;
  formId: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  answers: {
    fieldId: string;
    value: string | boolean | number;
  }[];
  createdAt: string;
}

export default function FormsPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);

  useEffect(() => {
    fetchForms();
  }, []);

  async function fetchForms() {
    try {
      const response = await fetch(`/api/events/${params.id}/forms`);
      if (!response.ok) {
        throw new Error("Failed to fetch forms");
      }
      const data = await response.json();
      setForms(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load forms",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteForm(formId: string) {
    try {
      const response = await fetch(`/api/events/${params.id}/forms/${formId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete form");
      }

      toast({
        title: "Success",
        description: "Form deleted successfully",
      });

      fetchForms();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete form",
        variant: "destructive",
      });
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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Registration Forms</h1>
          <p className="mt-2 text-muted-foreground">
            Manage registration forms for your event
          </p>
        </div>
        <Button onClick={() => router.push(`/events/${params.id}/forms/create`)}>
          <Plus className="mr-2 h-4 w-4" /> Create Form
        </Button>
      </div>

      {forms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">No Forms Created</h3>
            <p className="mb-4 text-center text-muted-foreground">
              Create your first registration form to start collecting responses
            </p>
            <Button onClick={() => router.push(`/events/${params.id}/forms/create`)}>
              <Plus className="mr-2 h-4 w-4" /> Create Form
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card key={form.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{form.title}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/events/${params.id}/forms/${form.id}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/events/${params.id}/forms/${form.id}/submit`
                        );
                        toast({
                          title: "Link copied",
                          description: "Form submission link copied to clipboard",
                        });
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteForm(form.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  {form.description}
                </p>
                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {form.fields.length} fields
                  </span>
                  <span className="text-muted-foreground">
                    {form.responses.length} responses
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedForm(form)}
                  >
                    <Users className="mr-2 h-4 w-4" /> View Responses
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push(`/events/${params.id}/forms/${form.id}/edit`)}
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Edit Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedForm && (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSelectedForm(null)}
            >
              <Users className="mr-2 h-4 w-4" /> View Responses
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedForm.title} - Responses</DialogTitle>
            </DialogHeader>
            {selectedForm.responses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No responses yet</p>
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      {selectedForm.fields.map((field) => (
                        <TableHead key={field.id}>{field.label}</TableHead>
                      ))}
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedForm.responses.map((response) => (
                      <TableRow key={response.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {response.user.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {response.user.email}
                            </div>
                          </div>
                        </TableCell>
                        {selectedForm.fields.map((field) => {
                          const answer = response.answers.find(
                            (a) => a.fieldId === field.id
                          );
                          return (
                            <TableCell key={field.id}>
                              {answer ? String(answer.value) : "-"}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-muted-foreground">
                          {new Date(response.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}