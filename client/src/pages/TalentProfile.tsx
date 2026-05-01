import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, MapPin, Briefcase, Mail, Star, ExternalLink, Calendar as CalendarIcon } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export default function TalentProfile() {
  const [, params] = useRoute('/talent/:userId');
  const userId = params?.userId as string;
  const [profile, setProfile] = useState<any | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<string>('');
  const [roleDesc, setRoleDesc] = useState<string>('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (!userId) return;
        const { user, roles } = await api.getUserProfile(userId);
        setProfile({ user, roles });
        const me = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }});
        const meData = await me.json();
        if (meData?.user?.id) {
          const { projects } = await api.listProjects({ createdById: meData.user.id });
          setProjects(projects || []);
          if (projects?.length) setProjectId(projects[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [userId]);

  const requestAudition = async () => {
    setIsSending(true);
    try {
      await api.requestAudition({ recipientId: userId, projectId: projectId || undefined, roleDescription: roleDesc || undefined });
      alert('Audition request sent');
      setRoleDesc('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  if (!profile) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  const { user, roles } = profile;
  
  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-5xl space-y-8">
        
        {/* Header Profile Section */}
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center bg-card rounded-xl p-8 border shadow-sm">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
            <AvatarFallback className="text-4xl">{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold tracking-tight">{user.firstName} {user.lastName}</h1>
                <div className="flex items-center gap-4 text-muted-foreground mt-2">
                  {user.location && (
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {user.location}</span>
                  )}
                  {user.email && (
                    <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {user.email}</span>
                  )}
                </div>
              </div>
              <Button size="lg" onClick={() => document.getElementById('audition-section')?.scrollIntoView({ behavior: 'smooth' })}>
                <PlayCircle className="mr-2 h-4 w-4" /> Book Audition
              </Button>
            </div>
            
            <div className="flex gap-2 flex-wrap pt-4">
              {roles.map((r: any) => (
                <Badge key={r.id} variant={r.isActive ? 'default' : 'secondary'} className="text-sm px-3 py-1 uppercase">
                  {r.role}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Reel & Bio) */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><PlayCircle className="h-5 w-5 text-primary" /> Video Reel</CardTitle>
                <CardDescription>Latest acting showcase and monologues.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center border-2 border-dashed">
                  <PlayCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground font-medium">Reel Placeholder</p>
                  <p className="text-sm text-muted-foreground">In a live app, this would integrate with YouTube or Mux.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Biography & Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground leading-relaxed">
                  {user.bio || `${user.firstName} is a dedicated professional in the Nollywood industry, specializing in multiple roles with a passion for bringing authentic African stories to life.`}
                </p>
                <Separator />
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Skills</h4>
                <div className="flex gap-2 flex-wrap">
                  {roles.flatMap((r: any) => r.skills || []).length > 0 ? 
                    Array.from(new Set(roles.flatMap((r: any) => r.skills))).map((skill: any, i) => (
                      <Badge key={i} variant="outline">{skill}</Badge>
                    )) : 
                    <span className="text-muted-foreground text-sm">No skills listed yet.</span>
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card id="audition-section" className="border-primary/20 shadow-md">
              <CardHeader className="bg-primary/5 rounded-t-xl pb-4">
                <CardTitle>Request Audition</CardTitle>
                <CardDescription>Send a direct casting request to {user.firstName}.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Project</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={projectId} 
                    onChange={e => setProjectId(e.target.value)}
                  >
                    <option value="">-- No specific project --</option>
                    {projects.map(p => (<option key={p.id} value={p.id}>{p.title}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role Description & Notes</label>
                  <Input 
                    placeholder="e.g. Lead Antagonist - requires stunt work" 
                    value={roleDesc} 
                    onChange={e => setRoleDesc(e.target.value)} 
                  />
                </div>
                <Button className="w-full" onClick={requestAudition} disabled={isSending}>
                  {isSending ? 'Sending...' : 'Send Casting Request'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-muted-foreground"><Star className="h-4 w-4 mr-2" /> Rating</span>
                  <span className="font-medium">4.9 / 5.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-muted-foreground"><Briefcase className="h-4 w-4 mr-2" /> Projects Completed</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-muted-foreground"><CalendarIcon className="h-4 w-4 mr-2" /> Availability</span>
                  <Badge variant="success" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-0">Available</Badge>
                </div>
                {user.website && (
                  <div className="pt-4 border-t">
                    <a href={user.website} target="_blank" rel="noreferrer" className="flex items-center text-sm text-primary hover:underline">
                      <ExternalLink className="h-4 w-4 mr-2" /> View External Portfolio
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
