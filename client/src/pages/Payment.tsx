import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, CreditCard, Shield, ArrowLeft, Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const PLANS = [
  { id: "free", name: "Free", price: 0, features: ["Basic profile", "5 job applications/month", "Messaging"] },
  { id: "pro", name: "Pro", price: 5000, features: ["Unlimited applications", "Priority in search", "Analytics", "Verified badge"] },
  { id: "studio", name: "Studio", price: 25000, features: ["Everything in Pro", "Team management", "API access", "Custom branding", "Priority support"] },
];

export default function Payment() {
  const [, setLocation] = useLocation();
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [loading, setLoading] = useState(false);

  const plan = PLANS.find(p => p.id === selectedPlan);

  async function handlePayment() {
    if (!profile || !plan || plan.price === 0) {
      toast({ title: "Selected plan is free!" });
      return;
    }

    setLoading(true);
    // In production, this would call Paystack API
    // For now, show demo toast
    toast({ title: "Payment demo", description: "Connect Paystack to enable real payments." });
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <PageHeader title="Upgrade Your Plan" description="Get more features and visibility" />

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {PLANS.map((p) => (
            <Card key={p.id} className={`cursor-pointer transition-all ${selectedPlan === p.id ? "border-primary shadow-md" : ""}`}
              onClick={() => setSelectedPlan(p.id)}>
              <CardHeader className="text-center">
                <CardTitle>{p.name}</CardTitle>
                <CardDescription>
                  {p.price === 0 ? "Free" : `₦${p.price.toLocaleString()}/month`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {f}
                    </li>
                  ))}
                </ul>
                {selectedPlan === p.id && (
                  <Badge className="mt-4 w-full justify-center">Selected</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {plan && plan.price > 0 && (
          <Card className="mt-6 max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <p className="text-2xl font-bold">₦{plan.price.toLocaleString()}<span className="text-sm font-normal">/mo</span></p>
                <p className="text-muted-foreground">{plan.name} Plan</p>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Email (for receipt)</Label>
                  <Input type="email" value={profile?.email || ""} disabled />
                </div>
                <Button onClick={handlePayment} className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
                  Pay with Paystack
                </Button>
                <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" /> Secure payment via Paystack
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
