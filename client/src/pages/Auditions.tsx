import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Video, 
  Upload, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  PlayCircle,
  MessageSquare,
  FileVideo,
  Star
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import PageHeader from '@/components/PageHeader';
import ResponsiveSection from '@/components/ResponsiveSection';
import { useToast } from '@/hooks/use-toast';

export default function Auditions() {
  const [selfTape, setSelfTape] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const myAuditions = [
    { id: '1', role: 'Lead Antagonist', project: 'Lagos Hustle', status: 'reviewed', date: '2 days ago', rating: 4.5 },
    { id: '2', role: 'Comic Relief', project: 'Wedding Party 3', status: 'pending', date: '5 hours ago' },
    { id: '3', role: 'Support Doctor', project: 'Life in Ikeja', status: 'shortlisted', date: '1 week ago' },
  ];

  const invitations = [
    { id: 'i1', role: 'Action Hero', project: 'Delta Force', producer: 'Trino Studios', deadline: 'In 48 hours' },
  ];

  const submitSelfTape = async () => {
    if (!selfTape || !selectedJobId) return;
    setSubmitting(true);
    try {
      await api.submitAudition(selectedJobId, selfTape);
      toast({
        title: "Audition Submitted!",
        description: "Your self-tape has been successfully sent to the production team.",
      });
      setSelfTape('');
    } catch (e) {
      toast({
        title: "Submission Failed",
        description: "There was an error uploading your audition. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <ResponsiveSection padding="medium">
        <PageHeader 
          title="Audition Portal" 
          subtitle="Manage your casting calls, submit self-tapes, and track your progress from script to screen."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="my-auditions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="my-auditions">My Submissions</TabsTrigger>
                <TabsTrigger value="invitations">
                  Invitations 
                  {invitations.length > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                      {invitations.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="my-auditions" className="mt-6">
                <div className="space-y-4">
                  {myAuditions.map((audition) => (
                    <Card key={audition.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row">
                        <div className="w-full sm:w-48 aspect-video bg-muted relative group cursor-pointer">
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                            <PlayCircle className="h-10 w-10 text-white opacity-80 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all" />
                          </div>
                          <img src={`https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=200`} alt="Thumbnail" className="w-full h-full object-cover" />
                        </div>
                        <CardContent className="flex-1 p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-bold text-lg">{audition.role}</h3>
                              <p className="text-sm text-muted-foreground">{audition.project}</p>
                            </div>
                            <Badge variant={
                              audition.status === 'shortlisted' ? 'default' : 
                              audition.status === 'reviewed' ? 'secondary' : 'outline'
                            }>
                              {audition.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Submitted {audition.date}</span>
                            {audition.rating && (
                              <span className="flex items-center gap-1 text-yellow-600 font-medium">
                                <Star className="h-3 w-3 fill-yellow-600" /> {audition.rating} Average Score
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="invitations" className="mt-6">
                {invitations.length > 0 ? (
                  <div className="space-y-4">
                    {invitations.map((inv) => (
                      <Card key={inv.id} className="border-primary/20 bg-primary/5">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{inv.role}</CardTitle>
                            <Badge variant="outline" className="bg-background">Priority</Badge>
                          </div>
                          <CardDescription>Requested by {inv.producer} for <strong>{inv.project}</strong></CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 text-sm text-destructive font-medium mb-4">
                            <AlertCircle className="h-4 w-4" /> Deadline: {inv.deadline}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1" onClick={() => setSelectedJobId(inv.id)}>
                              Accept & Record
                            </Button>
                            <Button size="sm" variant="outline">Decline</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-xl border-2 border-dashed">
                    <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">No new audition invitations yet.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-8">
            <Card className="border-primary/20 shadow-lg">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Upload className="h-5 w-5" /> Submit Self-Tape
                </CardTitle>
                <CardDescription>Submit your recorded audition for review.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Audition Link (YouTube/Vimeo/Drive)</label>
                  <Input 
                    placeholder="https://..." 
                    value={selfTape} 
                    onChange={e => setSelfTape(e.target.value)} 
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reference Job ID</label>
                  <Input 
                    placeholder="e.g. JOB-123" 
                    value={selectedJobId} 
                    onChange={e => setSelectedJobId(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="p-4 bg-muted rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-muted/50 transition-colors">
                  <FileVideo className="h-8 w-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                  <p className="text-xs font-medium text-muted-foreground">Or upload directly (coming soon)</p>
                </div>
                <Button 
                  className="w-full h-11 text-base font-semibold shadow-md" 
                  onClick={submitSelfTape} 
                  disabled={!selfTape || !selectedJobId || submitting}
                >
                  {submitting ? (
                    <><Clock className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                  ) : (
                    'Submit My Audition'
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Self-Tape Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-3 text-muted-foreground">
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  <span>Ensure you have good natural lighting on your face.</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  <span>Record in a quiet environment with a plain background.</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  <span>Frame your shot from mid-chest up (medium close-up).</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ResponsiveSection>
    </div>
  );
}
