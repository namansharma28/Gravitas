"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FileSpreadsheet, Upload, AlertCircle, Check, Loader2 } from "lucide-react";
import * as XLSX from 'xlsx';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ImportResponsesDialogProps {
  eventId: string;
  formId: string;
  formFields: {
    id: string;
    label: string;
    type: string;
  }[];
  onSuccess: () => void;
  trigger: React.ReactNode;
}

export default function ImportResponsesDialog({
  eventId,
  formId,
  formFields,
  onSuccess,
  trigger,
}: ImportResponsesDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [mappedFields, setMappedFields] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'upload' | 'map' | 'preview' | 'importing'>('upload');
  const [importStats, setImportStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file type
    const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileType || '')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel or CSV file",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setIsLoading(true);

    try {
      const data = await readExcelFile(selectedFile);
      if (data && data.length > 0) {
        setPreviewData(data);
        
        // Initialize field mapping
        const excelHeaders = Object.keys(data[0]);
        const initialMapping: Record<string, string> = {};
        
        // Try to auto-map fields based on similar names
        formFields.forEach(field => {
          const fieldLower = field.label.toLowerCase();
          const matchingHeader = excelHeaders.find(header => 
            header.toLowerCase() === fieldLower ||
            header.toLowerCase().includes(fieldLower) ||
            fieldLower.includes(header.toLowerCase())
          );
          
          if (matchingHeader) {
            initialMapping[field.id] = matchingHeader;
          }
        });
        
        setMappedFields(initialMapping);
        setStep('map');
      } else {
        toast({
          title: "Empty file",
          description: "The uploaded file contains no data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error reading Excel file:', error);
      toast({
        title: "Error",
        description: "Failed to read the Excel file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };

  const handleFieldMapping = (fieldId: string, excelHeader: string) => {
    setMappedFields(prev => ({
      ...prev,
      [fieldId]: excelHeader
    }));
  };

  const goToPreview = () => {
    // Check if all required fields are mapped
    const requiredFields = formFields.filter(field => field.type !== 'file');
    const missingMappings = requiredFields.filter(field => !mappedFields[field.id]);
    
    if (missingMappings.length > 0) {
      toast({
        title: "Missing field mappings",
        description: `Please map all required fields before proceeding`,
        variant: "destructive",
      });
      return;
    }
    
    setStep('preview');
  };

  const handleImport = async () => {
    if (!previewData || previewData.length === 0) return;
    
    setStep('importing');
    setIsLoading(true);
    
    const stats = {
      total: previewData.length,
      success: 0,
      failed: 0,
    };
    
    try {
      // Process each row in the Excel file
      for (const row of previewData) {
        try {
          // Transform the data according to the field mapping
          const answers = formFields.map(field => {
            const excelHeader = mappedFields[field.id];
            let value = excelHeader ? row[excelHeader] : null;
            
            // Convert value based on field type
            if (field.type === 'number' && value !== null) {
              value = Number(value);
            } else if (field.type === 'checkbox' && value !== null) {
              // Convert string "true"/"false" to boolean
              if (typeof value === 'string') {
                value = value.toLowerCase() === 'true' || value.toLowerCase() === 'yes';
              } else {
                value = Boolean(value);
              }
            }
            
            return {
              fieldId: field.id,
              value: value
            };
          }).filter(answer => answer.value !== null && answer.value !== undefined);
          
          // Submit the form response
          const response = await fetch(`/api/events/${eventId}/forms/${formId}/import-response`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              answers,
              email: row.Email || row.email || '',
              name: row.Name || row.name || row['Full Name'] || row['Full name'] || '',
            }),
          });
          
          if (response.ok) {
            stats.success++;
          } else {
            stats.failed++;
          }
        } catch (error) {
          console.error('Error importing row:', error);
          stats.failed++;
        }
      }
      
      setImportStats(stats);
      
      toast({
        title: "Import completed",
        description: `Successfully imported ${stats.success} of ${stats.total} responses`,
        variant: stats.failed > 0 ? "destructive" : "default",
      });
      
      // Close dialog and refresh data after a short delay
      setTimeout(() => {
        setIsOpen(false);
        onSuccess();
        resetState();
      }, 2000);
      
    } catch (error) {
      console.error('Error during import:', error);
      toast({
        title: "Import failed",
        description: "An error occurred during the import process",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setPreviewData(null);
    setMappedFields({});
    setStep('upload');
    setImportStats({
      total: 0,
      success: 0,
      failed: 0,
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    resetState();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetState();
    }}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Responses from Excel
          </DialogTitle>
          <DialogDescription>
            Import form responses from an Excel or CSV file exported from Google Forms
          </DialogDescription>
        </DialogHeader>
        
        {step === 'upload' && (
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="excel-file"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              <label
                htmlFor="excel-file"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <FileSpreadsheet className="h-12 w-12 text-gray-400" />
                <div>
                  <p className="font-medium">
                    {isLoading ? "Processing file..." : "Click to upload Excel file"}
                  </p>
                  <p className="text-sm text-gray-500">
                    XLSX, XLS, or CSV up to 10MB
                  </p>
                </div>
              </label>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Make sure your Excel file has headers in the first row that match your form fields.
                Each row should represent one form submission.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        {step === 'map' && previewData && (
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <h3 className="font-medium">Map Excel Columns to Form Fields</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select which Excel column corresponds to each form field
            </p>
            
            <div className="space-y-4">
              {formFields.filter(field => field.type !== 'file').map((field) => (
                <div key={field.id} className="grid grid-cols-2 gap-4 items-center">
                  <div>
                    <p className="font-medium text-sm">{field.label}</p>
                    <p className="text-xs text-muted-foreground">{field.type}</p>
                  </div>
                  <select
                    className="border rounded-md p-2 text-sm"
                    value={mappedFields[field.id] || ''}
                    onChange={(e) => handleFieldMapping(field.id, e.target.value)}
                  >
                    <option value="">-- Select Excel Column --</option>
                    {previewData && Object.keys(previewData[0]).map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>
                File upload fields cannot be imported and will be skipped.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        {step === 'preview' && previewData && (
          <div className="space-y-4 py-4">
            <h3 className="font-medium">Preview Import Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {previewData.length} responses will be imported
            </p>
            
            <div className="border rounded-md overflow-hidden">
              <div className="max-h-[300px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      {formFields.filter(field => mappedFields[field.id]).map((field) => (
                        <th key={field.id} className="p-2 text-left font-medium">
                          {field.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 5).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t">
                        {formFields.filter(field => mappedFields[field.id]).map((field) => (
                          <td key={field.id} className="p-2 border-r last:border-r-0">
                            {row[mappedFields[field.id]] !== undefined ? String(row[mappedFields[field.id]]) : '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewData.length > 5 && (
                <div className="p-2 text-center text-sm text-muted-foreground border-t">
                  Showing 5 of {previewData.length} responses
                </div>
              )}
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Ready to Import</AlertTitle>
              <AlertDescription>
                This will create {previewData.length} new form responses. This action cannot be undone.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        {step === 'importing' && (
          <div className="space-y-4 py-8 text-center">
            {isLoading ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <h3 className="font-medium text-lg">Importing Responses...</h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we import your data
                </p>
              </>
            ) : (
              <>
                <Check className="h-12 w-12 mx-auto text-green-500" />
                <h3 className="font-medium text-lg">Import Complete</h3>
                <div className="flex justify-center gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{importStats.total}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-500">{importStats.success}</p>
                    <p className="text-sm text-muted-foreground">Successful</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-500">{importStats.failed}</p>
                    <p className="text-sm text-muted-foreground">Failed</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}
          
          {step === 'map' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button onClick={goToPreview} disabled={isLoading}>
                Next
              </Button>
            </>
          )}
          
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('map')}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={isLoading}>
                Import Responses
              </Button>
            </>
          )}
          
          {step === 'importing' && !isLoading && (
            <Button onClick={handleClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}