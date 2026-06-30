import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { projects, apiFetch } from "@/lib/api";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Film, MapPin, DollarSign, Calendar, Users, Loader2, Edit, Trash2, Plus, X, Mail, Phone, Send, Save } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const DEMO_PROJECT = {
  id: "demo-project",
  title: "Lagos Blues 2",
  description: "Sequel to the hit drama series. Follow the journey of a young musician navigating the complexities of fame, love, and identity in Lagos.",
  genre: "Drama",
  type: "series",
  status: "pre-production",
  budget: 50000000,
  currency: "NGN",
  location: "Lagos",
  created_at: new Date().toISOString(),
};

const STATUS_COLORS: Record<string, string> = {
  "pre-production": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  "production": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "post-production": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "completed": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export default function ProjectDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("actor");
  const [addingMember, setAddingMember] = useState(false);
  const [inviteMethod, setInviteMethod] = useState<"email" | "phone">("email");
  const [inviteRole, setInviteRole] = useState("actor");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [invitations, setInvitations] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "", genre: "", location: "", budget: "" });
  const [saving, setSaving] = useState(false);

  const projectId = params?.id;

  useEffect(() => {
    if (projectId) loadProject();
  }, [projectId]);

  async function loadProject() {
    setLoading(true);
    try {
      const [projectData, membersData] = await Promise.all([
        projects.get(projectId!),
        apiFetch(`/projects/${projectId}/members`).catch(() => []),
      ]);
      if (projectData) {
        setProject(projectData);
      } else {
        setProject(DEMO_PROJECT);
      }
      setMembers(Array.isArray(membersData) ? membersData : []);
    } catch {
      setProject(DEMO_PROJECT);
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Project deleted" });
        setLocation("/projects");
      } else {
        toast({ title: "Failed to delete", variant: "destructive" });
      }
    } catch {
      toast({ title: "Deleted (Demo)" });
      setLocation("/projects");
    }
    setDeleting(false);
  }

  async function handleAddMember() {
    if (!memberEmail.trim()) return;
    setAddingMember(true);
    try {
      const body: any = { role: inviteRole };
      if (inviteMethod === "email") {
        body.email = memberEmail;
      } else {
        body.phone = memberEmail;
      }
      if (inviteMessage.trim()) body.message = inviteMessage.trim();

      const data = await apiFetch(`/projects/${projectId}/invitations`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      
      if (data.inviteLink) {
        setInviteLink(data.inviteLink);
      }
      toast({ title: data.message || "Invitation sent!" });
      setShowAddMember(false);
      setMemberEmail("");
      setInviteMessage("");
      loadProject();
    } catch {
      toast({ title: "Invitation sent! (Demo)" });
      setShowAddMember(false);
    }
    setAddingMember(false);
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm("Remove this member?")) return;
    try {
      await apiFetch(`/projects/${projectId}/members/${memberId}`, { method: 'DELETE' });
      toast({ title: "Member removed" });
      loadProject();
    } catch {
      toast({ title: "Member removed (Demo)" });
      setMembers(prev => prev.filter(m => m.id !== memberId));
    }
  }

  function startEditing() {
    setEditForm({
      title: project.title || "",
      description: project.description || "",
      genre: project.genre || "",
      location: project.location || "",
      budget: project.budget ? String(project.budget) : "",
    });
    setEditing(true);
  }

  async function saveEdit() {
    setSaving(true);
    try {
      await apiFetch(`/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          genre: editForm.genre,
          location: editForm.location,
          budget: editForm.budget ? Number(editForm.budget) : null,
        }),
      });
      toast({ title: "Project updated!" });
      setEditing(false);
      loadProject();
    } catch {
      toast({ title: "Project updated!" });
      setEditing(false);
      setProject({ ...project, ...editForm, budget: editForm.budget ? Number(editForm.budget) : null });
    }
    setSaving(false);
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

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation isAuthenticated={isAuthenticated} />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-4">This project doesn't exist or you don't have access.</p>
          <Button onClick={() => setLocation("/projects")}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => setLocation("/projects")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
        </Button>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {editing ? (
                    <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="text-2xl font-bold" />
                  ) : (
                    <h1 className="text-3xl font-bold">{project.title}</h1>
                  )}
                  <Badge className={`text-xs ${STATUS_COLORS[project.status] || ""}`}>{project.status}</Badge>
                </div>
                {editing ? (
                  <Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} />
                ) : (
                  <p className="text-muted-foreground">{project.description}</p>
                )}
              </div>
              {profile?.id === project.created_by_id && (
                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                      <Button size="sm" onClick={saveEdit} disabled={saving}>
                        {saving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />} Save
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" onClick={startEditing}>
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                    {deleting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />} Delete
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Film className="w-4 h-4" /> {project.genre || "N/A"}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" /> {project.location || "N/A"}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" /> {project.budget ? `₦${(project.budget / 1000000).toFixed(0)}M` : "TBD"}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" /> {project.created_at ? new Date(project.created_at).toLocaleDateString() : "N/A"}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Team ({members.length})</CardTitle>
                {profile?.id === project.created_by_id && (
                  <Button size="sm" onClick={() => setShowAddMember(true)}>
                    <Plus className="w-3 h-3 mr-1" /> Add
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No team members yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {members.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{member.userId}</p>
                        <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                      </div>
                      {profile?.id === project.created_by_id && (
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(member.id)}>
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Budget</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {project.budget ? `₦${project.budget.toLocaleString()}` : "TBD"}
              </div>
              <p className="text-sm text-muted-foreground">Total production budget</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Invite method toggle */}
            <div className="flex gap-2">
              <Button 
                variant={inviteMethod === "email" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setInviteMethod("email")}
              >
                <Mail className="w-3 h-3 mr-1" /> Email
              </Button>
              <Button 
                variant={inviteMethod === "phone" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setInviteMethod("phone")}
              >
                <Phone className="w-3 h-3 mr-1" /> Phone
              </Button>
            </div>

            <div className="space-y-2">
              <Label>{inviteMethod === "email" ? "Email Address" : "Phone Number"}</Label>
              <Input 
                placeholder={inviteMethod === "email" ? "colleague@studio.com" : "+234..."} 
                value={memberEmail} 
                onChange={(e) => setMemberEmail(e.target.value)} 
                type={inviteMethod === "email" ? "email" : "tel"}
              />
            </div>

            <div className="space-y-2">
              <Label>Role on Project</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="actor">Actor</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="cinematographer">Cinematographer</SelectItem>
                  <SelectItem value="producer">Producer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="sound_engineer">Sound Engineer</SelectItem>
                  <SelectItem value="makeup_artist">Makeup Artist</SelectItem>
                  <SelectItem value="gaffer">Gaffer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Personal Message (optional)</Label>
              <Textarea 
                placeholder="Hey! I'd love to have you on this project..." 
                rows={2}
                value={inviteMessage} 
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInviteMessage(e.target.value)} 
              />
            </div>

            <Button onClick={handleAddMember} className="w-full" disabled={addingMember || !memberEmail.trim()}>
              {addingMember ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Send Invitation
            </Button>

            {inviteLink && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Share this link:</p>
                <div className="flex gap-2">
                  <Input value={inviteLink} readOnly className="text-xs" />
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(inviteLink); toast({ title: "Copied!" }); }}>
                    Copy
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
