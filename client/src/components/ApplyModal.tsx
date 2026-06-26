import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { jobs } from "@/lib/api";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";
import type { Job } from "@/types/database";

interface ApplyModalProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ApplyModal({ job, open, onOpenChange }: ApplyModalProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedRate, setProposedRate] = useState("");

  async function handleApply() {
    if (!profile) return;
    setLoading(true);

    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('job_applications').insert({
        job_id: job.id,
        applicant_id: profile.id,
        cover_letter: coverLetter || null,
        proposed_rate: proposedRate ? Number(proposedRate) : null,
      });

      if (error) {
        if (error.message.includes('unique')) {
          toast({ title: "Already applied", description: "You've already applied to this job.", variant: "destructive" });
        } else {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        }
      } else {
        toast({ title: "Application sent!", description: "Good luck!" });
        onOpenChange(false);
        setCoverLetter("");
        setProposedRate("");
      }
    } else {
      toast({ title: "Applied! (Demo)", description: "Connect Supabase to submit for real." });
      onOpenChange(false);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply to: {job.title}</DialogTitle>
          <DialogDescription>{job.location} • {job.type}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Cover Letter (optional)</Label>
            <Textarea
              placeholder="Tell them why you're a great fit..."
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>
          {job.type === "casting" && (
            <div className="space-y-2">
              <Label>Proposed Rate (₦)</Label>
              <Input
                type="number"
                placeholder="e.g. 500000"
                value={proposedRate}
                onChange={(e) => setProposedRate(e.target.value)}
              />
            </div>
          )}
          <Button onClick={handleApply} className="w-full" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Submit Application
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
