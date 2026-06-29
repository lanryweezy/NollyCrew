import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { aiTools } from "@/lib/api";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Brain, Film, Users, FileText, Loader2, Sparkles, MessageSquare, Send,
  Copy, Check, Globe, ChevronDown, ChevronUp,
  Mic, MapPin, Calendar, RefreshCw, Video, Languages, Shield
} from "lucide-react";
import PageHeader from "@/components/PageHeader";

const AI_TOOLS = [
  { id: "script", title: "Script Breakdown", description: "Extract scenes, characters, props, wardrobe, VFX, and camera shots from any script", icon: FileText, color: "text-blue-500", category: "Production" },
  { id: "casting", title: "Casting AI", description: "AI-powered casting with embedding similarity, bias checks, and match scoring", icon: Users, color: "text-green-500", category: "Talent" },
  { id: "schedule", title: "Schedule Optimizer", description: "Constraint-based schedule optimization with cost estimation", icon: Calendar, color: "text-purple-500", category: "Production" },
  { id: "marketing", title: "Marketing Content", description: "Generate taglines, poster concepts, trailer scripts, and social media campaigns", icon: Sparkles, color: "text-yellow-500", category: "Marketing" },
  { id: "director", title: "Virtual Director", description: "Chat with an AI Nollywood director for creative and logistical advice", icon: MessageSquare, color: "text-pink-500", category: "Creative" },
  { id: "translate", title: "Script Translator", description: "Translate scripts to Yoruba, Igbo, Hausa, or Nigerian Pidgin with cultural context", icon: Languages, color: "text-cyan-500", category: "Production" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  return (
    <Button variant="ghost" size="sm" onClick={() => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "Copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    }}>
      {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

function ResultSection({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border rounded-lg overflow-hidden">
      <button className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors" onClick={() => setOpen(!open)}>
        <span className="flex items-center gap-2 font-medium text-sm"><Icon className="w-4 h-4" /> {title}</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="p-3">{children}</div>}
    </div>
  );
}

export default function AITools() {
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Script Breakdown state
  const [scriptText, setScriptText] = useState("");

  // Casting state
  const [castingRole, setCastingRole] = useState("");
  const [castingRequirements, setCastingRequirements] = useState("");
  const [castingLocation, setCastingLocation] = useState("");
  const [castingBudget, setCastingBudget] = useState("");

  // Schedule state
  const [scheduleScenes, setScheduleScenes] = useState("");
  const [scheduleMaxDays, setScheduleMaxDays] = useState("10");
  const [scheduleMaxHours, setScheduleMaxHours] = useState("10");

  // Marketing state
  const [marketingTitle, setMarketingTitle] = useState("");
  const [marketingGenre, setMarketingGenre] = useState("");
  const [marketingSynopsis, setMarketingSynopsis] = useState("");
  const [marketingAudience, setMarketingAudience] = useState("General audience");
  const [marketingTone, setMarketingTone] = useState("Dramatic");

  // Director Chat state
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string; time?: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Translate state
  const [translateText, setTranslateText] = useState("");
  const [translateLang, setTranslateLang] = useState("Yoruba");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  function resetAll() {
    setResult(null);
    setScriptText("");
    setCastingRole("");
    setCastingRequirements("");
    setCastingLocation("");
    setCastingBudget("");
    setScheduleScenes("");
    setMarketingTitle("");
    setMarketingGenre("");
    setMarketingSynopsis("");
    setChatHistory([]);
    setChatInput("");
    setTranslateText("");
  }

  function selectTool(id: string) {
    resetAll();
    setActiveTool(id);
  }

  // ===== SCRIPT BREAKDOWN =====
  async function runScriptBreakdown() {
    if (!scriptText.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await aiTools.analyzeScript(scriptText);
      if (data) {
        const b = data.breakdown || data;
        setResult(b);
        toast({ title: "Script analyzed!", description: `Found ${b.scenes || 0} scenes, ${b.characters?.length || 0} characters` });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  }

  // ===== CASTING =====
  async function runCasting() {
    if (!castingRole.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await aiTools.casting(castingRole, castingRequirements, castingLocation || undefined);
      if (data) {
        setResult(data.recommendations ? { recommendations: data.recommendations } : data);
        const count = data.recommendations?.length || 0;
        toast({ title: "Casting complete!", description: `${count} candidates ranked` });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  }

  // ===== SCHEDULE =====
  async function runSchedule() {
    if (!scheduleScenes.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const scenes = scheduleScenes.split("\n").filter(l => l.trim()).map((line, i) => ({
        id: `SCN-${i + 1}`,
        name: line.trim(),
        location: "TBD",
        timeOfDay: "Day",
        duration: 60,
        characters: [],
        props: [],
        wardrobe: [],
        vfx: [],
      }));
      const data = await aiTools.optimizeSchedule("project", scenes, {
        maxDays: Number(scheduleMaxDays),
        maxHoursPerDay: Number(scheduleMaxHours),
      });
      if (data) {
        setResult(data.optimization || data);
        toast({ title: "Schedule optimized!" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  }

  // ===== MARKETING =====
  async function runMarketing() {
    if (!marketingTitle.trim() || !marketingGenre.trim() || !marketingSynopsis.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await aiTools.generateMarketing(marketingTitle, marketingGenre, marketingSynopsis, marketingAudience);
      if (data) {
        setResult(data.content || data);
        toast({ title: "Marketing content generated!" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  }

  // ===== DIRECTOR CHAT =====
  async function sendDirectorChat() {
    if (!chatInput.trim() || loading) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { role: "user", content: chatInput.trim(), time: now };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput("");
    setLoading(true);
    try {
      const data = await aiTools.directorChat(chatInput.trim(), chatHistory.map(m => ({ role: m.role, content: m.content })));
      if (data?.reply) {
        setChatHistory(prev => [...prev, { role: "assistant", content: data.reply, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
      } else {
        setChatHistory(prev => [...prev, { role: "assistant", content: "I'm currently in demo mode (OpenAI not configured). I'd love to help you once the connection is established!", time: now }]);
      }
    } catch {
      setChatHistory(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process that right now. Please try again.", time: now }]);
    }
    setLoading(false);
  }

  // ===== TRANSLATE =====
  async function runTranslate() {
    if (!translateText.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await aiTools.translateScript(translateText, translateLang);
      if (data) {
        setResult({ translation: data.translation || data });
        toast({ title: `Translated to ${translateLang}!` });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  }

  const QUICK_PROMPTS = [
    "How do I light a night exterior scene in Lagos?",
    "What's the best way to manage a 50-person crew on a tight budget?",
    "How should I block a dialogue scene between two characters?",
    "What permits do I need to shoot in Victoria Island?",
    "How do I handle rain delays on an outdoor shoot?",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="AI Production Suite" description="6 AI-powered tools for every stage of your Nollywood production" />

        {/* Tool Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {AI_TOOLS.map((tool) => (
            <Card key={tool.id}
              className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${activeTool === tool.id ? "border-primary ring-2 ring-primary/20" : ""}`}
              onClick={() => selectTool(tool.id)}>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${tool.color}`}>
                    <tool.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{tool.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tool.description}</p>
                    <Badge variant="outline" className="text-[10px] mt-2">{tool.category}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active Tool Panel */}
        {activeTool && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {AI_TOOLS.find(t => t.id === activeTool)?.icon && (() => {
                  const Icon = AI_TOOLS.find(t => t.id === activeTool)!.icon;
                  return <Icon className="w-5 h-5" />;
                })()}
                {AI_TOOLS.find(t => t.id === activeTool)?.title}
              </CardTitle>
              <CardDescription>{AI_TOOLS.find(t => t.id === activeTool)?.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* ===== SCRIPT BREAKDOWN ===== */}
              {activeTool === "script" && (
                <>
                  <div className="space-y-2">
                    <Label>Script Text</Label>
                    <Textarea placeholder="Paste your full script here. Include scene headings (INT./EXT.), character names, dialogue, and action lines for best results..." rows={10} value={scriptText} onChange={(e) => setScriptText(e.target.value)} />
                    <p className="text-xs text-muted-foreground">{scriptText.split(/\s+/).filter(Boolean).length} words</p>
                  </div>
                  <Button onClick={runScriptBreakdown} className="w-full" disabled={loading || !scriptText.trim()}>
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
                    {loading ? "Analyzing script..." : "Run Full Breakdown"}
                  </Button>
                  {result && (
                    <div className="space-y-4 mt-4">
                      {/* Summary Stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: "Scenes", value: result.scenes || result.sceneList?.length || 0, icon: Film },
                          { label: "Characters", value: result.characters?.length || 0, icon: Users },
                          { label: "Locations", value: result.locations?.length || 0, icon: MapPin },
                          { label: "Props", value: result.props?.length || 0, icon: Mic },
                        ].map((stat, i) => (
                          <div key={i} className="text-center p-3 bg-muted rounded-lg">
                            <stat.icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-xl font-bold">{stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Crew Estimate */}
                      {result.estimatedCrew && Object.keys(result.estimatedCrew).length > 0 && (
                        <ResultSection title="Crew Requirements" icon={Users}>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.entries(result.estimatedCrew).map(([role, count]) => (
                              <div key={role} className="flex items-center justify-between p-2 bg-background rounded text-sm">
                                <span className="capitalize">{role.replace(/_/g, ' ')}</span>
                                <Badge variant="secondary">{String(count)}</Badge>
                              </div>
                            ))}
                          </div>
                        </ResultSection>
                      )}

                      {/* Scene List */}
                      {result.sceneList && result.sceneList.length > 0 && (
                        <ResultSection title={`Scene Breakdown (${result.sceneList.length} scenes)`} icon={Film}>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {result.sceneList.map((scene: any, i: number) => (
                              <div key={i} className="p-3 bg-background rounded-lg border">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="font-medium text-sm">{scene.id}: {scene.name}</p>
                                    <p className="text-xs text-muted-foreground">{scene.location} • {scene.timeOfDay} • ~{Math.round(scene.duration)}min</p>
                                  </div>
                                </div>
                                {scene.characters?.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {scene.characters.map((c: string, j: number) => (
                                      <Badge key={j} variant="secondary" className="text-[10px]">{c}</Badge>
                                    ))}
                                  </div>
                                )}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                  {scene.props?.length > 0 && (
                                    <div><span className="text-muted-foreground">Props:</span> {scene.props.join(', ')}</div>
                                  )}
                                  {scene.wardrobe?.length > 0 && (
                                    <div><span className="text-muted-foreground">Wardrobe:</span> {scene.wardrobe.join(', ')}</div>
                                  )}
                                  {scene.vfx?.length > 0 && (
                                    <div><span className="text-muted-foreground">VFX:</span> {scene.vfx.join(', ')}</div>
                                  )}
                                  {scene.cameraShots?.length > 0 && (
                                    <div><span className="text-muted-foreground">Camera:</span> {scene.cameraShots.join(', ')}</div>
                                  )}
                                </div>
                                {scene.directorNotes && (
                                  <p className="text-xs text-muted-foreground mt-2 italic">Director: {scene.directorNotes}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </ResultSection>
                      )}

                      {/* Characters */}
                      {result.characters?.length > 0 && (
                        <ResultSection title="Characters" icon={Users}>
                          <div className="flex flex-wrap gap-2">
                            {result.characters.map((c: string, i: number) => (
                              <Badge key={i} variant="secondary">{c}</Badge>
                            ))}
                          </div>
                        </ResultSection>
                      )}

                      {/* Locations */}
                      {result.locations?.length > 0 && (
                        <ResultSection title="Locations" icon={MapPin}>
                          <div className="flex flex-wrap gap-2">
                            {result.locations.map((l: string, i: number) => (
                              <Badge key={i} variant="outline">{l}</Badge>
                            ))}
                          </div>
                        </ResultSection>
                      )}

                      {/* Props */}
                      {result.props?.length > 0 && (
                        <ResultSection title="Props List" icon={Mic}>
                          <div className="flex flex-wrap gap-2">
                            {result.props.map((p: string, i: number) => (
                              <Badge key={i} variant="outline">{p}</Badge>
                            ))}
                          </div>
                        </ResultSection>
                      )}

                      {/* VFX */}
                      {result.vfx?.length > 0 && (
                        <ResultSection title="VFX Requirements" icon={Sparkles}>
                          <div className="flex flex-wrap gap-2">
                            {result.vfx.map((v: string, i: number) => (
                              <Badge key={i} variant="outline">{v}</Badge>
                            ))}
                          </div>
                        </ResultSection>
                      )}

                      <CopyButton text={JSON.stringify(result, null, 2)} />
                    </div>
                  )}
                </>
              )}

              {/* ===== CASTING AI ===== */}
              {activeTool === "casting" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Role Name *</Label>
                      <Input placeholder="e.g. Lead Actress, Villain, Comic Relief" value={castingRole} onChange={(e) => setCastingRole(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Location Preference</Label>
                      <Select value={castingLocation} onValueChange={setCastingLocation}>
                        <SelectTrigger><SelectValue placeholder="Any location" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any</SelectItem>
                          <SelectItem value="Lagos">Lagos</SelectItem>
                          <SelectItem value="Abuja">Abuja</SelectItem>
                          <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Character Description & Requirements</Label>
                    <Textarea placeholder="Describe the character: age range (25-35), personality traits, physical description, experience level, special skills needed, character arc..." rows={5} value={castingRequirements} onChange={(e) => setCastingRequirements(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Budget Range (₦, optional)</Label>
                    <Input placeholder="e.g. 500000 - 2000000" value={castingBudget} onChange={(e) => setCastingBudget(e.target.value)} />
                  </div>
                  <Button onClick={runCasting} className="w-full" disabled={loading || !castingRole.trim()}>
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
                    {loading ? "Analyzing talent pool..." : "Get AI Casting Recommendations"}
                  </Button>
                  {result && (
                    <div className="space-y-4 mt-4">
                      {result.recommendations ? (
                        result.recommendations.map((r: any, i: number) => (
                          <div key={i} className={`p-4 rounded-lg border ${i === 0 ? 'border-primary bg-primary/5' : ''}`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  {i === 0 && <Badge className="bg-yellow-500">Top Pick</Badge>}
                                  <p className="font-semibold">{r.name || r.talent_name || `Candidate ${i + 1}`}</p>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{r.reason || r.reasons?.join(' • ') || ''}</p>
                              </div>
                              <div className="text-right">
                                {r.score !== undefined && (
                                  <div className="text-2xl font-bold text-primary">{Math.round((r.score || r.match_score || 0) * 100)}%</div>
                                )}
                                {r.match_score !== undefined && r.score === undefined && (
                                  <div className="text-2xl font-bold text-primary">{r.match_score}%</div>
                                )}
                                <p className="text-xs text-muted-foreground">match</p>
                              </div>
                            </div>
                            {r.matchFactors && (
                              <div className="grid grid-cols-5 gap-2 mt-3">
                                {Object.entries(r.matchFactors).map(([key, val]) => (
                                  <div key={key} className="text-center">
                                    <div className="w-full bg-muted rounded-full h-1.5 mb-1">
                                      <div className="bg-primary rounded-full h-1.5" style={{ width: `${Number(val) * 100}%` }} />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground capitalize">{key}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {r.biasCheck && (
                              <div className="mt-2 flex items-center gap-2">
                                <Shield className="w-3 h-3 text-green-500" />
                                <span className="text-xs text-muted-foreground">Diversity score: {Math.round((r.biasCheck.diversityScore || 1) * 100)}%</span>
                                {r.biasCheck.fairnessFlags?.length > 0 && (
                                  <Badge variant="outline" className="text-[10px]">{r.biasCheck.fairnessFlags.length} flags</Badge>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">{JSON.stringify(result, null, 2)}</pre>
                      )}
                      <CopyButton text={JSON.stringify(result, null, 2)} />
                    </div>
                  )}
                </>
              )}

              {/* ===== SCHEDULE OPTIMIZER ===== */}
              {activeTool === "schedule" && (
                <>
                  <div className="space-y-2">
                    <Label>Scene List (one per line)</Label>
                    <Textarea placeholder={"Scene 1: INT. OFFICE - DAY - Lead confronts villain\nScene 2: EXT. LAGOS STREET - NIGHT - Chase sequence\nScene 3: INT. HOSPITAL - DAY - Recovery scene"} rows={8} value={scheduleScenes} onChange={(e) => setScheduleScenes(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Max Shooting Days</Label>
                      <Input type="number" value={scheduleMaxDays} onChange={(e) => setScheduleMaxDays(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Hours Per Day</Label>
                      <Input type="number" value={scheduleMaxHours} onChange={(e) => setScheduleMaxHours(e.target.value)} />
                    </div>
                  </div>
                  <Button onClick={runSchedule} className="w-full" disabled={loading || !scheduleScenes.trim()}>
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />}
                    {loading ? "Optimizing schedule..." : "Optimize Shooting Schedule"}
                  </Button>
                  {result && (
                    <div className="space-y-4 mt-4">
                      {result.days && (
                        <>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <p className="text-2xl font-bold">{result.totalDays || result.days.length}</p>
                              <p className="text-xs text-muted-foreground">Total Days</p>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <p className="text-2xl font-bold">₦{((result.estimatedCost || 0) / 1000).toFixed(0)}K</p>
                              <p className="text-xs text-muted-foreground">Est. Cost</p>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <p className="text-2xl font-bold">{result.days.reduce((s: number, d: any) => s + (d.scenes?.length || 0), 0)}</p>
                              <p className="text-xs text-muted-foreground">Total Scenes</p>
                            </div>
                          </div>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {result.days.map((day: any, i: number) => (
                              <div key={i} className="p-3 bg-background rounded-lg border">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-semibold">Day {day.day || i + 1}</p>
                                  <Badge variant="outline">{day.totalDuration}min</Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                  <div>Scenes: {Array.isArray(day.scenes) ? day.scenes.join(', ') : day.scenes}</div>
                                  <div>Locations: {Array.isArray(day.locations) ? day.locations.join(', ') : day.locations}</div>
                                  <div>Crew Call: {day.crewCall}</div>
                                  <div>Wrap: {day.wrap}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      {result.optimizationNotes?.length > 0 && (
                        <ResultSection title="Optimization Notes" icon={Brain}>
                          <ul className="space-y-1 text-sm">
                            {result.optimizationNotes.map((note: string, i: number) => (
                              <li key={i} className="flex items-start gap-2"><Check className="w-3 h-3 mt-0.5 text-green-500" /> {note}</li>
                            ))}
                          </ul>
                        </ResultSection>
                      )}
                      <CopyButton text={JSON.stringify(result, null, 2)} />
                    </div>
                  )}
                </>
              )}

              {/* ===== MARKETING CONTENT ===== */}
              {activeTool === "marketing" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Project Title *</Label>
                      <Input placeholder="e.g. Lagos Blues 2" value={marketingTitle} onChange={(e) => setMarketingTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Genre *</Label>
                      <Input placeholder="e.g. Romantic Drama, Action Thriller" value={marketingGenre} onChange={(e) => setMarketingGenre(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Target Audience</Label>
                      <Select value={marketingAudience} onValueChange={setMarketingAudience}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General audience">General Audience</SelectItem>
                          <SelectItem value="Young adults 18-30">Young Adults (18-30)</SelectItem>
                          <SelectItem value="Film enthusiasts">Film Enthusiasts</SelectItem>
                          <SelectItem value="Diaspora Nigerians">Diaspora Nigerians</SelectItem>
                          <SelectItem value="Family audiences">Family Audiences</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tone</Label>
                      <Select value={marketingTone} onValueChange={setMarketingTone}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dramatic">Dramatic</SelectItem>
                          <SelectItem value="Humorous">Humorous</SelectItem>
                          <SelectItem value="Suspenseful">Suspenseful</SelectItem>
                          <SelectItem value="Inspirational">Inspirational</SelectItem>
                          <SelectItem value="Romantic">Romantic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Synopsis *</Label>
                    <Textarea placeholder="Describe your project's story, main characters, and unique selling points..." rows={4} value={marketingSynopsis} onChange={(e) => setMarketingSynopsis(e.target.value)} />
                  </div>
                  <Button onClick={runMarketing} className="w-full" disabled={loading || !marketingTitle.trim() || !marketingGenre.trim() || !marketingSynopsis.trim()}>
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    {loading ? "Generating content..." : "Generate Marketing Campaign"}
                  </Button>
                  {result && (
                    <div className="space-y-4 mt-4">
                      {result.tagline && (
                        <ResultSection title="Tagline" icon={Sparkles}>
                          <p className="text-lg font-bold text-center py-2">"{result.tagline}"</p>
                          <div className="text-center"><CopyButton text={result.tagline} /></div>
                        </ResultSection>
                      )}
                      {result.posterDescription && (
                        <ResultSection title="Poster Concept" icon={Film}>
                          <p className="text-sm">{result.posterDescription}</p>
                          <div className="mt-2"><CopyButton text={result.posterDescription} /></div>
                        </ResultSection>
                      )}
                      {result.trailerScript && (
                        <ResultSection title="Trailer Script" icon={Video}>
                          <pre className="text-sm whitespace-pre-wrap font-sans">{result.trailerScript}</pre>
                          <div className="mt-2"><CopyButton text={result.trailerScript} /></div>
                        </ResultSection>
                      )}
                      {result.socialMediaPosts?.length > 0 && (
                        <ResultSection title={`Social Media Posts (${result.socialMediaPosts.length})`} icon={Globe}>
                          <div className="space-y-3">
                            {result.socialMediaPosts.map((post: string, i: number) => (
                              <div key={i} className="p-3 bg-background rounded-lg border">
                                <p className="text-sm whitespace-pre-wrap">{post}</p>
                                <div className="mt-2"><CopyButton text={post} /></div>
                              </div>
                            ))}
                          </div>
                        </ResultSection>
                      )}
                      <CopyButton text={JSON.stringify(result, null, 2)} />
                    </div>
                  )}
                </>
              )}

              {/* ===== DIRECTOR CHAT ===== */}
              {activeTool === "director" && (
                <>
                  {chatHistory.length === 0 && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground text-center">Quick questions to get started:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {QUICK_PROMPTS.map((prompt, i) => (
                          <Button key={i} variant="outline" size="sm" className="text-xs" onClick={() => { setChatInput(prompt); }}>
                            {prompt.substring(0, 40)}...
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="max-h-[500px] overflow-y-auto space-y-3 p-4 bg-muted rounded-lg">
                    {chatHistory.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : ''}`}>
                          <div className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background border'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          {msg.time && (
                            <p className={`text-[10px] text-muted-foreground mt-1 ${msg.role === 'user' ? 'text-right' : ''}`}>{msg.time}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-background border p-3 rounded-lg flex items-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span className="text-xs text-muted-foreground">Director is thinking...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Ask about lighting, casting, scheduling, budgeting, locations..." value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !loading && sendDirectorChat()} />
                    <Button size="icon" onClick={sendDirectorChat} disabled={loading || !chatInput.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  {chatHistory.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => setChatHistory([])}>
                      <RefreshCw className="w-3 h-3 mr-1" /> Clear chat
                    </Button>
                  )}
                </>
              )}

              {/* ===== SCRIPT TRANSLATOR ===== */}
              {activeTool === "translate" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                      <Label>Target Language *</Label>
                      <Select value={translateLang} onValueChange={setTranslateLang}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yoruba">Yoruba</SelectItem>
                          <SelectItem value="Igbo">Igbo</SelectItem>
                          <SelectItem value="Hausa">Hausa</SelectItem>
                          <SelectItem value="Nigerian Pidgin">Nigerian Pidgin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2 sm:col-span-1 flex items-end">
                      <Badge variant="outline" className="mb-0.5"><Globe className="w-3 h-3 mr-1" /> Cultural context preserved</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Script Text (English) *</Label>
                    <Textarea placeholder="Paste the English script/dialogue you want translated..." rows={8} value={translateText} onChange={(e) => setTranslateText(e.target.value)} />
                  </div>
                  <Button onClick={runTranslate} className="w-full" disabled={loading || !translateText.trim()}>
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Languages className="w-4 h-4 mr-2" />}
                    {loading ? `Translating to ${translateLang}...` : `Translate to ${translateLang}`}
                  </Button>
                  {result && (
                    <div className="space-y-4 mt-4">
                      <ResultSection title={`Translation (${translateLang})`} icon={Globe}>
                        <pre className="text-sm whitespace-pre-wrap font-sans">{result.translation || JSON.stringify(result, null, 2)}</pre>
                        <div className="mt-2"><CopyButton text={result.translation || JSON.stringify(result)} /></div>
                      </ResultSection>
                    </div>
                  )}
                </>
              )}

            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
