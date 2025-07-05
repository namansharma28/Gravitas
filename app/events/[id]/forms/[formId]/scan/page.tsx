"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { QrCode, UserCheck, UserX, Camera, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import QR scanner to avoid SSR issues
const QrScanner = dynamic(() => import("react-qr-scanner"), { ssr: false });

interface ScanResult {
  participantId: string;
  name: string;
  email: string;
  formId: string;
  eventId: string;
  checkInCode: string;
  isValid: boolean;
  alreadyCheckedIn?: boolean;
  checkedInAt?: string;
}

interface FormDetails {
  id: string;
  title: string;
  description: string;
  eventId: string;
  eventTitle: string;
}

export default function FormQRScanPage({
  params,
}: {
  params: { id: string; formId: string };
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [formDetails, setFormDetails] = useState<FormDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);

  useEffect(() => {
    fetchFormDetails();
  }, []);

  const fetchFormDetails = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}/forms/${params.formId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch form details");
      }
      const data = await response.json();
      setFormDetails({
        id: data.id,
        title: data.title,
        description: data.description,
        eventId: params.id,
        eventTitle: "Event" // We'll get this from the event API
      });
      
      // Fetch event details to get the title
      const eventResponse = await fetch(`/api/events/${params.id}`);
      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        setFormDetails(prev => prev ? {
          ...prev,
          eventTitle: eventData.title
        } : null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load form details",
        variant: "destructive",
      });
      router.push(`/events/${params.id}/forms`);
    } finally {
      setIsLoading(false);
    }
  };

  const processQRCode = async (qrData: string) => {
    setIsProcessing(true);
    
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(qrData);
      } catch {
        throw new Error('Invalid QR code format');
      }

      // Validate QR code structure
      if (!parsedData.participantId || !parsedData.name || !parsedData.checkInCode) {
        throw new Error('Invalid ticket QR code');
      }

      // Check if the QR code is for this specific form
      if (parsedData.formId !== params.formId) {
        throw new Error('This QR code is for a different form. Please scan a QR code for this specific form.');
      }

      // Verify with backend
      const response = await fetch(`/api/events/${params.id}/forms/${params.formId}/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrData: parsedData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to verify ticket');
      }

      const result = await response.json();
      
      const scanResult: ScanResult = {
        ...parsedData,
        isValid: result.valid,
        alreadyCheckedIn: result.alreadyCheckedIn,
        checkedInAt: result.checkedInAt,
      };

      setScanResult(scanResult);
      setScanHistory(prev => [scanResult, ...prev.slice(0, 9)]); // Keep last 10 scans

      if (result.valid && !result.alreadyCheckedIn) {
        toast({
          title: "Check-in Successful",
          description: `${parsedData.name} has been checked in`,
        });
      } else if (result.alreadyCheckedIn) {
        toast({
          title: "Already Checked In",
          description: `${parsedData.name} was already checked in`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Scan Error",
        description: error.message || "Failed to process QR code",
        variant: "destructive",
      });
      
      setScanResult({
        participantId: '',
        name: 'Unknown',
        email: '',
        formId: '',
        eventId: '',
        checkInCode: '',
        isValid: false,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScan = (data: any) => {
    if (data && !isProcessing) {
      processQRCode(data.text || data);
      setIsScanning(false);
    }
  };

  const handleError = (err: any) => {
    console.error('QR Scanner error:', err);
    toast({
      title: "Scanner Error",
      description: "Failed to access camera. Please check permissions.",
      variant: "destructive",
    });
  };

  const handleManualEntry = () => {
    if (manualCode.trim()) {
      processQRCode(manualCode.trim());
      setManualCode("");
    }
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

  if (!formDetails) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-200px)] flex-col items-center justify-center py-10">
        <h1 className="text-3xl font-bold">Form Not Found</h1>
        <p className="mb-6 text-muted-foreground">The form you&apos;re looking for doesn&apos;t exist.</p>
        <Button asChild>
          <Link href={`/events/${params.id}/forms`}>Back to Forms</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Button variant="ghost" className="mb-4" asChild>
          <Link href={`/events/${params.id}/forms/${params.formId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Form
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Form Check-in Scanner</h1>
        <p className="mt-2 text-muted-foreground">
          Scan QR codes to check in participants for <span className="font-medium">{formDetails.title}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isScanning ? (
                <div className="text-center space-y-4">
                  <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Camera not active</p>
                    </div>
                  </div>
                  <Button onClick={() => setIsScanning(true)} className="w-full">
                    <Camera className="mr-2 h-4 w-4" />
                    Start Camera
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <QrScanner
                      delay={300}
                      onError={handleError}
                      onScan={handleScan}
                      style={{ width: '100%', height: '300px' }}
                    />
                    {isProcessing && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent mx-auto mb-2"></div>
                          <p>Processing...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={() => setIsScanning(false)} 
                    variant="outline" 
                    className="w-full"
                  >
                    Stop Camera
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Entry */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manualCode">Enter QR Code Data</Label>
                <Input
                  id="manualCode"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Paste QR code data here"
                />
              </div>
              <Button 
                onClick={handleManualEntry} 
                disabled={!manualCode.trim() || isProcessing}
                className="w-full"
              >
                Process Code
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Current Scan Result */}
          {scanResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {scanResult.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  Scan Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{scanResult.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span className="text-sm">{scanResult.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <div>
                      {scanResult.isValid ? (
                        scanResult.alreadyCheckedIn ? (
                          <Badge variant="secondary">Already Checked In</Badge>
                        ) : (
                          <Badge className="bg-green-500">Valid - Checked In</Badge>
                        )
                      ) : (
                        <Badge variant="destructive">Invalid Ticket</Badge>
                      )}
                    </div>
                  </div>
                  {scanResult.checkedInAt && (
                    <div className="flex justify-between">
                      <span className="font-medium">Checked In:</span>
                      <span className="text-sm">
                        {new Date(scanResult.checkedInAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scan History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Scans</CardTitle>
            </CardHeader>
            <CardContent>
              {scanHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No scans yet
                </p>
              ) : (
                <div className="space-y-2">
                  {scanHistory.map((scan, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{scan.name}</p>
                        <p className="text-xs text-muted-foreground">{scan.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {scan.isValid ? (
                          scan.alreadyCheckedIn ? (
                            <UserX className="h-4 w-4 text-orange-500" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-green-500" />
                          )
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Info */}
          <Card>
            <CardHeader>
              <CardTitle>Form Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Form:</span>
                <span>{formDetails.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Event:</span>
                <span>{formDetails.eventTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Description:</span>
                <span className="text-sm text-right">{formDetails.description}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}