import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, TrendingUp, Eye, Clock, Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const DEMO_STATS = {
  profileViews: 234,
  searchAppearances: 1205,
  applicationViews: 89,
  bookingInquiries: 12,
  responseRate: 85,
  avgResponseTime: "2 hours",
  topSkills: ["Drama", "Comedy", "Voice Acting"],
  monthlyViews: [45, 62, 78, 95, 110, 134, 156, 180, 210, 234],
};

export default function Analytics() {
  const { profile, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(DEMO_STATS);

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    setLoading(true);
    if (isSupabaseConfigured() && profile) {
      // Query real data
      const [apps, views] = await Promise.all([
        supabase.from("job_applications").select("*", { count: "exact", head: true }).eq("applicant_id", profile.id),
        supabase.from("profiles").select("profile_views, search_appearances").eq("id", profile.id).single(),
      ]);
      setStats({
        ...DEMO_STATS,
        applicationViews: apps.count || 0,
        profileViews: views.data?.profile_views || 0,
        searchAppearances: views.data?.search_appearances || 0,
      });
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="Analytics" description="Track your performance" />

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <Eye className="w-8 h-8 text-muted-foreground/50 mb-2" />
                  <p className="text-2xl font-bold">{stats.profileViews}</p>
                  <p className="text-xs text-muted-foreground">Profile Views</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <TrendingUp className="w-8 h-8 text-muted-foreground/50 mb-2" />
                  <p className="text-2xl font-bold">{stats.searchAppearances}</p>
                  <p className="text-xs text-muted-foreground">Search Appearances</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <Briefcase className="w-8 h-8 text-muted-foreground/50 mb-2" />
                  <p className="text-2xl font-bold">{stats.applicationViews}</p>
                  <p className="text-xs text-muted-foreground">Applications</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <Users className="w-8 h-8 text-muted-foreground/50 mb-2" />
                  <p className="text-2xl font-bold">{stats.bookingInquiries}</p>
                  <p className="text-xs text-muted-foreground">Booking Inquiries</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Monthly Views</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-end gap-1 h-40">
                    {stats.monthlyViews.map((v, i) => (
                      <div key={i} className="flex-1 bg-primary/20 rounded-t" style={{ height: `${(v / Math.max(...stats.monthlyViews)) * 100}%` }} />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Jan</span><span>Jun</span><span>Oct</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Performance</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Rate</span>
                    <span className="font-semibold">{stats.responseRate}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary rounded-full h-2" style={{ width: `${stats.responseRate}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Response Time</span>
                    <span className="font-semibold flex items-center gap-1"><Clock className="w-3 h-3" /> {stats.avgResponseTime}</span>
                  </div>
                  <div>
                    <p className="text-sm mb-2">Top Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {stats.topSkills.map((s, i) => (
                        <span key={i} className="text-xs bg-muted px-2 py-1 rounded">{s}</span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
