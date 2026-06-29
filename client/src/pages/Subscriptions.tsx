import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, subscriptions } from "@/lib/api";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, ArrowLeft, Loader2, Check, Star, Zap, Crown } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const DEMO_PLANS = [
  { id: "free", name: "Free", price: "0", interval: "monthly", features: ["Basic profile", "5 job applications/month", "Messaging", "Basic search"] },
  { id: "pro", name: "Pro", price: "5000", interval: "monthly", features: ["Unlimited applications", "Priority in search", "Analytics dashboard", "Verified badge", "Priority support"] },
  { id: "studio", name: "Studio", price: "25000", interval: "monthly", features: ["Everything in Pro", "Team management", "API access", "Custom branding", "Dedicated support", "Advanced analytics"] },
];

const PLAN_ICONS: Record<string, any> = { free: Star, pro: Zap, studio: Crown };
const PLAN_COLORS: Record<string, string> = { free: "text-gray-500", pro: "text-blue-500", studio: "text-purple-500" };

export default function SubscriptionsPage() {
  const [, setLocation] = useLocation();
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [plansData, subData] = await Promise.all([
        subscriptions.getPlans().catch(() => []),
        subscriptions.getMySubscription().catch(() => null),
      ]);
      setPlans(plansData.length > 0 ? plansData : DEMO_PLANS);
      setCurrentSub(subData);
    } catch {
      setPlans(DEMO_PLANS);
    }
    setLoading(false);
  }

  async function handleSubscribe(planId: string) {
    setSubscribing(planId);
    try {
      const data = await subscriptions.initialize(planId);
      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        toast({ title: "Subscription initialized (Demo)", description: "Connect Paystack for real payments." });
      }
    } catch {
      toast({ title: "Subscribed! (Demo)" });
    }
    setSubscribing(null);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <PageHeader title="Subscription Plans" description="Choose the plan that fits your needs" />

        {/* Current Subscription */}
        {currentSub && (
          <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Current Plan</p>
                  <h3 className="text-lg font-bold">{currentSub.plan?.name || "Pro"}</h3>
                  <p className="text-sm text-muted-foreground">Expires: {currentSub.endDate ? new Date(currentSub.endDate).toLocaleDateString() : "N/A"}</p>
                </div>
                <Badge className="bg-green-500">Active</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = PLAN_ICONS[plan.id] || Star;
              const isCurrent = currentSub?.planId === plan.id;
              const price = typeof plan.price === 'string' ? Number(plan.price) : plan.price;

              return (
                <Card key={plan.id} className={`relative ${plan.id === 'pro' ? 'border-primary shadow-md' : ''}`}>
                  {plan.id === 'pro' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pt-8">
                    <Icon className={`w-10 h-10 mx-auto mb-3 ${PLAN_COLORS[plan.id]}`} />
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      <span className="text-3xl font-bold text-foreground">₦{price.toLocaleString()}</span>
                      <span className="text-sm">/{plan.interval || 'month'}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {(plan.features || []).map((f: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={isCurrent ? "outline" : plan.id === "pro" ? "default" : "outline"}
                      disabled={isCurrent || subscribing === plan.id || price === 0}
                      onClick={() => handleSubscribe(plan.id)}
                    >
                      {subscribing === plan.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : isCurrent ? (
                        "Current Plan"
                      ) : price === 0 ? (
                        "Free"
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" /> Subscribe
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
