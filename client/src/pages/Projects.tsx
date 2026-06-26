import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { projects } from "@/lib/api";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import Navigation from "@/components/Navigation";
import EmptyState from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Film, Plus, Calendar, MapPin, DollarSign, Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const DEMO_PROJECTS = [
  { id: "p1", title: "Lagos Blues 2", description: "Sequel to the hit drama series", genre: "Drama", type: "series", status: "pre-production", budget: 50000000, location: "Lagos", created_at: "2025-06-01" },
  { id: "p2", title: "The Heist", description: "Thriller about a daring bank robbery in Lagos", genre: "Thriller", type: "feature", status: "production", budget: 25000000, location: "Abuja", created_at: "2025-05-15" },
  { id: "p3", title: "Love in Lagos", description: "Romantic comedy set in Victoria Island", genre: "Romance", type: "feature", status: "completed", budget: 15000000, location: "Lagos", created_at: "2025-04-01" },
];

const STATUS_COLORS: Record<string, string> = {
  "pre-production": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  "production": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "post-production": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "completed": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export default function Projects() {
  const [, setLocation] = useLocation();
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [projectList, setProjectList] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", genre: "", type: "feature" as "feature" | "short" | "series" | "commercial" | "documentary",
    budget: "", location: "",
  });

  useEffect(() => { loadProjects(); }, []);

  async function loadProjects() {
    setLoading(true);
    if (isSupabaseConfigured() && profile) {
      const data = await projects.list({ createdById: profile.id });
      setProjectList(data);
    } else {
      setProjectList(DEMO_PROJECTS);
    }
    setLoading(false);
  }

  async function handleCreate() {
    if (!profile) return;
    setCreating(true);
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from("projects").insert({
        title: form.title, description: form.description, genre: form.genre,
        type: form.type, budget: form.budget ? Number(form.budget) : null,
        location: form.location, status: "pre-production", currency: "NGN",
        created_by_id: profile.id,
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Project created!" });
        setShowCreate(false);
        loadProjects();
      }
    } else {
      toast({ title: "Project created! (Demo)" });
      setShowCreate(false);
    }
    setCreating(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="Projects" description="Manage your productions"
          actions={<Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" /> New Project</Button>}
        />
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : projectList.length === 0 ? (
          <EmptyState icon={<Film className="w-full h-full" />} title="No projects yet"
            description="Start your first production"
            action={<Button onClick={() => setShowCreate(true)}>Create Project</Button>}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projectList.map((project) => (
              <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation(`/projects/${project.id}`)}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{project.title}</h3>
                    <Badge className={`text-xs ${STATUS_COLORS[project.status] || ""}`}>{project.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Film className="w-3 h-3" /> {project.genre}</span>
                    {project.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {project.location}</span>}
                    {project.budget && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> ₦{(project.budget / 1000000).toFixed(0)}M</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>New Project</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="Project title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea placeholder="What's this project about?" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Genre *</Label>
                <Input placeholder="e.g. Drama, Thriller" value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature Film</SelectItem>
                    <SelectItem value="short">Short Film</SelectItem>
                    <SelectItem value="series">Series</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="documentary">Documentary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Budget (₦)</Label>
                <Input type="number" placeholder="e.g. 25000000" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="Lagos, Nigeria" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
            </div>
            <Button onClick={handleCreate} className="w-full" disabled={creating || !form.title || !form.description || !form.genre}>
              {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Create Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
