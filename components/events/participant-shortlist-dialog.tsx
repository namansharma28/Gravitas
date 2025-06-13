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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckSquare, UserCheck, UserX } from "lucide-react";

interface FormResponse {
  id: string;
  user: {
    name: string;
    email: string;
  };
  shortlisted?: boolean;
}

interface ParticipantShortlistDialogProps {
  eventId: string;
  formId: string;
  selectedResponses: FormResponse[];
  onSuccess: () => void;
  trigger: React.ReactNode;
}

export default function ParticipantShortlistDialog({
  eventId,
  formId,
  selectedResponses,
  onSuccess,
  trigger,
}: ParticipantShortlistDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState<'shortlist' | 'unshortlist'>('shortlist');
  const [isLoading, setIsLoading] = useState(false);

  const handleShortlist = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/events/${eventId}/forms/${formId}/shortlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responseIds: selectedResponses.map(r => r.id),
          action,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update shortlist');
      }

      toast({
        title: "Success",
        description: `${selectedResponses.length} participant(s) ${action === 'shortlist' ? 'shortlisted' : 'removed from shortlist'}`,
      });

      setIsOpen(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update shortlist",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const shortlistedCount = selectedResponses.filter(r => r.shortlisted).length;
  const notShortlistedCount = selectedResponses.length - shortlistedCount;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Participant Shortlist</DialogTitle>
          <DialogDescription>
            Update the shortlist status for {selectedResponses.length} selected participant(s)
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h4 className="font-medium mb-2">Selected Participants:</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedResponses.map((response) => (
                <div key={response.id} className="flex items-center justify-between text-sm">
                  <span>{response.user.name}</span>
                  {response.shortlisted ? (
                    <span className="text-green-600 text-xs">Shortlisted</span>
                  ) : (
                    <span className="text-gray-500 text-xs">Pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <RadioGroup value={action} onValueChange={(value) => setAction(value as 'shortlist' | 'unshortlist')}>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="shortlist" id="shortlist" />
                <Label htmlFor="shortlist" className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  <span>Shortlist participants ({notShortlistedCount} will be shortlisted)</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unshortlist" id="unshortlist" />
                <Label htmlFor="unshortlist" className="flex items-center gap-2">
                  <UserX className="h-4 w-4 text-red-500" />
                  <span>Remove from shortlist ({shortlistedCount} will be removed)</span>
                </Label>
              </div>
            </div>
          </RadioGroup>

          <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
            <p>
              <strong>Note:</strong> Shortlisted participants can receive event tickets and will be marked 
              as confirmed attendees. This action can be reversed at any time.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleShortlist}
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : `${action === 'shortlist' ? 'Shortlist' : 'Remove'} Participants`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}