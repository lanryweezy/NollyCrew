import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';

export default function Auditions() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selfTape, setSelfTape] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // In this MVP, reuse jobs listing via generic fetch
    (async () => {
      try {
        const res = await fetch('/api/jobs');
        const data = await res.json();
        setJobs(data.jobs || []);
        if (data.jobs?.length) setSelectedJobId(data.jobs[0].id);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const submitSelfTape = async () => {
    if (!selectedJobId || !selfTape) return;
    setSubmitting(true);
    try {
      // Try signed upload first, fallback to blob
      let tapeUrl: string;
      try {
        const sign = await api.signUpload(selfTape.name, selfTape.type || 'video/mp4');
        await fetch(sign.url, { method: 'PUT', headers: { 'Content-Type': selfTape.type || 'video/mp4' }, body: selfTape });
        // @ts-ignore
        tapeUrl = sign.url.split('?')[0];
      } catch (err) {
        tapeUrl = URL.createObjectURL(selfTape);
      }
      await fetch(`/api/jobs/${selectedJobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coverLetter: 'Self-tape submission', portfolio: { video: tapeUrl } }),
      });
      alert('Self-tape submitted');
      setSelfTape(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Auditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <select className="border rounded px-3 py-2" value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)}>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title} ({j.category})</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <input type="file" accept="video/*" onChange={e => setSelfTape(e.target.files?.[0] || null)} />
            <Button onClick={submitSelfTape} disabled={!selfTape || !selectedJobId || submitting}>{submitting ? 'Submitting...' : 'Submit Self-Tape'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


