import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, DollarSign, Calendar, Bookmark, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ApplyModal from "./ApplyModal";
import type { Job } from "@/types/database";

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const [, setLocation] = useLocation();
  const { profile } = useAuth();
  const [showApply, setShowApply] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const { toast } = useToast();

  const typeColors = {
    casting: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    crew: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    project: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  };

  const truncated = job.description.length > 120
    ? `${job.description.substring(0, 120)}...`
    : job.description;

  const budgetFormatted = job.budget
    ? `₦${(job.budget / 1000).toFixed(0)}K`
    : "Negotiable";

  const deadlineFormatted = job.deadline
    ? new Date(job.deadline).toLocaleDateString("en-NG", { month: "short", day: "numeric" })
    : "Open";

  async function toggleBookmark() {
    const newState = !bookmarked;
    setBookmarked(newState);
    try {
      if (newState) {
        await apiFetch(`/bookmarks/${job.id}`, { method: 'POST' });
      } else {
        await apiFetch(`/bookmarks/${job.id}`, { method: 'DELETE' });
      }
    } catch {}
    toast({ title: newState ? "Bookmarked!" : "Removed from bookmarks" });
  }

  return (
    <>
      <Card className="w-full hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge className={`text-xs ${typeColors[job.type]}`}>
                  {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
                </Badge>
                {job.is_urgent && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle className="w-3 h-3 mr-1" /> Urgent
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg cursor-pointer hover:text-primary transition-colors" onClick={() => setLocation(`/jobs/${job.id}`)}>
                {job.title}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" /> {job.location}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="w-4 h-4" /> {budgetFormatted}
            </div>
            {job.duration && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" /> {job.duration}
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" /> {deadlineFormatted}
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {showFull ? job.description : truncated}
          </p>
          {job.description.length > 120 && (
            <Button variant="ghost" size="sm" className="p-0 h-auto text-primary" onClick={() => setShowFull(!showFull)}>
              {showFull ? "Show less" : "Show more"}
            </Button>
          )}

          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.skills.slice(0, 4).map((skill, i) => (
                <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-2 pt-2">
          <Button className="flex-1" onClick={() => setShowApply(true)}>
            Apply Now
          </Button>
          <Button variant="outline" size="icon" onClick={toggleBookmark}>
            <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-primary" : ""}`} />
          </Button>
        </CardFooter>
      </Card>

      <ApplyModal job={job} open={showApply} onOpenChange={setShowApply} />
    </>
  );
}

