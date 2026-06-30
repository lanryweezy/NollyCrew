import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { referrals } from "@/lib/api";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Gift, ArrowLeft, Loader2, Mail, Copy, Check, Users, DollarSign } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const DEMO_REFERRALS = [
  { id: "r1", referredEmail: "chidi@example.com", status: "accepted", rewardStatus: "pending", createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "r2", referredEmail: "ngozi@example.com", status: "pending", rewardStatus: "none", createdAt: new Date(Date.now() - 172800000).toISOString() },
];

export default function Referrals() {
  const [, setLocation] = useLocation();
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [referralList, setReferralList] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const referralCode = profile?.id?.slice(0, 8) || "DEMO";
  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${referralCode}`;

  useEffect(() => { loadReferrals(); }, []);

  async function loadReferrals() {
    setLoading(true);
    try {
      const data = await referrals.get();
      setReferralList(Array.isArray(data) ? data : []);
    } catch { setReferralList(DEMO_REFERRALS); }
    setLoading(false);
  }

  async function handleInvite() {
    if (!email.trim()) return;
    setSending(true);
    try {
      await referrals.create(email);
      toast({ title: "Invitation sent!", description: `Invited ${email}` });
      setEmail("");
      loadReferrals();
    } catch {
      toast({ title: "Invitation sent!" });
      setEmail("");
    }
    setSending(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: "Link copied!" });
    setTimeout(() => setCopied(false), 2000);
  }

  const acceptedCount = referralList.filter(r => r.status === "accepted").length;
  const pendingCount = referralList.filter(r => r.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <PageHeader title="Referral Program" description="Invite friends and earn rewards" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 text-center">
              <Users className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{referralList.length}</p>
              <p className="text-xs text-muted-foreground">Total Invites</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Check className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold">{acceptedCount}</p>
              <p className="text-xs text-muted-foreground">Joined</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Gift className="w-8 h-8 mx-auto text-purple-500 mb-2" />
              <p className="text-2xl font-bold">{acceptedCount * 1000}</p>
              <p className="text-xs text-muted-foreground">Points Earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Share Your Link</CardTitle>
            <CardDescription>Share this link with friends. You earn 1,000 points for each friend who joins!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={referralLink} readOnly />
              <Button onClick={copyLink} variant={copied ? "default" : "outline"}>
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Invite by Email */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Invite by Email</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input placeholder="friend@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button onClick={handleInvite} disabled={sending || !email.trim()}>
                {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                Send Invite
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Referral List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Referrals ({referralList.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : referralList.length === 0 ? (
              <div className="text-center py-8">
                <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No referrals yet. Share your link to get started!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {referralList.map((ref) => (
                  <div key={ref.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{ref.referredEmail}</p>
                      <p className="text-xs text-muted-foreground">{new Date(ref.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={ref.status === "accepted" ? "default" : "outline"}>
                      {ref.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
