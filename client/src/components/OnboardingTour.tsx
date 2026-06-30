import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Film, Briefcase, Users, Brain, ArrowRight, X } from "lucide-react";

const STEPS = [
  { icon: Film, title: "Welcome to NollyCrew", description: "The all-in-one platform for Nollywood professionals. Connect, collaborate, and create.", color: "text-blue-500" },
  { icon: Briefcase, title: "Find & Post Jobs", description: "Browse casting calls and crew positions, or post your own jobs to find the perfect talent.", color: "text-green-500" },
  { icon: Brain, title: "AI-Powered Tools", description: "Use AI for script breakdown, casting recommendations, schedule optimization, and more.", color: "text-purple-500" },
];

export default function OnboardingTour() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("nollycrew_tour_seen");
    if (!hasSeenTour) {
      setTimeout(() => setShow(true), 1000);
    }
  }, []);

  function dismiss() {
    localStorage.setItem("nollycrew_tour_seen", "true");
    setShow(false);
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      dismiss();
      setLocation("/dashboard");
    }
  }

  if (!show) return null;

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <Card className="w-full max-w-md relative">
        <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={dismiss}>
          <X className="w-4 h-4" />
        </Button>
        <CardContent className="pt-8 pb-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Icon className={`w-8 h-8 ${current.color}`} />
          </div>
          <h2 className="text-xl font-bold mb-2">{current.title}</h2>
          <p className="text-sm text-muted-foreground mb-6">{current.description}</p>
          <div className="flex justify-center gap-2 mb-4">
            {STEPS.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i === step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={dismiss}>Skip</Button>
            <Button className="flex-1" onClick={next}>
              {step < STEPS.length - 1 ? "Next" : "Get Started"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
