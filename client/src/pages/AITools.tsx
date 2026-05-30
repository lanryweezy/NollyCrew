import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Zap,
  FileText,
  Users,
  Calendar,
  Target,
  Upload,
  Play,
  Pause,
  Square,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  MessageSquare,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ResponsiveGrid from "@/components/ResponsiveGrid";
import ResponsiveSection from "@/components/ResponsiveSection";
import ResponsiveButton from "@/components/ResponsiveButton";
import ResponsiveTypography from "@/components/ResponsiveTypography";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VirtualDirectorChat from "@/components/VirtualDirectorChat";

import { api } from "@/lib/api";

export default function AITools() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("script-analysis");
  
  // Script Analysis state
  const [scriptText, setScriptText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Legal AI state
  const [legalForm, setLegalForm] = useState({ talentName: '', roleName: '', projectName: '', rate: '' });
  const [isGeneratingLegal, setIsGeneratingLegal] = useState(false);
  const [legalResult, setLegalResult] = useState<string | null>(null);

  const handleScriptAnalysis = async () => {
    if (!scriptText.trim()) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/analyze-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptText })
      });
      const data = await response.json();
      setAnalysisResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLegalGeneration = async () => {
    setIsGeneratingLegal(true);
    try {
      const res = await api.generateReleaseForm(legalForm.talentName, legalForm.roleName, legalForm.projectName, legalForm.rate);
      setLegalResult(res.document);
    } catch (e) {
      console.error(e);
      alert('Failed to generate document');
    } finally {
      setIsGeneratingLegal(false);
    }
  };

  const aiTools = [
    {
      id: "script-analysis",
      title: "Script Analysis",
      description: "Breakdown & planning",
      icon: FileText,
      label: "Script"
    },
    {
      id: "director-chat",
      title: "AI Director",
      description: "Real-time advice",
      icon: MessageSquare,
      label: "Director"
    },
    {
      id: "casting-recommendations",
      title: "Talent Match",
      description: "Intelligent matching",
      icon: Users,
      label: "Casting"
    },
    {
      id: "schedule-optimization",
      title: "Schedule",
      description: "Efficiency engine",
      icon: Calendar,
      label: "Schedule"
    },
    {
      id: "marketing-content",
      title: "Marketing",
      description: "Content generator",
      icon: Target,
      label: "Marketing"
    },
    {
      id: "legal-ai",
      title: "Legal AI",
      description: "Contract automation",
      icon: FileText,
      label: "Legal"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white film-grain overflow-x-hidden">
      {/* Navigation */}
      <div className="relative z-50">
        <Navigation 
          isAuthenticated={true}
          userRole="producer"
          userName="AI User"
        />
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      </div>

      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <ResponsiveSection padding="medium" className="relative z-10 pt-10">
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <Badge className="bg-primary/20 text-primary border-primary/30 py-1 px-3">
              <Zap className="w-3.5 h-3.5 mr-1.5 fill-primary" />
              Pro Feature Suite
            </Badge>
          </motion.div>
          <PageHeader 
            title="Intelligence Center" 
            subtitle="The algorithmic heart of your next blockbuster."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Enhanced Glassmorphic Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 space-y-4"
          >
            <div className="glass-deep rounded-[32px] p-4 border-white/5 shadow-2xl sticky top-24">
              <div className="px-4 py-3 mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Tools Suite</h3>
              </div>
              <div className="space-y-2">
                {aiTools.map((tool) => (
                  <motion.div 
                    key={tool.id}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 flex items-center gap-4 group ${
                      activeTab === tool.id 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                        : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-transparent'
                    }`}
                    onClick={() => setActiveTab(tool.id)}
                  >
                    <div className={`p-2 rounded-xl transition-colors ${
                      activeTab === tool.id ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
                    }`}>
                      <tool.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm leading-none mb-1">{tool.label}</h4>
                      <p className={`text-[10px] ${activeTab === tool.id ? 'text-primary-foreground/70' : 'text-white/30'}`}>
                        {tool.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="glass-card rounded-[24px] p-6 border-white/5 bg-gradient-to-br from-primary/10 to-transparent">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Star className="w-4 h-4 text-primary" />
                </div>
                <h4 className="font-bold text-sm">Credits Available</h4>
              </div>
              <div className="space-y-2">
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full w-3/4 bg-primary" />
                 </div>
                 <p className="text-[10px] text-white/40 font-medium">750 / 1000 tokens remaining</p>
              </div>
            </div>
          </motion.div>

          {/* Main Workspace */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {activeTab === "director-chat" && (
                   <div className="glass-deep rounded-[40px] overflow-hidden border-white/5 shadow-2xl">
                      <VirtualDirectorChat />
                   </div>
                )}

                {activeTab === "script-analysis" && (
                  <div className="space-y-8">
                    <div className="glass-deep rounded-[40px] p-10 border-white/5 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 transition-all duration-500 group-focus-within:bg-primary/10" />
                      
                      <div className="flex items-center justify-between mb-10">
                        <div>
                          <h2 className="text-3xl font-bold font-serif mb-2">Script Analysis</h2>
                          <p className="text-white/40 font-light">Advanced breakdown & structural intelligence</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <Button variant="ghost" className="rounded-full bg-white/5 hover:bg-white/10 text-white/60">
                             <Upload className="w-4 h-4 mr-2" />
                             Upload PDF
                           </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label htmlFor="script-text" className="text-xs uppercase tracking-widest text-white/40 ml-1">Screenplay Content</Label>
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-orange-500 rounded-[24px] blur opacity-0 group-focus-within:opacity-20 transition duration-500" />
                          <Textarea
                            id="script-text"
                            placeholder="Paste your script text here to begin the deep analysis..."
                            value={scriptText}
                            onChange={(e) => setScriptText(e.target.value)}
                            className="relative min-h-[300px] bg-black/40 border-white/10 rounded-[24px] p-8 text-lg font-light leading-relaxed focus:ring-0 focus:border-primary/50 transition-all placeholder:text-white/10"
                          />
                        </div>
                      </div>

                      <div className="mt-8 flex justify-end">
                        <Button 
                          onClick={handleScriptAnalysis} 
                          disabled={isAnalyzing || !scriptText.trim()}
                          size="lg"
                          className="h-16 px-12 rounded-full font-bold text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 group overflow-hidden relative"
                        >
                          <AnimatePresence mode="wait">
                            {isAnalyzing ? (
                              <motion.div
                                key="analyzing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center"
                              >
                                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-3" />
                                <span>Processing...</span>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="default"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center"
                              >
                                <Zap className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                <span>Execute Intelligence</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Button>
                      </div>
                    </div>

                    {/* Bento Results Display */}
                    <AnimatePresence>
                      {analysisResult && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="grid grid-cols-1 md:grid-cols-6 gap-6"
                        >
                          {/* Main Stats Bento */}
                          <div className="md:col-span-4 glass-deep p-8 rounded-[40px] border-white/5 flex flex-col justify-between">
                             <div className="flex items-center justify-between mb-8">
                               <h3 className="text-xl font-bold flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                   <Zap className="w-5 h-5 text-primary" />
                                 </div>
                                 Analysis Summary
                               </h3>
                               <Badge variant="outline" className="text-green-500 border-green-500/20">High Accuracy</Badge>
                             </div>
                             <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                                <div>
                                  <p className="text-xs text-white/30 uppercase tracking-tighter mb-1">Scenes</p>
                                  <p className="text-4xl font-black">{analysisResult.scenes}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-white/30 uppercase tracking-tighter mb-1">Characters</p>
                                  <p className="text-4xl font-black">{analysisResult.characters.length}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-white/30 uppercase tracking-tighter mb-1">Locations</p>
                                  <p className="text-4xl font-black">{analysisResult.locations.length}</p>
                                </div>
                             </div>
                          </div>

                          {/* Budget Bento */}
                          <div className="md:col-span-2 glass-deep p-8 rounded-[40px] border-white/5 bg-gradient-to-br from-green-500/10 to-transparent">
                             <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                               <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                 <TrendingUp className="w-4 h-4 text-green-500" />
                               </div>
                               Estimated Budget
                             </h3>
                             <div className="space-y-4">
                                <div>
                                  <p className="text-3xl font-black leading-none">₦{analysisResult.budget.low.toLocaleString()}</p>
                                  <p className="text-[10px] text-white/30 mt-1 uppercase">Floor Estimate</p>
                                </div>
                                <div className="h-0.5 w-full bg-white/5" />
                                <div>
                                  <p className="text-3xl font-black leading-none text-primary">₦{analysisResult.budget.high.toLocaleString()}</p>
                                  <p className="text-[10px] text-white/30 mt-1 uppercase">Recommended Allocation</p>
                                </div>
                             </div>
                          </div>

                          {/* Key Insights Bento */}
                          <div className="md:col-span-3 glass-deep p-8 rounded-[40px] border-white/5">
                             <h3 className="text-lg font-bold mb-6">Production Strategy</h3>
                             <div className="space-y-4">
                                <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 items-start">
                                   <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                      <Clock className="w-5 h-5 text-blue-400" />
                                   </div>
                                   <div>
                                      <p className="font-bold text-sm">Optimal Schedule</p>
                                      <p className="text-xs text-white/40 mt-0.5">30 days recommended for maximum creative output.</p>
                                   </div>
                                </div>
                                <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 items-start">
                                   <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                                      <Users className="w-5 h-5 text-purple-400" />
                                   </div>
                                   <div>
                                      <p className="font-bold text-sm">Crew Capacity</p>
                                      <p className="text-xs text-white/40 mt-0.5">15 specialized roles identified for this production.</p>
                                   </div>
                                </div>
                             </div>
                          </div>

                          {/* Risk Map Bento */}
                          <div className="md:col-span-3 glass-deep p-8 rounded-[40px] border-white/5 bg-gradient-to-br from-orange-500/5 to-transparent">
                             <h3 className="text-lg font-bold mb-6">Potential Bottlenecks</h3>
                             <div className="p-5 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-4">
                                <AlertCircle className="w-6 h-6 text-orange-500 shrink-0 mt-1" />
                                <div>
                                   <p className="font-bold text-orange-500">Weather Dependency</p>
                                   <p className="text-sm text-white/60 mt-1">3 critical exterior scenes identified. We recommend scheduling during the dry season or arranging studio cover.</p>
                                </div>
                             </div>
                             <Button variant="ghost" className="w-full mt-6 rounded-2xl text-white/40 hover:text-white hover:bg-white/5">
                               View Detailed Risk Map
                               <ArrowRight className="w-4 h-4 ml-2" />
                             </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Other tabs can be implemented with similar cinematic styling */}
                {activeTab !== "script-analysis" && activeTab !== "director-chat" && (
                   <div className="glass-deep rounded-[40px] p-20 border-white/5 flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-8">
                         <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                      </div>
                      <h2 className="text-4xl font-black font-serif mb-4 uppercase tracking-tight">{activeTab.replace('-', ' ')}</h2>
                      <p className="text-white/40 max-w-md text-lg font-light">This module is receiving the final cinematic polish. Check back shortly for the upgraded interface.</p>
                   </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </ResponsiveSection>
    </div>
  );
}