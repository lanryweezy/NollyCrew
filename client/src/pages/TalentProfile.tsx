import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TalentProfile() {
  const [, params] = useRoute('/talent/:userId');
  const userId = params?.userId as string;
  const [profile, setProfile] = useState<any | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<string>('');
  const [roleDesc, setRoleDesc] = useState<string>('');

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
    try {
      await api.requestAudition({ recipientId: userId, projectId: projectId || undefined, roleDescription: roleDesc || undefined });
      alert('Audition request sent');
      setRoleDesc('');
    } catch (e) {
      console.error(e);
    }
  };

  if (!profile) return <div className="p-6">Loading...</div>;

  const { user, roles } = profile;
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{user.firstName} {user.lastName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">{user.email}</div>
          <div className="flex gap-2 flex-wrap">
            {roles.map((r: any) => (
              <span key={r.id} className="px-2 py-1 border rounded text-xs capitalize">{r.role}</span>
            ))}
          </div>
          <div className="border-t pt-4 space-y-2">
            <div className="font-medium">Request Audition</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
              <select className="border rounded px-3 py-2" value={projectId} onChange={e => setProjectId(e.target.value)}>
                <option value="">No project</option>
                {projects.map(p => (<option key={p.id} value={p.id}>{p.title}</option>))}
              </select>
              <Input placeholder="Role / Notes (optional)" value={roleDesc} onChange={e => setRoleDesc(e.target.value)} />
              <Button onClick={requestAudition}>Send Request</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


