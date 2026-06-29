import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Users, CheckCircle, XCircle, Clock, MessageSquare, Star } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const DEMO_APPLICATIONS = [
  {
    id: "app-1",
    applicant_id: "user-1",
    job_id: "job-1",
    cover_letter: "I have 8 years of experience in dramatic roles and would love to be part of this production. My recent work includes lead roles in three major Nollywood films.",
    proposed_rate: 2000000,
    status: "pending",
    applied_at: new Date(Date.now() - 86400000).toISOString(),
    applicant: { first_name: "Adaeze", last_name: "Obi", email: "adaeze@example.com", avatar: null },
  },
  {
    id: "app-2",
    applicant_id: "user-2",
    job_id: "job-1",
    cover_letter: "As a seasoned actor with 15+ years in Nollywood, I bring depth and authenticity to every role. I'm available for the full shoot duration.",
    proposed_rate: 3000000,
    status: "shortlisted",
    applied_at: new Date(Date.now() - 172800000).toISOString(),
    applicant: { first_name: "Funke", last_name: "Adeyemi", email: "funke@example.com", avatar: null },
  },
];

export default function JobApplications() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [job, setJob] = useState<any>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});

  const jobId = params?.jobId;

  useEffect(() => {
    if (jobId) loadData();
  }, [jobId]);

  async function loadData() {
    setLoading(true);
    try {
      const [jobData, appsData] = await Promise.all([
        apiFetch(`/jobs/${jobId}`),
        apiFetch(`/jobs/${jobId}/applications`),
      ]);
      setJob(jobData);
      setApplications(Array.isArray(appsData) ? appsData : []);
    } catch {
      setJob({ title: "Job", id: jobId });
      setApplications(DEMO_APPLICATIONS);
    }
    setLoading(false);
  }

  async function updateStatus(appId: string, status: string) {
    setUpdatingId(appId);
    try {
      await apiFetch(`/jobs/${jobId}/applications/${appId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, feedback: feedbackMap[appId] || undefined }),
      });
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      toast({ title: `Application ${status}` });
    } catch {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      toast({ title: `Application ${status} (Demo)` });
    }
    setUpdatingId(null);
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    shortlisted: "bg-blue-100 text-blue-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const pending = applications.filter(a => a.status === "pending");
  const shortlisted = applications.filter(a => a.status === "shortlisted");
  const accepted = applications.filter(a => a.status === "accepted");
  const rejected = applications.filter(a => a.status === "rejected");

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => setLocation("/jobs")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
        </Button>

        <PageHeader
          title={`Applications: ${job?.title || "Job"}`}
          description={`${applications.length} total applicants`}
        />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No applications yet</h3>
              <p className="text-muted-foreground mt-1">Share your job posting to attract applicants</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{pending.length}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{shortlisted.length}</p>
                <p className="text-xs text-muted-foreground">Shortlisted</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{accepted.length}</p>
                <p className="text-xs text-muted-foreground">Accepted</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{rejected.length}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>

            {/* Application List */}
            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-semibold text-primary">
                            {app.applicant?.first_name?.[0]}{app.applicant?.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {app.applicant?.first_name} {app.applicant?.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{app.applicant?.email}</p>
                        </div>
                      </div>
                      <Badge className={statusColors[app.status] || ""}>{app.status}</Badge>
                    </div>

                    {app.cover_letter && (
                      <div className="p-3 bg-muted rounded-lg mb-4">
                        <p className="text-sm">{app.cover_letter}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      {app.proposed_rate && (
                        <span>Proposed: ₦{app.proposed_rate.toLocaleString()}</span>
                      )}
                      <span>Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                    </div>

                    {app.status === "pending" && (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Optional feedback for the applicant..."
                          rows={2}
                          value={feedbackMap[app.id] || ""}
                          onChange={(e) => setFeedbackMap(prev => ({ ...prev, [app.id]: e.target.value }))}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateStatus(app.id, "shortlisted")}
                            disabled={updatingId === app.id}
                          >
                            {updatingId === app.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Star className="w-3 h-3 mr-1" />}
                            Shortlist
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => updateStatus(app.id, "accepted")}
                            disabled={updatingId === app.id}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatus(app.id, "rejected")}
                            disabled={updatingId === app.id}
                          >
                            <XCircle className="w-3 h-3 mr-1" /> Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setLocation(`/messages`)}
                          >
                            <MessageSquare className="w-3 h-3 mr-1" /> Message
                          </Button>
                        </div>
                      </div>
                    )}

                    {app.status === "shortlisted" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => updateStatus(app.id, "accepted")}
                          disabled={updatingId === app.id}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStatus(app.id, "rejected")}
                          disabled={updatingId === app.id}
                        >
                          <XCircle className="w-3 h-3 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
