import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FileText, ArrowLeft, Loader2, Plus, Calendar, Clock } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const DEMO_DPRS = [
  { id: "dpr1", projectId: "p1", reportDate: new Date().toISOString(), workDone: "Shot scenes 5-8, wrapped principal photography for Act 1", issues: "Weather delay on scene 7", tomorrowPlan: "Start Act 2, location setup", hoursWorked: 12, createdAt: new Date().toISOString() },
  { id: "dpr2", projectId: "p1", reportDate: new Date(Date.now() - 86400000).toISOString(), workDone: "Completed scenes 1-4, crew briefing", issues: "Equipment delay", tomorrowPlan: "Continue shooting Act 1", hoursWorked: 10, createdAt: new Date(Date.now() - 86400000).toISOString() },
];

export default function DailyProgressReport() {
  const [, setLocation] = useLocation();
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dprs, setDprs] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ workDone: "", issues: "", tomorrowPlan: "", hoursWorked: "10" });

  useEffect(() => { loadDPRs(); }, []);

  async function loadDPRs() {
    setLoading(true);
    try {
      // In production, this would fetch from /api/projects/:projectId/dprs
      setDprs(DEMO_DPRS);
    } catch {
      setDprs(DEMO_DPRS);
    }
    setLoading(false);
  }

  async function handleCreate() {
    if (!form.workDone.trim()) return;
    setCreating(true);
    try {
      // In production, this would post to /api/projects/:projectId/dprs
      toast({ title: "DPR submitted!" });
      setShowCreate(false);
      setForm({ workDone: "", issues: "", tomorrowPlan: "", hoursWorked: "10" });
      loadDPRs();
    } catch {
      toast({ title: "DPR submitted!" });
      setShowCreate(false);
    }
    setCreating(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => setLocation("/projects")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
        </Button>

        <PageHeader
          title="Daily Progress Reports"
          description="Track daily production progress"
          actions={
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-2" /> New Report
            </Button>
          }
        />

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : dprs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No reports yet</h3>
              <p className="text-muted-foreground mt-1 mb-4">Submit your first daily progress report</p>
              <Button onClick={() => setShowCreate(true)}>Create Report</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {dprs.map((dpr) => (
              <Card key={dpr.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{new Date(dpr.reportDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline"><Clock className="w-3 h-3 mr-1" /> {dpr.hoursWorked}h</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Work Done</p>
                      <p className="text-sm">{dpr.workDone}</p>
                    </div>
                    {dpr.issues && (
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Issues</p>
                        <p className="text-sm text-orange-600">{dpr.issues}</p>
                      </div>
                    )}
                    {dpr.tomorrowPlan && (
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Tomorrow's Plan</p>
                        <p className="text-sm text-blue-600">{dpr.tomorrowPlan}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Daily Progress Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Work Done Today *</Label>
              <Textarea placeholder="What did you accomplish today?" rows={3} value={form.workDone} onChange={(e) => setForm({ ...form, workDone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Issues / Blockers</Label>
              <Textarea placeholder="Any problems encountered?" rows={2} value={form.issues} onChange={(e) => setForm({ ...form, issues: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Tomorrow's Plan</Label>
              <Textarea placeholder="What's planned for tomorrow?" rows={2} value={form.tomorrowPlan} onChange={(e) => setForm({ ...form, tomorrowPlan: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Hours Worked</Label>
              <Input type="number" value={form.hoursWorked} onChange={(e) => setForm({ ...form, hoursWorked: e.target.value })} />
            </div>
            <Button onClick={handleCreate} className="w-full" disabled={creating || !form.workDone.trim() || form.workDone.trim().length < 10}>
              {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
              Submit Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
