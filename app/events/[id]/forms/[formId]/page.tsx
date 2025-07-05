"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, FileText, Users, Trash2, Pencil, Share2, Mail, QrCode, CheckSquare, Square, Download, ArrowLeft } from "lucide-react";
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
import Link from "next/link";

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
  checkedIn?: boolean;
  checkedInAt?: string;
}

export default function FormPage({ params }: { params: { id: string; formId: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null);
  const [selectedResponses, setSelectedResponses] = useState<Set<string>>(new Set());
  const [isShortlistDialogOpen, setIsShortlistDialogOpen] = useState(false);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [exportingFormId, setExportingFormId] = useState<string | null>(null);

  useEffect(() => {
    fetchForm();
  }, []);

  async function fetchForm() {
    try {
      const response = await fetch(`/api/events/${params.id}/forms/${params.formId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch form");
      }
      
      // Get form details
      const formData = await response.json();
      
      // Get form responses
      const responsesResponse = await fetch(`/api/events/${params.id}/forms/${params.formId}/responses`);
      if (responsesResponse.ok) {
        const responsesData = await responsesResponse.json();
        formData.responses = responsesData;
      } else {
        formData.responses = [];
      }
      
      setForm(formData);
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

  async function deleteForm() {
    setDeletingFormId(params.formId);
    try {
      const response = await fetch(`/api/events/${params.id}/forms/${params.formId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete form");
      }

      toast({
        title: "Success",
        description: "Form deleted successfully",
      });

      router.push(`/events/${params.id}/forms`);
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

  async function exportFormResponses() {
    setExportingFormId(params.formId);
    
    try {
      const response = await fetch(`/api/events/${params.id}/forms/${params.formId}/export`);
      
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
      let filename = `${form?.title.replace(/[^a-zA-Z0-9]/g, '_')}_responses.xlsx`;
      
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

  const handleSelectAll = (checked: boolean) => {
    if (!form) return;

    const newSelected = new Set<string>();
    if (checked) {
      form.responses.forEach(response => {
        newSelected.add(response.id);
      });
    }
    setSelectedResponses(newSelected);
  };

  const getSelectedResponses = () => {
    if (!form) return [];
    return form.responses.filter(response => selectedResponses.has(response.id));
  };

  const handleShortlistSuccess = () => {
    setSelectedResponses(new Set());
    fetchForm();
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

  if (!form) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="mb-2 text-lg font-medium">Form Not Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              The form you&apos;re looking for doesn&apos;t exist or has been removed
            </p>
            <Button onClick={() => router.push(`/events/${params.id}/forms`)}>Back to Forms</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Button variant="ghost" className="mb-4" asChild>
            <Link href={`/events/${params.id}/forms`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Forms
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{form.title}</h1>
          <p className="mt-2 text-muted-foreground">
            {form.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/events/${params.id}/forms/${params.formId}/scan`}>
              <QrCode className="mr-2 h-4 w-4" />
              Scan QR Codes
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/events/${params.id}/forms/${params.formId}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Form
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/events/${params.id}/forms/${params.formId}/submit`
                  );
                  toast({
                    title: "Link copied",
                    description: "Form submission link copied to clipboard",
                  });
                }}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Copy Submission Link
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={exportFormResponses}
                disabled={exportingFormId === params.formId || form.responses.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                {exportingFormId === params.formId ? "Exporting..." : "Export as Excel"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={deletingFormId === params.formId}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Form
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
                  onClick={deleteForm}
                  disabled={deletingFormId === params.formId}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deletingFormId === params.formId ? "Deleting..." : "Delete Form"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Responses ({form.responses.length})</CardTitle>
            <div className="flex flex-wrap gap-2">
              {form.responses.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportFormResponses}
                    disabled={exportingFormId === params.formId}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {exportingFormId === params.formId ? "Exporting..." : "Export Excel"}
                  </Button>

                  {selectedResponses.size > 0 && (
                    <>
                      <ParticipantShortlistDialog
                        eventId={params.id}
                        formId={params.formId}
                        selectedResponses={getSelectedResponses()}
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
                        selectedResponses={getSelectedResponses()}
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
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {form.responses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No responses yet</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={form.responses.length > 0 && selectedResponses.size === form.responses.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Participant</TableHead>
                    {form.fields.slice(0, 3).map((field) => (
                      <TableHead key={field.id}>{field.label}</TableHead>
                    ))}
                    <TableHead>Status</TableHead>
                    <TableHead>Check-in</TableHead>
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
                      <TableCell>
                        {response.checkedIn ? (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                            Not Checked In
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
    </div>
  );
}