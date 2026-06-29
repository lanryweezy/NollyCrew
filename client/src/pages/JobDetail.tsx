import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { jobs } from "@/lib/api";
import Navigation from "@/components/Navigation";
import ApplyModal from "@/components/ApplyModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, DollarSign, Calendar, Clock, Users, Loader2, Briefcase, Send, AlertCircle } from "lucide-react";
import type { Job } from "@/types/database";

const DEMO_JOB: Job = {
  id: "demo-job",
  title: "Lead Actor - Romantic Drama",
  type: "casting",
  category: "lead-actor",
  description: "We are seeking a talented lead actor for our upcoming romantic drama series. The role requires someone who can portray complex emotions and has experience in both dramatic and comedic scenes. Must be available for a 6-week shoot starting in February.",
  location: "Lagos, Nigeria",
  budget: 3500000,
  currency: "NGN",
  duration: "6 weeks",
  deadline: "2026-12-30",
  is_urgent: true,
  is_active: true,
  posted_by_id: "demo-user",
  project_id: null,
  payment_type: "project",
  requirements: ["5+ years experience", "Age 25-35", "Lagos based", "Fluent in English", "Availability for full 6-week shoot"],
  skills: ["Acting", "Drama", "Comedy"],
  experience: "senior",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function JobDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { profile, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const [showApply, setShowApply] = useState(false);

  const jobId = params?.id;

  useEffect(() => {
    if (jobId) loadJob();
  }, [jobId]);

  async function loadJob() {
    setLoading(true);
    try {
      const data = await jobs.get(jobId!);
      if (data) {
        setJob(data);
      } else {
        setJob(DEMO_JOB);
      }
    } catch {
      setJob(DEMO_JOB);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation isAuthenticated={isAuthenticated} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation isAuthenticated={isAuthenticated} />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-2">Job not found</h2>
          <p className="text-muted-foreground mb-4">This job listing doesn't exist or has been removed.</p>
          <Button onClick={() => setLocation("/jobs")}>Back to Jobs</Button>
        </div>
      </div>
    );
  }

  const typeColors: Record<string, string> = {
    casting: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    crew: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    project: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  };

  const budgetFormatted = job.budget
    ? `₦${(job.budget / 1000).toFixed(0)}K`
    : "Negotiable";

  const deadlineFormatted = job.deadline
    ? new Date(job.deadline).toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" })
    : "Open";

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => setLocation("/jobs")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
        </Button>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge className={`text-xs ${typeColors[job.type] || ''}`}>
                    {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
                  </Badge>
                  {job.is_urgent && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" /> Urgent
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold">{job.title}</h1>
              </div>
              {profile?.id !== job.posted_by_id && (
                <Button onClick={() => setShowApply(true)}>
                  <Send className="w-4 h-4 mr-2" /> Apply Now
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" /> {job.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" /> {budgetFormatted}
              </div>
              {job.duration && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" /> {job.duration}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" /> {deadlineFormatted}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Description</CardTitle></CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
              </CardContent>
            </Card>

            {job.requirements && job.requirements.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Requirements</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-1">•</span> {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {job.skills && job.skills.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader><CardTitle>Details</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="capitalize">{job.experience || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Type</span>
                  <span className="capitalize">{job.payment_type || "Project"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posted</span>
                  <span>{job.created_at ? new Date(job.created_at).toLocaleDateString() : "N/A"}</span>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full" onClick={() => setShowApply(true)}>
              <Send className="w-4 h-4 mr-2" /> Apply Now
            </Button>
          </div>
        </div>
      </main>

      <ApplyModal job={job} open={showApply} onOpenChange={setShowApply} />
    </div>
  );
}
