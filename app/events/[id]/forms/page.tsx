"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, FileText, Users, Trash2, Pencil, Share2, Mail, QrCode, CheckSquare, Square, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ParticipantShortlistDialog from "@/components/events/participant-shortlist-dialog";
import TicketEmailDialog from "@/components/events/ticket-email-dialog";

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
  shortlisted?: boolean;
}

export default function FormsPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null);
  const [selectedResponses, setSelectedResponses] = useState<Set<string>>(new Set());
  const [isShortlistDialogOpen, setIsShortlistDialogOpen] = useState(false);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [exportingFormId, setExportingFormId] = useState<string | null>(null);

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
    setDeletingFormId(formId);
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
    } finally {
      setDeletingFormId(null);
    }
  }

  async function exportFormResponses(formId: string, formTitle: string) {
    setExportingFormId(formId);
    
    try {
      const response = await fetch(`/api/events/${params.id}/forms/${formId}/export`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to export data');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or create default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `${formTitle.replace(/[^a-zA-Z0-9]/g, '_')}_responses.xlsx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Form responses exported to ${filename}`,
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export form responses",
        variant: "destructive",
      });
    } finally {
      setExportingFormId(null);
    }
  }

  const handleSelectResponse = (responseId: string, checked: boolean) => {
    const newSelected = new Set(selectedResponses);
    if (checked) {
      newSelected.add(responseId);
    } else {
      newSelected.delete(responseId);
    }
    setSelectedResponses(newSelected);
  };

  const handleSelectAll = (formId: string, checked: boolean) => {
    const form = forms.find(f => f.id === formId);
    if (!form) return;

    const newSelected = new Set(selectedResponses);
    form.responses.forEach(response => {
      if (checked) {
        newSelected.add(response.id);
      } else {
        newSelected.delete(response.id);
      }
    });
    setSelectedResponses(newSelected);
  };

  const getSelectedResponsesForForm = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    if (!form) return [];
    
    return form.responses.filter(response => selectedResponses.has(response.id));
  };

  const handleShortlistSuccess = () => {
    setSelectedResponses(new Set());
    fetchForms();
    setIsShortlistDialogOpen(false);
  };

  const handleTicketSuccess = () => {
    setIsTicketDialogOpen(false);
  };

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
        <div className="space-y-8">
          {forms.map((form) => (
            <Card key={form.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span>{form.title}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/events/${params.id}/forms/${form.id}/edit`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
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
                              <Share2 className="mr-2 h-4 w-4" />
                              Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => exportFormResponses(form.id, form.title)}
                              disabled={exportingFormId === form.id || form.responses.length === 0}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              {exportingFormId === form.id ? "Exporting..." : "Export as Excel"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={deletingFormId === form.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the form
                                and all associated responses.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteForm(form.id)}
                                disabled={deletingFormId === form.id}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {deletingFormId === form.id ? "Deleting..." : "Delete Form"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {form.description}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{form.fields.length} fields</span>
                    <span>{form.responses.length} responses</span>
                    <span>{form.responses.filter(r => r.shortlisted).length} shortlisted</span>
                  </div>
                  
                  {form.responses.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportFormResponses(form.id, form.title)}
                        disabled={exportingFormId === form.id}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {exportingFormId === form.id ? "Exporting..." : "Export Excel"}
                      </Button>

                      {selectedResponses.size > 0 && (
                        <>
                          <ParticipantShortlistDialog
                            eventId={params.id}
                            formId={form.id}
                            selectedResponses={getSelectedResponsesForForm(form.id)}
                            onSuccess={handleShortlistSuccess}
                            trigger={
                              <Button variant="outline" size="sm">
                                <CheckSquare className="mr-2 h-4 w-4" />
                                Shortlist ({selectedResponses.size})
                              </Button>
                            }
                          />
                          
                          <TicketEmailDialog
                            eventId={params.id}
                            selectedResponses={getSelectedResponsesForForm(form.id)}
                            onSuccess={handleTicketSuccess}
                            trigger={
                              <Button size="sm">
                                <Mail className="mr-2 h-4 w-4" />
                                Send Tickets ({selectedResponses.size})
                              </Button>
                            }
                          />
                        </>
                      )}
                    </div>
                  )}
                </div>

                {form.responses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No responses yet</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={form.responses.every(r => selectedResponses.has(r.id))}
                              onCheckedChange={(checked) => handleSelectAll(form.id, !!checked)}
                            />
                          </TableHead>
                          <TableHead>Participant</TableHead>
                          {form.fields.slice(0, 3).map((field) => (
                            <TableHead key={field.id}>{field.label}</TableHead>
                          ))}
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {form.responses.map((response) => (
                          <TableRow key={response.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedResponses.has(response.id)}
                                onCheckedChange={(checked) => handleSelectResponse(response.id, !!checked)}
                              />
                            </TableCell>
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
                            {form.fields.slice(0, 3).map((field) => {
                              const answer = response.answers.find(
                                (a) => a.fieldId === field.id
                              );
                              return (
                                <TableCell key={field.id}>
                                  {answer ? String(answer.value) : "-"}
                                </TableCell>
                              );
                            })}
                            <TableCell>
                              {response.shortlisted ? (
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                  Shortlisted
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                  Pending
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(response.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}