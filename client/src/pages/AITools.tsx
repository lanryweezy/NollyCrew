import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Brain, Film, Users, FileText, Loader2, Sparkles, Upload } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const AI_TOOLS = [
  { id: "script", title: "Script Breakdown", description: "Analyze a script to extract scenes, characters, props, and locations", icon: FileText, color: "text-blue-500" },
  { id: "casting", title: "Casting Recommendations", description: "Get AI-powered casting suggestions based on role requirements", icon: Users, color: "text-green-500" },
  { id: "schedule", title: "Schedule Optimizer", description: "Optimize shooting schedules based on locations and availability", icon: Brain, color: "text-purple-500" },
  { id: "marketing", title: "Marketing Content", description": "Generate social media posts, posters, and trailers for your project", icon: Sparkles, color: "text-yellow-500" },
];

const DEMO_BREAKDOWN = {
  scenes: 12,
  characters: 8,
  locations: 5,
  props: 23,
  estimated_days: 15,
  estimated_crew: 25,
  summary: "This is a drama-thriller set in Lagos with 12 scenes across 5 locations. Key characters include the lead detective, a suspect, and a witness. Estimated 15-day shoot with 25 crew members."
};

export default function AITools() {
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [scriptText, setScriptText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function runAnalysis() {
    if (!scriptText.trim()) return;
    setLoading(true);
    setResult(null);

    // Demo mode - simulate analysis
    await new Promise(r => setTimeout(r, 2000));
    setResult(DEMO_BREAKDOWN);
    toast({ title: "Analysis complete! (Demo)", description: "Connect OpenAI API for real analysis." });
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="AI Tools" description="AI-powered production tools" />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {AI_TOOLS.map((tool) => (
            <Card key={tool.id} className={`cursor-pointer transition-all hover:shadow-md ${activeTool === tool.id ? "border-primary" : ""}`}
              onClick={() => { setActiveTool(tool.id); setResult(null); setScriptText(""); }}>
              <CardContent className="pt-6 text-center">
                <tool.icon className={`w-10 h-10 mx-auto mb-3 ${tool.color}`} />
                <h3 className="font-semibold">{tool.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {activeTool && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>{AI_TOOLS.find(t => t.id === activeTool)?.title}</CardTitle>
              <CardDescription>
                {activeTool === "script" && "Paste your script below for AI analysis"}
                {activeTool === "casting" && "Describe your roles for casting suggestions"}
                {activeTool === "schedule" && "Describe your production constraints"}
                {activeTool === "marketing" && "Describe your project for marketing content"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={
                  activeTool === "script" ? "Paste your script or scene description here..." :
                  activeTool === "casting" ? "Describe the roles you need to cast..." :
                  activeTool === "schedule" ? "Describe your shooting schedule constraints..." :
                  "Describe your project for marketing content..."
                }
                rows={6}
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
              />
              <Button onClick={runAnalysis} className="w-full" disabled={loading || !scriptText.trim()}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
                {loading ? "Analyzing..." : "Run Analysis"}
              </Button>

              {result && (
                <div className="mt-6 p-4 bg-muted rounded-lg space-y-3">
                  <h4 className="font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4" /> Analysis Results</h4>
                  {activeTool === "script" && (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-background rounded"><p className="text-2xl font-bold">{result.scenes}</p><p className="text-xs">Scenes</p></div>
                      <div className="text-center p-3 bg-background rounded"><p className="text-2xl font-bold">{result.characters}</p><p className="text-xs">Characters</p></div>
                      <div className="text-center p-3 bg-background rounded"><p className="text-2xl font-bold">{result.locations}</p><p className="text-xs">Locations</p></div>
                      <div className="text-center p-3 bg-background rounded"><p className="text-2xl font-bold">{result.props}</p><p className="text-xs">Props</p></div>
                      <div className="text-center p-3 bg-background rounded"><p className="text-2xl font-bold">{result.estimated_days}d</p><p className="text-xs">Est. Days</p></div>
                      <div className="text-center p-3 bg-background rounded"><p className="text-2xl font-bold">{result.estimated_crew}</p><p className="text-xs">Crew Needed</p></div>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">{result.summary}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
