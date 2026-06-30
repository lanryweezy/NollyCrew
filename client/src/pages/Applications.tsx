import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { jobs } from "@/lib/api";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, ArrowLeft, Loader2, Clock, CheckCircle, XCircle, Star, MapPin, DollarSign } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const DEMO_APPLICATIONS = [
  { id: "a1", job_id: "demo-1", job_title: "Lead Actor - Romantic Drama", job_location: "Lagos", job_type: "casting", status: "pending", applied_at: new Date(Date.now() - 86400000).toISOString(), proposed_rate: 2000000 },
  { id: "a2", job_id: "demo-2", job_title: "Cinematographer - Action Film", job_location: "Abuja", job_type: "crew", status: "shortlisted", applied_at: new Date(Date.now() - 172800000).toISOString(), proposed_rate: 3000000 },
  { id: "a3", job_id: "demo-3", job_title: "Sound Engineer - Documentary", job_location: "Port Harcourt", job_type: "crew", status: "accepted", applied_at: new Date(Date.now() - 259200000).toISOString(), proposed_rate: 800000 },
  { id: "a4", job_id: "demo-4", job_title: "Makeup Artist - Period Drama", job_location: "Lagos", job_type: "crew", status: "rejected", applied_at: new Date(Date.now() - 345600000).toISOString(), proposed_rate: 500000 },
];

const STATUS_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  pending: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
  shortlisted: { icon: Star, color: "text-blue-600", bg: "bg-blue-100" },
  accepted: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
  rejected: { icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
};

export default function Applications() {
  const [, setLocation] = useLocation();
  const { profile, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => { loadApplications(); }, []);

  async function loadApplications() {
    setLoading(true);
    try {
      const data = await jobs.getMyApplications(profile?.id || '');
      setApplications(Array.isArray(data) ? data : DEMO_APPLICATIONS);
    } catch { setApplications(DEMO_APPLICATIONS); }
    setLoading(false);
  }

  const pending = applications.filter(a => a.status === "pending");
  const shortlisted = applications.filter(a => a.status === "shortlisted");
  const accepted = applications.filter(a => a.status === "accepted");
  const rejected = applications.filter(a => a.status === "rejected");

  function filterByStatus(tab: string) {
    switch (tab) {
      case "pending": return pending;
      case "shortlisted": return shortlisted;
      case "accepted": return accepted;
      case "rejected": return rejected;
      default: return applications;
    }
  }

  const filtered = filterByStatus(activeTab);

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="My Applications" description={`${applications.length} total applications`} />

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <Card className="cursor-pointer hover:shadow-sm" onClick={() => setActiveTab("pending")}>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{pending.length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-sm" onClick={() => setActiveTab("shortlisted")}>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{shortlisted.length}</p>
              <p className="text-xs text-muted-foreground">Shortlisted</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-sm" onClick={() => setActiveTab("accepted")}>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-green-600">{accepted.length}</p>
              <p className="text-xs text-muted-foreground">Accepted</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-sm" onClick={() => setActiveTab("rejected")}>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-red-600">{rejected.length}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted ({shortlisted.length})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({accepted.length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No applications found</h3>
                  <p className="text-muted-foreground mt-1 mb-4">
                    {activeTab === "all" ? "Start applying to jobs!" : `No ${activeTab} applications`}
                  </p>
                  <Button onClick={() => setLocation("/jobs")}>Browse Jobs</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filtered.map((app) => {
                  const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusCfg.icon;
                  return (
                    <Card key={app.id} className="cursor-pointer hover:shadow-sm" onClick={() => setLocation(`/jobs/${app.job_id}`)}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${statusCfg.bg} flex items-center justify-center`}>
                              <StatusIcon className={`w-5 h-5 ${statusCfg.color}`} />
                            </div>
                            <div>
                              <h3 className="font-semibold">{app.job_title || app.job?.title || "Job"}</h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <MapPin className="w-3 h-3" /> {app.job_location || app.job?.location || "N/A"}
                                {app.proposed_rate && <><DollarSign className="w-3 h-3" /> ₦{app.proposed_rate.toLocaleString()}</>}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={`${statusCfg.bg} ${statusCfg.color}`}>{app.status}</Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(app.applied_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
