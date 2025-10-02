import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import ThemeToggle from "@/components/ThemeToggle";
import ProjectCard from "@/components/ProjectCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { useJobStatus } from "@/hooks/useJobStatus";
import { authService } from "@/lib/auth";
import { 
  Search,
  Plus,
  Film,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  TrendingUp,
  Settings,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ListSkeleton from "@/components/ListSkeleton";

export default function Projects() {
  const [, setLocation] = useLocation();
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("my-projects");
  const [scheduleScenes, setScheduleScenes] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [analysisJobId, setAnalysisJobId] = useState<string | null>(null);
  const analysisJob = useJobStatus<any>(analysisJobId);
  const [scheduleJobId, setScheduleJobId] = useState<string | null>(null);
  const scheduleJob = useJobStatus<any>(scheduleJobId);
  const [marketingJobId, setMarketingJobId] = useState<string | null>(null);
  const marketingJob = useJobStatus<any>(marketingJobId);
  const [loadingList, setLoadingList] = useState(false);

  // When analysis job completes, update breakdown
  useEffect(() => {
    if (analysisJobId && analysisJob.status === 'completed') {
      const r: any = analysisJob.result || {};
      const next = r.breakdown || r.version?.data || r.data || r;
      if (next) setBreakdown(next);
    }
  }, [analysisJobId, analysisJob.status, analysisJob.result]);

  // When schedule job completes, update schedule
  useEffect(() => {
    if (scheduleJobId && scheduleJob.status === 'completed') {
      const r: any = scheduleJob.result || {};
      const nextSchedule = r.schedule || r.data || [];
      if (Array.isArray(nextSchedule)) setSchedule(nextSchedule);
    }
  }, [scheduleJobId, scheduleJob.status, scheduleJob.result]);
  const exportCallSheet = () => {
    const pid = (list[0]?.id) || 'project';
    const title = (list[0]?.title) || 'Project';
    const html = `<!doctype html><html><head><meta charset=\"utf-8\"><title>Call Sheet - ${title}</title>
    <style>
      body{font-family: Arial, sans-serif;padding:24px;color:#111}
      h1{margin:0 0 8px 0;font-size:20px}
      h2{margin:16px 0 8px 0;font-size:16px}
      .day{border:1px solid #ddd;border-radius:6px;padding:12px;margin-bottom:12px}
      .scene{font-size:12px;margin:6px 0;padding:6px;border:1px solid #eee;border-radius:4px}
      .meta{color:#555}
      .row{display:flex;gap:12px;flex-wrap:wrap}
      .chip{border:1px solid #ddd;border-radius:999px;padding:2px 8px;font-size:11px}
    </style></head><body>
    <h1>Call Sheet</h1>
    <div class=\"meta\">Project: ${title} • ID: ${pid} • Generated: ${new Date().toLocaleString()}</div>
    ${schedule.map((d: any) => `
      <div class=\"day\">
        <h2>Day ${d.day}</h2>
        ${(d.scenes||[]).map((s: any) => `
          <div class=\"scene\">
            <div><strong>${s.name}</strong></div>
            <div class=\"row\">
              ${s.location ? `<span class=\"chip\">Location: ${s.location}</span>` : ''}
              ${s.timeOfDay ? `<span class=\"chip\">${s.timeOfDay}</span>` : ''}
              ${s.duration ? `<span class=\"chip\">${s.duration} min</span>` : ''}
            </div>
            ${Array.isArray(s.cast) && s.cast.length ? `<div class=\"meta\">Cast: ${s.cast.join(', ')}</div>` : ''}
            ${s.notes ? `<div class=\"meta\">Notes: ${s.notes}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `).join('')}
    </body></html>`;
    const w = window.open('', '_blank');
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
      w.focus();
      w.print();
    }
  };

  // Drag & drop helpers for schedule tab
  const handleDragStart = (e: React.DragEvent, scene: any, source: 'backlog' | 'day', dayIdx?: number) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ source, sceneId: scene.id, dayIdx }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const removeSceneFromDays = (sceneId: string) => {
    setSchedule(prev => prev.map(d => ({ ...d, scenes: d.scenes.filter((s: any) => s.id !== sceneId) })));
  };

  const removeSceneFromBacklog = (sceneId: string) => {
    setScheduleScenes(prev => prev.filter(s => s.id !== sceneId));
  };

  const findScene = (sceneId: string): any | null => {
    const inBacklog = scheduleScenes.find(s => s.id === sceneId);
    if (inBacklog) return inBacklog;
    for (const d of schedule) {
      const found = (d.scenes || []).find((s: any) => s.id === sceneId);
      if (found) return found;
    }
    return null;
  };

  const handleDropToDay = (e: React.DragEvent, targetDayIdx: number) => {
    e.preventDefault();
    try {
      const payload = JSON.parse(e.dataTransfer.getData('application/json')) as { source: 'backlog' | 'day'; sceneId: string; dayIdx?: number };
      const scene = findScene(payload.sceneId);
      if (!scene) return;
      if (payload.source === 'backlog') {
        removeSceneFromBacklog(payload.sceneId);
      } else if (payload.source === 'day') {
        removeSceneFromDays(payload.sceneId);
      }
      setSchedule(prev => prev.map((d, idx) => idx === targetDayIdx ? ({ ...d, scenes: [...(d.scenes || []), scene] }) : d));
    } catch {}
  };

  const handleDropToBacklog = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const payload = JSON.parse(e.dataTransfer.getData('application/json')) as { source: 'backlog' | 'day'; sceneId: string; dayIdx?: number };
      const scene = findScene(payload.sceneId);
      if (!scene) return;
      if (payload.source === 'day') {
        removeSceneFromDays(payload.sceneId);
        setScheduleScenes(prev => [...prev, scene]);
      }
    } catch {}
  };

  const updateSceneField = (dayIdx: number, sceneId: string, field: 'duration' | 'notes', value: any) => {
    setSchedule(prev => prev.map((d, idx) => idx !== dayIdx ? d : ({
      ...d,
      scenes: (d.scenes || []).map((s: any) => s.id !== sceneId ? s : ({ ...s, [field]: value }))
    })));
  };

  const toggleSceneCast = (dayIdx: number, sceneId: string, memberName: string) => {
    setSchedule(prev => prev.map((d, idx) => idx !== dayIdx ? d : ({
      ...d,
      scenes: (d.scenes || []).map((s: any) => {
        if (s.id !== sceneId) return s;
        const cast = Array.isArray(s.cast) ? s.cast.slice() : [];
        const i = cast.indexOf(memberName);
        if (i >= 0) cast.splice(i, 1); else cast.push(memberName);
        return { ...s, cast };
      })
    })));
  };

  const updateDayCallTime = (dayIdx: number, key: 'crewCall' | 'shootStart' | 'lunch' | 'wrap', value: string) => {
    setSchedule(prev => prev.map((d, idx) => idx !== dayIdx ? d : ({ ...d, callTimes: { ...(d.callTimes || {}), [key]: value } })));
  };

  const handleReorderWithinDay = (dayIdx: number, fromIndex: number, toIndex: number) => {
    setSchedule(prev => prev.map((d, idx) => {
      if (idx !== dayIdx) return d;
      const scenes = [...(d.scenes || [])];
      const [movedScene] = scenes.splice(fromIndex, 1);
      scenes.splice(toIndex, 0, movedScene);
      // Update position indices for persistence
      return { ...d, scenes: scenes.map((s, i) => ({ ...s, position: i })) };
    }));
  };

  const addNewDay = () => {
    const newDayNumber = Math.max(...schedule.map(d => d.day || 0), 0) + 1;
    setSchedule(prev => [...prev, { 
      day: newDayNumber, 
      scenes: [], 
      callTimes: { crewCall: '07:00', shootStart: '08:00', lunch: '12:00', wrap: '18:00' }
    }]);
  };

  const removeDay = (dayIdx: number) => {
    if (schedule.length <= 1) return; // Keep at least one day
    const day = schedule[dayIdx];
    // Move scenes back to backlog
    setScheduleScenes(prev => [...prev, ...(day.scenes || [])]);
    setSchedule(prev => prev.filter((_, idx) => idx !== dayIdx));
  };

  const exportCallSheetPdf = async () => {
    try {
      setLoadingPdf(true);
      // Load pdfmake dynamically
      const ensureScript = (src: string) => new Promise<void>((resolve, reject) => {
        const existing = Array.from(document.getElementsByTagName('script')).find(s => s.src === src);
        if (existing) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Failed to load ' + src));
        document.body.appendChild(s);
      });
      await ensureScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js');
      await ensureScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js');
      // @ts-ignore
      const pdfMake = (window as any).pdfMake;
      const title = (list[0]?.title) || 'Project';
      const content: any[] = [
        { text: `Call Sheet — ${title}`, style: 'header' },
        { text: `Generated: ${new Date().toLocaleString()}`, margin: [0, 0, 0, 10], style: 'sub' },
      ];
      schedule.forEach((d: any) => {
        content.push({ text: `Day ${d.day}`, style: 'dayHeader', margin: [0, 10, 0, 4] });
        if (d.callTimes) {
          content.push({ text: `Crew Call: ${d.callTimes.crewCall || '-'}  |  Shoot: ${d.callTimes.shootStart || '-'}  |  Lunch: ${d.callTimes.lunch || '-'}  |  Wrap: ${d.callTimes.wrap || '-'}`, style: 'meta' });
        }
        (d.scenes || []).forEach((s: any) => {
          content.push({ text: s.name, style: 'sceneTitle' });
          const metaLine = [`${s.location || '-'}`, `${s.timeOfDay || '-'}`, s.duration ? `${s.duration} min` : '-' ].join(' • ');
          content.push({ text: metaLine, style: 'meta' });
          if (Array.isArray(s.cast) && s.cast.length) content.push({ text: `Cast: ${s.cast.join(', ')}`, style: 'meta' });
          if (s.notes) content.push({ text: `Notes: ${s.notes}`, style: 'meta' });
        });
      });
      const docDefinition = {
        content,
        styles: {
          header: { fontSize: 16, bold: true },
          sub: { fontSize: 9, color: '#666' },
          dayHeader: { fontSize: 12, bold: true },
          sceneTitle: { fontSize: 10, bold: true, margin: [0, 4, 0, 0] },
          meta: { fontSize: 9, color: '#444' },
        }
      } as any;
      pdfMake.createPdf(docDefinition).open();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPdf(false);
    }
  };

  // API projects state + fallback mock
  const [projectsData, setProjectsData] = useState<any[]>([]);
  const mockProjects = [
    {
      id: "1",
      title: "Love in Lagos",
      genre: "Romantic Drama",
      status: "production" as const,
      progress: 65,
      budget: "₦50M",
      director: "Kemi Adetiba",
      startDate: "Nov 2024",
      deadline: "Mar 2025",
      teamSize: 45,
      description: "A heartwarming story about finding love in the bustling city of Lagos.",
      isOwner: true,
      location: "Lagos, Nigeria",
      type: "feature"
    },
    {
      id: "2",
      title: "The Set Up 3",
      genre: "Action Thriller",
      status: "pre-production" as const,
      progress: 25,
      budget: "₦80M",
      director: "Niyi Akinmolayan",
      startDate: "Feb 2025",
      deadline: "Jun 2025",
      teamSize: 60,
      description: "The third installment of the popular action thriller series.",
      isOwner: true,
      location: "Abuja, Nigeria",
      type: "feature"
    },
    {
      id: "3",
      title: "Nigerian Dreams",
      genre: "Documentary",
      status: "post-production" as const,
      progress: 85,
      budget: "₦15M",
      director: "Tunde Kelani",
      startDate: "Aug 2024",
      deadline: "Dec 2024",
      teamSize: 25,
      description: "A documentary exploring the dreams and aspirations of young Nigerians.",
      isOwner: false,
      location: "Lagos, Nigeria",
      type: "documentary"
    }
  ];

  const list = projectsData.length ? projectsData : mockProjects;
  const filteredProjects = list.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.director.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || project.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getPrimaryRole = () => {
    if (roles.length === 0) return "actor";
    return roles[0].role;
  };

  const canCreateProjects = () => {
    const primaryRole = getPrimaryRole();
    return primaryRole === "producer" || primaryRole === "director";
  };

  const handleCreateProject = () => {
    setLoadingList(true);
    toast({
      title: "Create Project",
      description: "Project creation form would open here.",
    });
    setTimeout(() => setLoadingList(false), 500);
  };

  // Script upload + AI breakdown placeholder UI for first project
  const [scriptFile, setScriptFile] = useState<File | null>(null);
  const [breakdown, setBreakdown] = useState<any | null>(null);
  const handleScriptUpload = async () => {
    if (!scriptFile) return;
    // Try S3 signed upload first, fallback to blob URL if not configured
    try {
      const projectId = (list[0]?.id);
      if (!projectId) throw new Error('No project available');
      let publicUrl: string | null = null;
      try {
        const sign = await api.signUpload(scriptFile.name, scriptFile.type || 'application/octet-stream');
        // PUT to signed URL
        await fetch(sign.url, {
          method: 'PUT',
          headers: { 'Content-Type': scriptFile.type || 'application/octet-stream' },
          body: scriptFile,
        });
        // Derive public URL (assuming bucket/object is readable or behind CDN)
        // @ts-ignore
        publicUrl = sign.url.split('?')[0];
      } catch (err) {
        // Fallback: blob URL
        publicUrl = URL.createObjectURL(scriptFile);
      }

      const { project } = await api.uploadProjectScript(projectId, publicUrl!);
      setBreakdown(project.scriptBreakdown || null);
      toast({ title: "Script saved", description: `Uploaded and saved script URL.` });
    } catch (e) {
      console.error(e);
      toast({ title: "Upload failed", description: "Could not upload script.", variant: "destructive" });
    }
  };

  const handleScriptAnalysis = async () => {
    if (!scriptFile) return;
    try {
      const projectId = (list[0]?.id);
      if (!projectId) throw new Error('No project available');
      
      // Create FormData for file upload and POST directly (multipart)
      const formData = new FormData();
      formData.append('scriptFile', scriptFile);
      if (scriptFile.type === 'text/plain') {
        const text = await scriptFile.text();
        formData.append('scriptText', text);
      }
      const token = authService.getToken();
      const res = await fetch(`/api/projects/${projectId}/script/analyze`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } as any : undefined,
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to start analysis');
      const data = await res.json();
      setAnalysisJobId(data.jobId);
      toast({ title: "Analysis queued", description: "We’ll notify when it completes." });
    } catch (error) {
      console.error('Script analysis error:', error);
      toast({ title: "Analysis failed", description: "Failed to analyze script.", variant: "destructive" });
    }
  };

  const handleEditProject = (projectId: string) => {
    toast({
      title: "Edit Project",
      description: `Editing project ${projectId}`,
    });
  };

  // Simple members management UI for the first mock project
  const [members, setMembers] = useState<any[]>([]);
  const [newMemberUserId, setNewMemberUserId] = useState<string>("");
  const [newMemberRole, setNewMemberRole] = useState<string>("");

  const loadMembers = async () => {
    try {
      const projectId = (list[0]?.id);
      const { members } = await api.getProjectMembers(projectId);
      setMembers(members);
    } catch (e) {
      console.error(e);
    }
  };

  const addMember = async () => {
    try {
      const projectId = (list[0]?.id);
      await api.addProjectMember(projectId, { userId: newMemberUserId, role: newMemberRole });
      setNewMemberUserId("");
      setNewMemberRole("");
      await loadMembers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    toast({
      title: "Delete Project",
      description: `Project ${projectId} would be deleted.`,
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="relative">
        <Navigation 
          isAuthenticated={true}
          userRole={getPrimaryRole()}
          userName={`${user?.firstName} ${user?.lastName}`}
        />
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader
          title="Projects"
          subtitle="Manage your film projects and track production progress"
          rightActions={canCreateProjects() ? (
            <Button onClick={handleCreateProject} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Project
            </Button>
          ) : undefined}
        />

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects, directors, or genres..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pre-production">Pre-Production</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="post-production">Post-Production</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="collaborations">Collaborations</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
          </TabsList>

          <TabsContent value="my-projects" className="space-y-6">
            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {filteredProjects.filter(p => p.isOwner).length} project{filteredProjects.filter(p => p.isOwner).length !== 1 ? 's' : ''} found
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select defaultValue="recent">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Project Listings */}
            {loadingList ? (
              <ListSkeleton rows={4} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredProjects.filter(p => p.isOwner).map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          <Badge variant="secondary">{project.genre}</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">{project.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Film className="w-4 h-4" />
                            {project.director}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {project.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {project.teamSize}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditProject(project.id)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(project.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>

                      {/* Project Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span>{project.budget}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{project.startDate} - {project.deadline}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Settings className="w-4 h-4 mr-2" />
                          Manage
                        </Button>
                      </div>

                      {/* Script upload + AI breakdown with versioning */}
                      {project.id === (list[0]?.id) && (
                        <div className="mt-4 border-t pt-4 space-y-3">
                          <div className="font-medium">Script & AI Breakdown (Preview)</div>
                          <div className="flex items-center gap-2">
                            <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={e => setScriptFile(e.target.files?.[0] || null)} />
                            <Button variant="secondary" size="sm" onClick={handleScriptUpload} disabled={!scriptFile}>Upload (URL) & Save</Button>
                            <Button variant="outline" size="sm" onClick={handleScriptAnalysis} disabled={!scriptFile}>Analyze & Version</Button>
                            <Button variant="ghost" size="sm" onClick={async () => {
                              const pid = (list[0]?.id);
                              const { versions } = await api.getScriptVersions(pid);
                              alert(`Versions: ${versions.length}`);
                            }}>View Versions</Button>
                          </div>
                          {breakdown && (
                            <div className="text-sm text-muted-foreground">
                              <div>Scenes: {breakdown.scenes}</div>
                              <div>Characters: {breakdown.characters.join(', ')}</div>
                              <div>Locations: {breakdown.locations.join(', ')}</div>
                              <div>Estimated Crew: gaffer {breakdown.estimatedCrew.gaffer}, sound {breakdown.estimatedCrew.sound_engineer}, makeup {breakdown.estimatedCrew.makeup_artist}, editor {breakdown.estimatedCrew.editor}, camera {breakdown.estimatedCrew.camera_operator}</div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Members management for first project */}
                      {project.id === (list[0]?.id) && (
                        <div className="mt-4 border-t pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">Team Members</div>
                            <Button variant="ghost" size="sm" onClick={loadMembers}>Refresh</Button>
                          </div>
                          <div className="space-y-2">
                            {members.map(m => (
                              <div key={m.id} className="text-sm flex items-center justify-between">
                                <div>
                                  <span className="font-medium">{m.role}</span>
                                  {m.character && <span className="text-muted-foreground ml-2">{m.character}</span>}
                                </div>
                                <div className="text-muted-foreground">User: {m.userId}</div>
                              </div>
                            ))}
                            {!members.length && <div className="text-sm text-muted-foreground">No members yet</div>}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Input placeholder="User ID" value={newMemberUserId} onChange={e => setNewMemberUserId(e.target.value)} />
                            <Input placeholder="Role (e.g., actor, gaffer)" value={newMemberRole} onChange={e => setNewMemberRole(e.target.value)} />
                            <Button onClick={addMember} disabled={!newMemberUserId || !newMemberRole}>Add</Button>
                          </div>
                        </div>
                      )}

                      {/* Marketing Content Generation for first project */}
                      {project.id === (list[0]?.id) && (
                        <div className="mt-4 border-t pt-4">
                          <div className="font-medium mb-3">AI Marketing Content</div>
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <Input placeholder="Genre" value={project.genre} readOnly />
                              <Input placeholder="Target Audience" />
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={async () => {
                                try {
                                  const { jobId } = await api.generateMarketingContent(
                                    project.title,
                                    project.genre,
                                    project.description,
                                    'General audience'
                                  );
                                  setMarketingJobId(jobId);
                                  toast({ title: "Marketing job started", description: "We’ll show the result below when ready." });
                                } catch (error) {
                                  toast({ title: "Generation failed", description: "Failed to generate marketing content.", variant: "destructive" });
                                }
                              }}
                            >
                              Generate Marketing Content
                            </Button>
                            {marketingJobId && (
                              <div className="text-xs text-muted-foreground">
                                Status: {marketingJob.status || 'queued'} {typeof marketingJob.progress === 'number' ? `• ${Math.round(marketingJob.progress)}%` : ''}
                                {marketingJob.status === 'completed' && marketingJob.result ? (
                                  <div className="mt-1">
                                    <div><strong>Tagline:</strong> {marketingJob.result?.content?.tagline || marketingJob.result?.tagline}</div>
                                    <div><strong>Poster:</strong> {marketingJob.result?.content?.posterDescription || marketingJob.result?.posterDescription}</div>
                                  </div>
                                ) : null}
                                {marketingJob.status === 'failed' && marketingJob.error ? (
                                  <div className="mt-1 text-red-600">{marketingJob.error}</div>
                                ) : null}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            )}

            {filteredProjects.filter(p => p.isOwner).length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Film className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                  <p className="text-muted-foreground mb-4">
                    {canCreateProjects() 
                      ? "Create your first project to get started with production management."
                      : "You don't have any projects yet."
                    }
                  </p>
                  {canCreateProjects() && (
                    <Button onClick={handleCreateProject}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="collaborations" className="space-y-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Collaborations</h3>
                <p className="text-muted-foreground mb-4">
                  Projects you're collaborating on will appear here.
                </p>
                <Button variant="outline" onClick={() => setActiveTab("discover")}>
                  Discover Projects
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Optimizer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">Scenes</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 border rounded p-2 min-h-[120px]" onDragOver={(e) => e.preventDefault()} onDrop={handleDropToBacklog}>
                    {scheduleScenes.map(s => (
                      <div key={s.id} className="border rounded p-2 text-sm cursor-move" draggable onDragStart={(e) => handleDragStart(e, s, 'backlog')}>{s.name}</div>
                    ))}
                    {!scheduleScenes.length && <div className="text-xs text-muted-foreground">Drag scenes here to remove from days</div>}
                  </div>
                  <div>
                    <Button variant="outline" size="sm" onClick={async () => {
                      try {
                        const { jobId } = await api.aiOptimizeScheduleStart({ scenes: scheduleScenes, maxDailyScenes: 2 });
                        setScheduleJobId(jobId);
                        toast({ title: "Optimization queued", description: "We’ll update the schedule when ready." });
                      } catch (e) {
                        toast({ title: "Optimize failed", description: "Could not start optimization.", variant: "destructive" });
                      }
                    }}>Optimize</Button>
                    <Button variant="ghost" size="sm" onClick={async () => {
                      const pid = (list[0]?.id);
                      if (!pid) return;
                      const res = await api.getScriptVersions(pid);
                      const versions = res.versions || [];
                      const latest = versions[versions.length - 1];
                      if (latest?.data?.sceneList) setScheduleScenes(latest.data.sceneList.map((s: any) => ({ id: s.id, name: s.name, location: s.location, timeOfDay: s.timeOfDay })));
                    }}>Load Scenes from Analysis</Button>
                    <Button variant="secondary" size="sm" onClick={async () => {
                      const pid = (list[0]?.id);
                      if (!pid) return;
                      await fetch(`/api/projects/${pid}/schedule`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ schedule }),
                      });
                      alert('Schedule saved');
                    }}>Save Schedule</Button>
                    <Button variant="outline" size="sm" onClick={exportCallSheet}>Export Call Sheet (Print)</Button>
                    <Button variant="outline" size="sm" disabled={loadingPdf} onClick={exportCallSheetPdf}>{loadingPdf ? 'Generating...' : 'Export Call Sheet (PDF)'}</Button>
                    <Button variant="ghost" size="sm" onClick={addNewDay}>Add Day</Button>
                    <div className="mt-3 space-y-2">
                      {schedule.map((d, i) => (
                        <div key={i} className="border rounded p-2 min-h-[80px]" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDropToDay(e, i)}>
                          <div className="font-medium text-sm flex items-center justify-between">
                            <span>Day {d.day}</span>
                            <div className="flex items-center gap-2 text-xs">
                              <input type="time" className="border rounded px-2 py-1" value={(d.callTimes?.crewCall)||''} onChange={(e) => updateDayCallTime(i, 'crewCall', e.target.value)} title="Crew Call" />
                              <input type="time" className="border rounded px-2 py-1" value={(d.callTimes?.shootStart)||''} onChange={(e) => updateDayCallTime(i, 'shootStart', e.target.value)} title="Shoot Start" />
                              <input type="time" className="border rounded px-2 py-1" value={(d.callTimes?.lunch)||''} onChange={(e) => updateDayCallTime(i, 'lunch', e.target.value)} title="Lunch" />
                              <input type="time" className="border rounded px-2 py-1" value={(d.callTimes?.wrap)||''} onChange={(e) => updateDayCallTime(i, 'wrap', e.target.value)} title="Wrap" />
                              {schedule.length > 1 && (
                                <Button variant="ghost" size="sm" onClick={() => removeDay(i)} className="text-red-600 hover:text-red-700">×</Button>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1 mt-1">
                            {(d.scenes || []).map((s: any) => (
                              <div key={s.id} className="border rounded p-2 cursor-move" draggable onDragStart={(e) => handleDragStart(e, s, 'day', i)}>
                                <div className="text-xs text-muted-foreground">{s.name}</div>
                                <div className="text-[11px] text-muted-foreground">{s.location || '-'} • {s.timeOfDay || '-'}</div>
                                <div className="mt-1 grid grid-cols-3 gap-2 items-center">
                                  <div className="col-span-1">
                                    <input type="number" min={0} placeholder="Duration (min)" value={s.duration || ''} onChange={(e) => updateSceneField(i, s.id, 'duration', e.target.value ? Number(e.target.value) : undefined)} className="w-full border rounded px-2 py-1 text-xs" />
                                  </div>
                                  <div className="col-span-2">
                                    <input type="text" placeholder="Notes" value={s.notes || ''} onChange={(e) => updateSceneField(i, s.id, 'notes', e.target.value)} className="w-full border rounded px-2 py-1 text-xs" />
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <div className="text-[11px] mb-1">Cast</div>
                                  <div className="flex flex-wrap gap-2">
                                    {members.map(m => (
                                      <label key={m.id} className="text-[11px] border rounded px-2 py-1 cursor-pointer">
                                        <input type="checkbox" className="mr-1" checked={Array.isArray(s.cast) ? s.cast.includes(m.character || m.role || m.userId) : false} onChange={() => toggleSceneCast(i, s.id, (m.character || m.role || m.userId))} />
                                        {(m.character || m.role || m.userId)}
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {!schedule.length && <div className="text-sm text-muted-foreground">No schedule yet</div>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Discover Projects</h3>
                <p className="text-muted-foreground mb-4">
                  Find exciting projects to collaborate on.
                </p>
                <Button variant="outline" onClick={() => setLocation("/jobs")}>
                  Browse Opportunities
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
