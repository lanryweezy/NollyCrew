import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { jobs } from "@/lib/api";
import Navigation from "@/components/Navigation";
import EmptyState from "@/components/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Film, Loader2, Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const DEMO_AUDITIONS = [
  { id: "a1", project: "Lagos Blues 2", role: "Lead Female", location: "Lagos", date: "2025-07-15", time: "10:00 AM", status: "upcoming", type: "in-person", notes: "Prepare 2-minute dramatic monologue" },
  { id: "a2", project: "The Heist", role: "Supporting Actor", location: "Abuja", date: "2025-07-20", time: "2:00 PM", status: "upcoming", type: "self-tape", notes: "Upload self-tape by July 18" },
  { id: "a3", project: "Love in Lagos", role: "Guest Role", location: "Lagos", date: "2025-06-20", time: "11:00 AM", status: "completed", type: "in-person", notes: "Callback received" },
];

const STATUS_COLORS: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-800",
  completed: "bg-gray-100 text-gray-800",
  callback: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function Auditions() {
  const [, setLocation] = useLocation();
  const { profile, roles, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [auditions, setAuditions] = useState<any[]>([]);

  useEffect(() => { loadAuditions(); }, []);

  async function loadAuditions() {
    setLoading(true);
    try {
      if (profile) {
        const data = await jobs.getMyApplications(profile.id);
        setAuditions(data.length > 0 ? data : DEMO_AUDITIONS);
      } else {
        setAuditions(DEMO_AUDITIONS);
      }
    } catch {
      setAuditions(DEMO_AUDITIONS);
    }
    setLoading(false);
  }

  const upcoming = auditions.filter(a => a.status === "upcoming" || a.status === "callback");
  const past = auditions.filter(a => a.status === "completed" || a.status === "cancelled");

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="Auditions" description="Track your audition schedule" />

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : auditions.length === 0 ? (
          <EmptyState icon={<Calendar className="w-full h-full" />} title="No auditions yet"
            description="Apply to casting calls to start tracking auditions"
            action={<Button onClick={() => setLocation("/jobs")}>Browse Jobs</Button>}
          />
        ) : (
          <Tabs defaultValue="upcoming">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="mt-6">
              <div className="space-y-3">
                {upcoming.map((aud) => (
                  <Card key={aud.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{aud.project || aud.job?.title || "Audition"}</h3>
                          <p className="text-sm text-muted-foreground">{aud.role || "Role"}</p>
                          <div className="flex gap-3 mt-2 text-sm text-muted-foreground">
                            {aud.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {aud.location}</span>}
                            {aud.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(aud.date).toLocaleDateString()}</span>}
                            {aud.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {aud.time}</span>}
                          </div>
                          {aud.notes && <p className="text-xs text-muted-foreground mt-2 italic">{aud.notes}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={STATUS_COLORS[aud.status]}>{aud.status}</Badge>
                          <Badge variant="outline">{aud.type}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="past" className="mt-6">
              <div className="space-y-3">
                {past.map((aud) => (
                  <Card key={aud.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{aud.project || aud.job?.title}</h3>
                          <p className="text-sm text-muted-foreground">{aud.role || "Role"}</p>
                        </div>
                        <Badge className={STATUS_COLORS[aud.status]}>{aud.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
