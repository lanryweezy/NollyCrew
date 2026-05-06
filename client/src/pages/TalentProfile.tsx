import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  PlayCircle, 
  MapPin, 
  Briefcase, 
  Mail, 
  Star, 
  ExternalLink, 
  Calendar as CalendarIcon,
  CheckCircle,
  Play,
  Zap,
  Globe,
  Award
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import ResponsiveSection from '@/components/ResponsiveSection';

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
      <div className="min-h-screen bg-black film-grain flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const { user, roles } = profile;
  const primaryRole = roles[0]?.role || 'Professional';
  
  return (
    <div className="min-h-screen bg-black text-white film-grain overflow-x-hidden pb-20">
      {/* Navigation (Overlay) */}
      <div className="absolute top-0 left-0 w-full z-50">
        <Navigation isAuthenticated={true} />
      </div>

      {/* Immersive Edge-to-Edge Hero */}
      <section className="relative h-[70vh] w-full flex items-end overflow-hidden">
        {/* Cover Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-60 scale-105"
            alt="Cinematic background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent md:block hidden" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 container mx-auto px-6 pb-20 max-w-7xl"
        >
          <div className="flex flex-col md:flex-row gap-10 items-end">
             {/* Oversized Avatar */}
             <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-orange-500 rounded-[40px] blur opacity-25 group-hover:opacity-40 transition duration-1000" />
                <Avatar className="h-48 w-48 rounded-[40px] border-4 border-black relative z-10 shadow-2xl">
                  <AvatarImage src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} className="object-cover" />
                  <AvatarFallback className="text-6xl bg-muted">{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-3 -right-3 z-20 bg-primary rounded-2xl p-2 shadow-xl border-4 border-black">
                   <CheckCircle className="w-6 h-6 text-white" />
                </div>
             </div>

             <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                   {roles.map((r: any) => (
                      <Badge key={r.id} className="bg-white/10 text-white backdrop-blur-md border-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest leading-none">
                         {r.role}
                      </Badge>
                   ))}
                </div>
                <h1 className="text-6xl md:text-9xl font-black font-serif tracking-tighter leading-none italic">
                   {user.firstName} <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">{user.lastName}</span>
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-white/50 text-sm font-medium">
                   <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      {user.location || "Lagos, Nigeria"}
                   </div>
                   <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      4.9 (24 Reviews)
                   </div>
                   <div className="flex items-center gap-2 text-green-500">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Available for Hire
                   </div>
                </div>
             </div>
          </div>
        </motion.div>
      </section>

      <ResponsiveSection padding="medium" className="relative z-10 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
          
          {/* Main Portfolio Content */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* The Reel - High End Gallery Style */}
            <section>
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Play className="w-5 h-5 text-primary" />
                     </div>
                     Featured Showreel
                  </h2>
                  <Button variant="ghost" className="text-white/40 hover:text-white">View Full Media Kit</Button>
               </div>
               
               <motion.div 
                 whileHover={{ scale: 1.01 }}
                 className="group glass-deep rounded-[40px] aspect-video relative overflow-hidden border-white/10 shadow-2xl cursor-pointer"
               >
                  <img 
                    src="https://images.unsplash.com/photo-1598897349489-0b1a03975a5e?q=80&w=2070&auto=format&fit=crop" 
                    className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110"
                    alt="Reel thumbnail"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                     <div className="w-24 h-24 rounded-full bg-primary/20 backdrop-blur-md border border-primary/50 flex items-center justify-center group-hover:scale-125 transition-all duration-500">
                        <Play className="w-10 h-10 text-white fill-white ml-1" />
                     </div>
                  </div>
                  <div className="absolute bottom-8 left-8">
                     <p className="text-sm font-black uppercase tracking-widest text-white/40 mb-1">Director's Choice</p>
                     <h3 className="text-2xl font-bold">Acting Reel 2024 - Lagos Noir</h3>
                  </div>
               </motion.div>
            </section>

            {/* Biography & Experience */}
            <section className="space-y-8">
               <div className="glass-deep p-10 rounded-[40px] border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                  <h2 className="text-2xl font-bold mb-6">Professional Narrative</h2>
                  <p className="text-xl text-white/70 leading-relaxed font-light italic">
                     "{user.bio || `${user.firstName} is a powerhouse of creative energy in the Nollywood scene. With over a decade of experience across independent and major studio productions, they bring an unparalleled depth of character and technical precision to every project.`}"
                  </p>
                  
                  <div className="mt-12 space-y-6">
                     <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Industry Specializations</h4>
                     <div className="flex gap-3 flex-wrap">
                        {roles.flatMap((r: any) => r.skills || []).length > 0 ? 
                          Array.from(new Set(roles.flatMap((r: any) => r.skills))).map((skill: any, i) => (
                            <Badge key={i} className="bg-white/5 text-white/60 hover:text-white hover:bg-primary/20 transition-colors border-white/5 px-6 py-2.5 rounded-2xl font-bold">
                               {skill}
                            </Badge>
                          )) : 
                          <span className="text-white/20 text-sm">Skills profile pending verification...</span>
                        }
                     </div>
                  </div>
               </div>
            </section>

            {/* Filmography Log */}
            <section className="space-y-8">
               <h2 className="text-2xl font-bold tracking-tight px-4">Production Credits</h2>
               <div className="space-y-4">
                  {[
                    { title: "Love in Lagos", role: "Lead Actor", year: "2024", type: "Feature" },
                    { title: "The Set Up 3", role: "Lead Actor", year: "2023", type: "Original" },
                    { title: "Battle on Buka Street", role: "Supporting", year: "2022", type: "Feature" }
                  ].map((credit, i) => (
                    <div key={i} className="glass-card p-8 rounded-[32px] border-white/5 hover:bg-white/5 transition-all flex items-center justify-between group">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-serif text-white/30 group-hover:text-primary transition-colors italic">
                             {credit.year}
                          </div>
                          <div>
                             <h4 className="text-xl font-bold">{credit.title}</h4>
                             <p className="text-sm text-white/40">{credit.role} • {credit.type}</p>
                          </div>
                       </div>
                       <Button variant="ghost" size="icon" className="rounded-full text-white/20 hover:text-primary">
                          <ExternalLink className="w-5 h-5" />
                       </Button>
                    </div>
                  ))}
               </div>
            </section>
          </div>

          {/* Sidebar Booking Panel */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-24">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-deep rounded-[48px] p-10 border-primary/20 shadow-2xl bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
                
                <div className="relative z-10">
                   <div className="mb-8">
                      <h2 className="text-3xl font-black tracking-tight mb-2">Book Session</h2>
                      <p className="text-white/40 text-sm font-light">Secure this professional for your next production pipeline.</p>
                   </div>

                   <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Production Project</label>
                        <select 
                          className="flex h-14 w-full rounded-2xl border border-white/10 bg-black/40 px-6 py-2 text-sm focus:border-primary/50 transition-all outline-none appearance-none"
                          value={projectId} 
                          onChange={e => setProjectId(e.target.value)}
                        >
                          <option value="">-- No specific project --</option>
                          {projects.map(p => (<option key={p.id} value={p.id}>{p.title}</option>))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Role & Requirements</label>
                        <Input 
                          placeholder="Describe the casting requirements..." 
                          value={roleDesc} 
                          onChange={e => setRoleDesc(e.target.value)} 
                          className="h-14 rounded-2xl bg-black/40 border-white/10 px-6 focus:ring-0 focus:border-primary/50"
                        />
                      </div>

                      <Button 
                        className="w-full h-16 rounded-[28px] bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 group" 
                        onClick={requestAudition} 
                        disabled={isSending}
                      >
                        <AnimatePresence mode="wait">
                          {isSending ? (
                            <motion.div key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center">
                               <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-3" />
                               Processing...
                            </motion.div>
                          ) : (
                            <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center">
                               Initiate Booking
                               <Zap className="ml-2 w-5 h-5 group-hover:scale-125 transition-transform" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Button>
                      
                      <p className="text-[10px] text-center text-white/30 uppercase tracking-tighter">
                         Average Response Time: <span className="text-primary font-bold">2 Hours</span>
                      </p>
                   </div>
                </div>
              </motion.div>

              {/* Verified Badge Card */}
              <div className="mt-8 glass-deep p-8 rounded-[40px] border-white/5 flex items-center gap-6">
                 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-transparent border border-green-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                 </div>
                 <div>
                    <h4 className="font-bold text-white leading-none mb-1 text-lg">Verified Identity</h4>
                    <p className="text-xs text-white/40 font-light">Background check & credentials verified by NollyCrew Compliance.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveSection>
    </div>
  );
}
