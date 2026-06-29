import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, callSheets } from "@/lib/api";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FileText, ArrowLeft, Loader2, Plus, Calendar, MapPin, Clock, Users, Download } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const DEMO_TEMPLATES = [
  { id: "standard", name: "Standard Call Sheet", description: "Basic call sheet with cast, crew, and schedule" },
  { id: "detailed", name: "Detailed Call Sheet", description: "Full call sheet with scene breakdown and notes" },
  { id: "minimal", name: "Minimal Call Sheet", description: "Quick call sheet for small shoots" },
];

export default function CallSheetsPage() {
  const [, setLocation] = useLocation();
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<any[]>([]);
  const [showGenerate, setShowGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("standard");
  const [form, setForm] = useState({
    projectName: "", callTime: "06:00", lunchTime: "12:00", wrapTime: "18:00",
    location: "", date: new Date().toISOString().split("T")[0],
    generalNotes: "",
  });
  const [generatedHTML, setGeneratedHTML] = useState("");

  useEffect(() => { loadTemplates(); }, []);

  async function loadTemplates() {
    setLoading(true);
    try {
      const data = await callSheets.getTemplates();
      setTemplates(data.length > 0 ? data : DEMO_TEMPLATES);
    } catch {
      setTemplates(DEMO_TEMPLATES);
    }
    setLoading(false);
  }

  async function handleGenerate() {
    if (!form.projectName.trim()) return;
    setGenerating(true);
    try {
      const data = await callSheets.generate(selectedTemplate, {
        projectName: form.projectName,
        date: form.date,
        callTime: form.callTime,
        lunchTime: form.lunchTime,
        wrapTime: form.wrapTime,
        location: form.location,
        generalNotes: form.generalNotes,
        cast: [], crew: [], scenes: [],
      });
      if (data?.html) {
        setGeneratedHTML(data.html);
        toast({ title: "Call sheet generated!" });
      } else {
        toast({ title: "Generated (Demo)" });
        setGeneratedHTML(`<h1>${form.projectName}</h1><p>Date: ${form.date}</p><p>Call Time: ${form.callTime}</p>`);
      }
    } catch {
      toast({ title: "Generated (Demo)" });
      setGeneratedHTML(`<h1>${form.projectName}</h1><p>Date: ${form.date}</p><p>Call Time: ${form.callTime}</p>`);
    }
    setGenerating(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => setLocation("/projects")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <PageHeader
          title="Call Sheets"
          description="Generate and share call sheets with your team"
          actions={
            <Button onClick={() => setShowGenerate(true)}>
              <Plus className="w-4 h-4 mr-2" /> Generate Call Sheet
            </Button>
          }
        />

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => { setSelectedTemplate(template.id); setShowGenerate(true); }}>
                <CardContent className="pt-6 text-center">
                  <FileText className="w-10 h-10 mx-auto text-primary mb-3" />
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Generated Preview */}
        {generatedHTML && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Call Sheet</CardTitle>
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(generatedHTML); toast({ title: "Copied!" }); }}>
                  <Download className="w-3 h-3 mr-1" /> Copy HTML
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-white" dangerouslySetInnerHTML={{ __html: generatedHTML }} />
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={showGenerate} onOpenChange={setShowGenerate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate Call Sheet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Project Name *</Label>
              <Input placeholder="e.g. Lagos Blues 2" value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="e.g. Filmhouse Cinema" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Call Time</Label>
                <Input type="time" value={form.callTime} onChange={(e) => setForm({ ...form, callTime: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Lunch</Label>
                <Input type="time" value={form.lunchTime} onChange={(e) => setForm({ ...form, lunchTime: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Wrap</Label>
                <Input type="time" value={form.wrapTime} onChange={(e) => setForm({ ...form, wrapTime: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>General Notes</Label>
              <Textarea placeholder="Any special instructions..." rows={2} value={form.generalNotes} onChange={(e) => setForm({ ...form, generalNotes: e.target.value })} />
            </div>
            <Button onClick={handleGenerate} className="w-full" disabled={generating || !form.projectName.trim()}>
              {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
              Generate Call Sheet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
