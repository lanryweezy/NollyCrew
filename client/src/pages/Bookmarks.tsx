import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import Navigation from "@/components/Navigation";
import JobCard from "@/components/JobCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Briefcase, Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { JobsSkeleton } from "@/components/PageSkeletons";

export default function Bookmarks() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => { loadBookmarks(); }, []);

  async function loadBookmarks() {
    setLoading(true);
    try {
      const data = await apiFetch('/bookmarks');
      // Fetch full job data for each bookmark
      if (Array.isArray(data) && data.length > 0) {
        const jobIds = data.map((b: any) => b.jobId);
        const jobData = await Promise.all(jobIds.map((id: string) => apiFetch(`/jobs/${id}`).catch(() => null)));
        setBookmarks(jobData.filter(Boolean));
      }
    } catch { setBookmarks([]); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="Saved Jobs" description={`${bookmarks.length} bookmarked jobs`} />

        {loading ? (
          <JobsSkeleton />
        ) : bookmarks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No saved jobs</h3>
              <p className="text-muted-foreground mt-1 mb-4">Bookmark jobs to save them for later</p>
              <Button onClick={() => setLocation("/jobs")}>Browse Jobs</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookmarks.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
