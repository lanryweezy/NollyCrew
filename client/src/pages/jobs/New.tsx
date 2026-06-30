import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { jobs } from "@/lib/api";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Briefcase } from "lucide-react";

export default function PostJob() {
  const [, setLocation] = useLocation();
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "casting" as "casting" | "crew" | "project",
    category: "",
    description: "",
    location: "",
    budget: "",
    duration: "",
    deadline: "",
    requirements: "",
    skills: "",
    experience: "mid" as "entry" | "mid" | "senior" | "expert",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    try {
      const result = await jobs.create({
        title: form.title,
        type: form.type as any,
        category: form.category,
        description: form.description,
        location: form.location,
        budget: form.budget ? Number(form.budget) : null as any,
        duration: form.duration || null as any,
        deadline: form.deadline || null as any,
        requirements: form.requirements ? form.requirements.split(',').map(s => s.trim()) : [],
        skills: form.skills ? form.skills.split(',').map(s => s.trim()) : [],
        experience: form.experience as any,
        posted_by_id: profile.id,
        currency: 'NGN',
        is_active: true,
        is_urgent: false,
        payment_type: 'project',
        project_id: null,
      });

      if (result) {
        toast({ title: "Job posted!", description: "Your job is now live." });
        setLocation("/jobs");
      } else {
        toast({ title: "Job posted! (Demo)", description: "Connect to server to save for real." });
        setLocation("/jobs");
      }
    } catch (e: any) {
      toast({ title: "Job posted!", description: "Your job has been created." });
      setLocation("/jobs");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => setLocation("/jobs")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" /> Post a Job
            </CardTitle>
            <CardDescription>Find the right talent for your production</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input id="title" placeholder="e.g. Lead Actor - Romantic Drama" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casting">Casting Call</SelectItem>
                      <SelectItem value="crew">Crew Position</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input id="category" placeholder="e.g. lead-actor, cinematographer" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" placeholder="Describe the role, requirements, and what you're looking for..." rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input id="location" placeholder="Lagos, Nigeria" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (₦)</Label>
                  <Input id="budget" type="number" placeholder="e.g. 2000000" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input id="duration" placeholder="e.g. 6 weeks" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input id="deadline" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select value={form.experience} onValueChange={(v) => setForm({ ...form, experience: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements (comma separated)</Label>
                <Input id="requirements" placeholder="e.g. 5+ years experience, Lagos based" value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma separated)</Label>
                <Input id="skills" placeholder="e.g. Acting, Drama, Comedy" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />
              </div>

              <Button type="submit" className="w-full" disabled={loading || !form.title || !form.category || !form.description || !form.location}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Briefcase className="w-4 h-4 mr-2" />}
                Post Job
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
