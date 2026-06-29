import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { profiles, userRoles } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Film, ArrowRight, Loader2, CheckCircle } from "lucide-react";

const ROLES = [
  { value: "actor", label: "Actor / Actress", description: "I perform in films, TV, and commercials" },
  { value: "crew", label: "Crew Member", description: "I work behind the camera (cinematographer, editor, etc.)" },
  { value: "producer", label: "Producer / Director", description: "I create and manage productions" },
];

const LOCATIONS = ["Lagos", "Abuja", "Port Harcourt", "Enugu", "Ibadan", "Benin City", "Kano", "Accra", "London", "Other"];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    role: "" as "actor" | "crew" | "producer" | "",
    location: "",
    bio: "",
    experience: "",
    skills: "",
    languages: "",
  });

  async function handleComplete() {
    if (!profile) return;
    setLoading(true);

    try {
      await profiles.update(profile.id, {
        bio: form.bio || null,
        location: form.location || null,
      });

      if (form.role) {
        await userRoles.create({
          user_id: profile.id,
          role: form.role,
          experience: form.experience || null,
          skills: form.skills ? form.skills.split(",").map(s => s.trim()) : [],
          languages: form.languages ? form.languages.split(",").map(s => s.trim()) : [],
          specialties: null,
          hourly_rate: null,
          availability: 'available',
          portfolio: [],
          awards: [],
          credits: [],
          is_active: true,
        });
      }

      await refreshProfile();
    } catch {
      // ignore - still proceed
    }

    toast({ title: "Welcome to NollyCrew!", description: "Your profile is set up. Start exploring!" });
    setLocation("/dashboard");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Film className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to NollyCrew</CardTitle>
          <CardDescription>Let's set up your profile in 3 quick steps</CardDescription>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`w-8 h-1.5 rounded-full ${step >= s ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">What are you?</h3>
              {ROLES.map((r) => (
                <div
                  key={r.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${form.role === r.value ? "border-primary bg-primary/5" : "hover:bg-muted"}`}
                  onClick={() => setForm({ ...form, role: r.value as any })}
                >
                  <p className="font-medium">{r.label}</p>
                  <p className="text-sm text-muted-foreground">{r.description}</p>
                </div>
              ))}
              <Button className="w-full" onClick={() => setStep(2)} disabled={!form.role}>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Where are you based?</h3>
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={form.location} onValueChange={v => setForm({ ...form, location: v })}>
                  <SelectTrigger><SelectValue placeholder="Select your city" /></SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bio (optional)</Label>
                <Textarea placeholder="Tell us about yourself..." rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" onClick={() => setStep(3)}>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Your experience</h3>
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select value={form.experience} onValueChange={v => setForm({ ...form, experience: v })}>
                  <SelectTrigger><SelectValue placeholder="How experienced are you?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (3-5 years)</SelectItem>
                    <SelectItem value="experienced">Experienced (6-10 years)</SelectItem>
                    <SelectItem value="veteran">Veteran (10+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Skills (comma separated)</Label>
                <Input placeholder="e.g. Acting, Comedy, Voice Over" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Languages (comma separated)</Label>
                <Input placeholder="e.g. English, Yoruba, Igbo" value={form.languages} onChange={e => setForm({ ...form, languages: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                <Button className="flex-1" onClick={handleComplete} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Complete Setup
                </Button>
              </div>
            </div>
          )}

          <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setLocation("/dashboard")}>
            Skip for now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
