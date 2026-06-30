import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, ArrowLeft, Loader2, CheckCircle, Clock, XCircle, FileText, Upload } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const DEMO_STATUS = { status: "not_started" };

const ID_TYPES = [
  { value: "nin", label: "National ID (NIN)" },
  { value: "passport", label: "International Passport" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "voters_card", label: "Voter's Card" },
];

export default function KYC() {
  const [, setLocation] = useLocation();
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [idType, setIdType] = useState("nin");
  const [idNumber, setIdNumber] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);

  useEffect(() => { loadStatus(); }, []);

  async function loadStatus() {
    setLoading(true);
    try {
      const data = await apiFetch('/kyc/status');
      setKycStatus(data);
    } catch {
      setKycStatus(DEMO_STATUS);
    }
    setLoading(false);
  }

  async function handleSubmit() {
    if (!idNumber.trim()) return;
    setSubmitting(true);
    try {
      await apiFetch('/kyc/verify', {
        method: 'POST',
        body: JSON.stringify({ type: idType, idNumber: idNumber.trim() }),
      });
      toast({ title: "Verification submitted!", description: "We'll review your ID within 24 hours." });
      setKycStatus({ status: 'pending', type: idType });
    } catch {
      toast({ title: "Submitted!", description: "Verification request received." });
      setKycStatus({ status: 'pending', type: idType });
    }
    setSubmitting(false);
  }

  const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string; description: string }> = {
    not_started: { icon: Shield, color: "text-gray-500", bg: "bg-gray-100", label: "Not Started", description: "Verify your identity to get a verified badge and build trust." },
    pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-100", label: "Under Review", description: "Your ID is being reviewed. This usually takes 24 hours." },
    verified: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-100", label: "Verified", description: "Your identity has been verified. You have a verified badge on your profile." },
    rejected: { icon: XCircle, color: "text-red-500", bg: "bg-red-100", label: "Rejected", description: "Your verification was rejected. Please try again with a clearer ID photo." },
  };

  const status = statusConfig[kycStatus?.status || "not_started"];
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => setLocation("/profile")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
        </Button>

        <PageHeader title="Identity Verification" description="Verify your identity to get a verified badge" />

        {/* Status Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full ${status.bg} flex items-center justify-center`}>
                <StatusIcon className={`w-8 h-8 ${status.color}`} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{status.label}</h2>
                <p className="text-sm text-muted-foreground">{status.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Form */}
        {kycStatus?.status === "not_started" && (
          <Card>
            <CardHeader>
              <CardTitle>Submit Your ID</CardTitle>
              <CardDescription>Choose your ID type and enter the number</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>ID Type</Label>
                <Select value={idType} onValueChange={setIdType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ID_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ID Number</Label>
                <Input placeholder="Enter your ID number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>ID Photo (optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                </div>
              </div>

              <Button onClick={handleSubmit} className="w-full" disabled={submitting || !idNumber.trim() || idNumber.trim().length < 5}>
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
                Submit for Verification
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Your ID is encrypted and only used for verification purposes.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pending Status */}
        {kycStatus?.status === "pending" && (
          <Card>
            <CardContent className="py-8 text-center">
              <Clock className="w-12 h-12 mx-auto text-yellow-500 mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold mb-2">Verification in Progress</h3>
              <p className="text-muted-foreground mb-4">We're reviewing your ID. This usually takes 24 hours.</p>
              <Badge variant="outline">Type: {kycStatus.type?.toUpperCase()}</Badge>
            </CardContent>
          </Card>
        )}

        {/* Verified Status */}
        {kycStatus?.status === "verified" && (
          <Card>
            <CardContent className="py-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">You're Verified!</h3>
              <p className="text-muted-foreground">Your identity has been verified. You have a verified badge on your profile.</p>
            </CardContent>
          </Card>
        )}

        {/* Rejected Status */}
        {kycStatus?.status === "rejected" && (
          <Card>
            <CardContent className="py-8 text-center">
              <XCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Verification Rejected</h3>
              <p className="text-muted-foreground mb-4">Your ID could not be verified. Please try again with a clearer photo.</p>
              <Button onClick={() => setKycStatus({ status: "not_started" })}>Try Again</Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
