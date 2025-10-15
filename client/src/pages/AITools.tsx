import { useState } from "react";
import { useLocation } from "wouter";
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
  Star
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ResponsiveGrid from "@/components/ResponsiveGrid";
import ResponsiveSection from "@/components/ResponsiveSection";
import ResponsiveButton from "@/components/ResponsiveButton";
import ResponsiveTypography from "@/components/ResponsiveTypography";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AITools() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("script-analysis");
  const [scriptText, setScriptText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleScriptAnalysis = () => {
    setIsAnalyzing(true);
    // Simulate AI processing
    setTimeout(() => {
      setAnalysisResult({
        scenes: 12,
        characters: ["John Doe", "Jane Smith", "Mike Johnson"],
        locations: ["City Street", "Office Building", "Apartment"],
        estimatedCrew: { director: 1, camera: 3, sound: 2 },
        props: ["Car", "Phone", "Documents"],
        wardrobe: ["Business Suit", "Casual Clothes"],
        vfx: ["Background Replacement", "Color Grading"],
        timeline: { preProduction: 45, shooting: 30, postProduction: 60 },
        budget: { low: 2000000, high: 4000000 }
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  const aiTools = [
    {
      id: "script-analysis",
      title: "Script Analysis",
      description: "AI-powered script breakdown and production planning",
      icon: FileText,
      features: [
        "Scene identification and breakdown",
        "Character analysis and requirements",
        "Location scouting suggestions",
        "Crew and equipment recommendations",
        "Budget estimation",
        "Timeline planning"
      ]
    },
    {
      id: "casting-recommendations",
      title: "Casting Recommendations",
      description: "Intelligent talent matching for your projects",
      icon: Users,
      features: [
        "AI-powered candidate matching",
        "Bias detection and fairness analysis",
        "Experience and skill evaluation",
        "Location and availability optimization",
        "Budget compatibility scoring",
        "Success projection modeling"
      ]
    },
    {
      id: "schedule-optimization",
      title: "Schedule Optimization",
      description: "Smart production scheduling for maximum efficiency",
      icon: Calendar,
      features: [
        "Optimal scene sequencing",
        "Location grouping strategies",
        "Crew and equipment allocation",
        "Weather dependency planning",
        "Cost minimization algorithms",
        "Resource utilization optimization"
      ]
    },
    {
      id: "marketing-content",
      title: "Marketing Content Generation",
      description: "AI-generated marketing materials for your projects",
      icon: Target,
      features: [
        "Compelling taglines and slogans",
        "Poster and promotional material concepts",
        "Trailer script generation",
        "Social media content creation",
        "Press kit development",
        "Distribution strategy planning"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="relative">
        <Navigation 
          isAuthenticated={true}
          userRole="producer"
          userName="AI User"
        />
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      </div>

      <ResponsiveSection padding="medium">
        <PageHeader 
          title="AI Tools Suite" 
          subtitle="Leverage advanced AI and machine learning to enhance your film production workflow"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="script-analysis">Script Analysis</TabsTrigger>
                <TabsTrigger value="casting">Casting</TabsTrigger>
                <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
                <TabsTrigger value="marketing">Marketing</TabsTrigger>
              </TabsList>

              <TabsContent value="script-analysis" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Script Analysis Tool
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="script-upload">Upload Script</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          id="script-upload" 
                          type="file" 
                          accept=".pdf,.txt,.doc,.docx" 
                          className="flex-1"
                        />
                        <Button variant="outline">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">or paste script text below</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="script-text">Script Text</Label>
                      <Textarea
                        id="script-text"
                        placeholder="Paste your script text here..."
                        value={scriptText}
                        onChange={(e) => setScriptText(e.target.value)}
                        rows={10}
                      />
                    </div>

                    <Button 
                      onClick={handleScriptAnalysis} 
                      disabled={isAnalyzing}
                      className="w-full"
                    >
                      {isAnalyzing ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing Script...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Analyze Script with AI
                        </>
                      )}
                    </Button>

                    {analysisResult && (
                      <div className="space-y-4 p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold">Analysis Results</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Scenes</p>
                            <p className="font-medium">{analysisResult.scenes}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Characters</p>
                            <p className="font-medium">{analysisResult.characters.length}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Locations</p>
                            <p className="font-medium">{analysisResult.locations.length}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Estimated Budget</p>
                            <p className="font-medium">₦{analysisResult.budget.low.toLocaleString()} - ₦{analysisResult.budget.high.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="pt-4">
                          <h4 className="font-medium mb-2">Key Insights</h4>
                          <ul className="space-y-1 text-sm">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>Optimal shooting schedule: 30 days</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>Recommended crew size: 15 people</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span>Weather dependency on 3 exterior scenes</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="casting" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Casting Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" placeholder="e.g., Lead Actor, Cinematographer" />
                      </div>
                      <div>
                        <Label htmlFor="requirements">Requirements</Label>
                        <Textarea 
                          id="requirements" 
                          placeholder="e.g., 30-40 years old, experienced in drama, Lagos-based" 
                          rows={3}
                        />
                      </div>
                      <Button className="w-full">
                        <Zap className="w-4 h-4 mr-2" />
                        Generate Recommendations
                      </Button>
                    </div>

                    <div className="space-y-4 p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold">Top Recommendations</h3>
                      <div className="space-y-4">
                        {[
                          { name: "Funke Akindele", score: 92, experience: "15+ years", location: "Lagos" },
                          { name: "Richard Mofe-Damijo", score: 88, experience: "30+ years", location: "Lagos" },
                          { name: "Genevieve Nnaji", score: 85, experience: "20+ years", location: "Abuja" }
                        ].map((candidate, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{candidate.name}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{candidate.experience}</span>
                                <span>•</span>
                                <span>{candidate.location}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{candidate.score}</span>
                              </div>
                              <Button size="sm">View</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="scheduling" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Schedule Optimization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="project-name">Project Name</Label>
                        <Input id="project-name" placeholder="e.g., Love in Lagos" />
                      </div>
                      <div>
                        <Label htmlFor="constraints">Constraints</Label>
                        <Textarea 
                          id="constraints" 
                          placeholder="e.g., Max 20 shooting days, crew availability, location restrictions" 
                          rows={3}
                        />
                      </div>
                      <Button className="w-full">
                        <Zap className="w-4 h-4 mr-2" />
                        Optimize Schedule
                      </Button>
                    </div>

                    <div className="space-y-4 p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold">Optimized Schedule</h3>
                      <div className="space-y-3">
                        {[
                          { day: 1, scenes: "SCN-1, SCN-2", location: "Studio A", duration: "8 hours" },
                          { day: 2, scenes: "SCN-3, SCN-4", location: "City Street", duration: "10 hours" },
                          { day: 3, scenes: "SCN-5", location: "Apartment", duration: "6 hours" }
                        ].map((day, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">Day {day.day}</p>
                              <p className="text-sm text-muted-foreground">{day.scenes}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">{day.location}</p>
                              <p className="text-xs text-muted-foreground">{day.duration}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 flex justify-between items-center">
                        <span className="text-sm font-medium">Total Duration: 18 days</span>
                        <Button size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="marketing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Marketing Content Generator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="project-title">Project Title</Label>
                        <Input id="project-title" placeholder="e.g., Love in Lagos" />
                      </div>
                      <div>
                        <Label htmlFor="genre">Genre</Label>
                        <Input id="genre" placeholder="e.g., Romantic Drama" />
                      </div>
                      <div>
                        <Label htmlFor="synopsis">Synopsis</Label>
                        <Textarea 
                          id="synopsis" 
                          placeholder="Brief description of your project" 
                          rows={4}
                        />
                      </div>
                      <Button className="w-full">
                        <Zap className="w-4 h-4 mr-2" />
                        Generate Marketing Content
                      </Button>
                    </div>

                    <div className="space-y-4 p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold">Generated Content</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium">Tagline</p>
                          <p className="text-muted-foreground">Love finds its way in the city that never sleeps</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Social Media Posts</p>
                          <div className="space-y-2 mt-1">
                            <p className="text-sm text-muted-foreground">"A love story that will make you believe in second chances. Coming soon to theaters near you! #LoveInLagos #Nollywood"</p>
                            <p className="text-sm text-muted-foreground">"Behind every great love story is a great team. Meet the cast and crew of #LoveInLagos"</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Trailer Hook</p>
                          <p className="text-muted-foreground">"She thought she had it all figured out. He thought he was over her. But Lagos had other plans..."</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 sm:space-y-8">
            {/* AI Tools Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  AI Tools Suite
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiTools.map((tool) => (
                  <div 
                    key={tool.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      activeTab === tool.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                    }`}
                    onClick={() => setActiveTab(tool.id)}
                  >
                    <div className="flex items-start gap-3">
                      <tool.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-sm">{tool.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Advanced AI algorithms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Bias detection and fairness</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Real-time processing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Customizable parameters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Exportable results</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Usage Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">For Best Results</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Provide detailed information for more accurate AI analysis and recommendations.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Privacy Notice</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      All data is processed securely and never shared with third parties.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Need Help?</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Contact our support team for assistance with AI tools.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ResponsiveSection>
    </div>
  );
}