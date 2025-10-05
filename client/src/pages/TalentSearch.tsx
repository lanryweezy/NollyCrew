import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import ListSkeleton from '@/components/ListSkeleton';

export default function TalentSearch() {
  const { user } = useAuth();
  const [role, setRole] = useState<string>('crew');
  const [location, setLocation] = useState<string>('');
  const [skills, setSkills] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const { results } = await api.searchTalent({
        role,
        location: location || undefined,
        skills: skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        limit: 50,
      });
      setResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
    // Load user's projects for hire target
    (async () => {
      try {
        const { projects } = await api.listProjects({ createdById: user?.id });
        setProjects(projects || []);
        if (projects?.length) setSelectedProjectId(projects[0].id);
      } catch (e) {
        console.error(e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runCastingAI = async () => {
    setAiLoading(true);
    try {
      const skillsArr = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : undefined;
      const { jobId } = await api.aiCastingStart({ role, location: location || undefined, skills: skillsArr, limit: 20 });
      // Poll until completion
      try {
        // naive inline polling for this page
        let attempts = 0;
        while (attempts < 120) { // up to ~3 minutes at 1.5s
          const status = await api.getJobStatus(jobId);
          if (status.status === 'completed') {
            const result = status.result || {} as any;
            setRecommendations(result.recommendations || result.data || []);
            break;
          }
          if (status.status === 'failed') {
            break;
          }
          await new Promise(r => setTimeout(r, 1500));
          attempts++;
        }
      } catch {}
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const hireToProject = async (candidate: any) => {
    try {
      if (!selectedProjectId) return;
      await api.addProjectMember(selectedProjectId, { userId: (candidate.userId || candidate.user_id) ?? candidate.userId, role: candidate.role });
      alert('Added to project');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader 
        title="Talent Search"
        subtitle="Find the perfect cast and crew for your projects"
      />
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            <select className="border rounded px-3 py-2" value={role} onChange={e => setRole(e.target.value)}>
              <option value="actor">Actor</option>
              <option value="crew">Crew</option>
              <option value="producer">Producer</option>
            </select>
            <Input placeholder="Location (e.g., Lagos)" value={location} onChange={e => setLocation(e.target.value)} />
            <Input placeholder="Skills (comma separated)" value={skills} onChange={e => setSkills(e.target.value)} />
            <select className="border rounded px-3 py-2" value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}>
              <option value="">Select project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
            <Button onClick={performSearch} disabled={loading}>{loading ? 'Searching...' : 'Search'}</Button>
            <Button variant="outline" onClick={runCastingAI} disabled={aiLoading}>{aiLoading ? 'Ranking...' : 'Casting AI'}</Button>
          </div>

          {loading ? (
            <ListSkeleton rows={4} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((r) => (
              <Card key={r.id} className="border cursor-pointer" onClick={() => window.location.href = `/talent/${r.userId || r.user_id || r.id}` }>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold capitalize">{r.role}</div>
                      {r.specialties?.length ? (
                        <div className="text-sm text-muted-foreground">{r.specialties.join(', ')}</div>
                      ) : null}
                      {r.skills?.length ? (
                        <div className="text-sm text-muted-foreground">Skills: {r.skills.join(', ')}</div>
                      ) : null}
                      {r.hourlyRate ? (
                        <div className="text-sm">Rate: ₦{r.hourlyRate}</div>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        {r.isActive ? 'Active' : 'Inactive'}
                      </div>
                      {selectedProjectId && (
                        <Button size="sm" onClick={() => hireToProject(r)}>Hire</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Casting AI Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recommendations.map((r, idx) => (
                      <div key={r.id || idx} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium capitalize">{r.role}</div>
                            <div className="text-xs text-muted-foreground">Score: {(r.score?.toFixed?.(2)) || r.score}</div>
                            {r.skills?.length ? <div className="text-xs text-muted-foreground">Skills: {r.skills.join(', ')}</div> : null}
                          </div>
                          {selectedProjectId && (
                            <Button size="sm" onClick={() => hireToProject(r)}>Hire</Button>
                          )}
                        </div>
                        
                        {/* Bias Check Display */}
                        {r.biasCheck && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">Diversity Score:</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                r.biasCheck.diversityScore > 0.8 ? 'bg-green-100 text-green-700' :
                                r.biasCheck.diversityScore > 0.6 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {(r.biasCheck.diversityScore * 100).toFixed(0)}%
                              </span>
                            </div>
                            
                            {r.biasCheck.fairnessFlags?.length > 0 && (
                              <div className="mb-1">
                                <span className="font-medium text-orange-600">⚠️ Fairness Flags:</span>
                                <div className="text-orange-600">{r.biasCheck.fairnessFlags.join(', ')}</div>
                              </div>
                            )}
                            
                            {/* Audit Trail (collapsible) */}
                            <details className="mt-1">
                              <summary className="cursor-pointer font-medium text-blue-600">View Audit Trail</summary>
                              <div className="mt-1 text-gray-600">
                                {r.biasCheck.auditTrail?.map((line: string, i: number) => (
                                  <div key={i}>{line}</div>
                                ))}
                              </div>
                            </details>
                          </div>
                        )}
                        
                        {/* Match Factors */}
                        {r.matchFactors && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <div>Experience: {(r.matchFactors.experience * 100).toFixed(0)}% | 
                                 Skills: {(r.matchFactors.skills * 100).toFixed(0)}% | 
                                 Location: {(r.matchFactors.location * 100).toFixed(0)}%</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


