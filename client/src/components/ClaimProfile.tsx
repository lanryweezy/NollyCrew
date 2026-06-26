import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, Loader2, Search, MapPin, Film } from "lucide-react";

interface ClaimProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ClaimProfile({ open, onOpenChange }: ClaimProfileProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<"search" | "verify" | "done">("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState("email");
  const [verificationData, setVerificationData] = useState("");

  async function searchProfiles() {
    if (!searchTerm || searchTerm.length < 2) return;
    setLoading(true);
    if (isSupabaseConfigured()) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("claim_status", "unclaimed")
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
        .limit(10);
      setResults(data || []);
    }
    setLoading(false);
  }

  async function handleClaim() {
    if (!profile || !selectedProfile) return;
    setLoading(true);

    if (isSupabaseConfigured()) {
      // Create claim request
      const { error } = await supabase.from("claim_requests").insert({
        profile_id: selectedProfile.id,
        user_id: profile.id,
        verification_method: verificationMethod,
        verification_data: { [verificationMethod]: verificationData },
      });

      if (error) {
        if (error.message.includes("unique")) {
          toast({ title: "Already claimed", description: "You've already submitted a claim for this profile.", variant: "destructive" });
        } else {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        }
      } else {
        setStep("done");
        toast({ title: "Claim submitted!", description: "We'll review your claim within 24 hours." });
      }
    } else {
      setStep("done");
      toast({ title: "Claim submitted! (Demo)" });
    }
    setLoading(false);
  }

  function reset() {
    setStep("search");
    setSearchTerm("");
    setResults([]);
    setSelectedProfile(null);
    setVerificationData("");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-lg">
        {step === "search" && (
          <>
            <DialogHeader>
              <DialogTitle>Claim Your Profile</DialogTitle>
              <DialogDescription>Find your pre-existing profile and claim it as yours</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search your name..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchProfiles()}
                  />
                </div>
                <Button onClick={searchProfiles} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                </Button>
              </div>
              {results.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {results.map((p) => (
                    <div
                      key={p.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedProfile?.id === p.id ? "border-primary bg-primary/5" : "hover:bg-muted"}`}
                      onClick={() => { setSelectedProfile(p); setStep("verify"); }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">{p.first_name?.[0]}{p.last_name?.[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium">{p.first_name} {p.last_name}</p>
                          {p.location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.location}</p>}
                          {p.known_works && p.known_works.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {(typeof p.known_works === 'string' ? JSON.parse(p.known_works) : p.known_works).slice(0, 2).map((w: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs"><Film className="w-2 h-2 mr-1" />{w}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {searchTerm.length >= 2 && results.length === 0 && !loading && (
                <p className="text-center text-muted-foreground py-4">No unclaimed profiles found. <a href="/register" className="text-primary hover:underline">Create a new profile instead.</a></p>
              )}
            </div>
          </>
        )}

        {step === "verify" && selectedProfile && (
          <>
            <DialogHeader>
              <DialogTitle>Verify: {selectedProfile.first_name} {selectedProfile.last_name}</DialogTitle>
              <DialogDescription>Choose how you'd like to verify this is your profile</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">You're claiming the profile for <strong>{selectedProfile.first_name} {selectedProfile.last_name}</strong></p>
              </div>
              <div className="space-y-2">
                <Label>Verification Method</Label>
                <Select value={verificationMethod} onValueChange={setVerificationMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email (industry email preferred)</SelectItem>
                    <SelectItem value="phone">Phone number</SelectItem>
                    <SelectItem value="reference">Industry reference</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{verificationMethod === "email" ? "Your email" : verificationMethod === "phone" ? "Your phone" : "Reference name + contact"}</Label>
                <Input
                  placeholder={verificationMethod === "email" ? "you@studio.com" : verificationMethod === "phone" ? "+234..." : "Producer name + phone"}
                  value={verificationData}
                  onChange={(e) => setVerificationData(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("search")}>Back</Button>
                <Button onClick={handleClaim} className="flex-1" disabled={loading || !verificationData}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserCheck className="w-4 h-4 mr-2" />}
                  Submit Claim
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "done" && (
          <>
            <DialogHeader>
              <DialogTitle>Claim Submitted!</DialogTitle>
              <DialogDescription>We'll review your claim and verify your identity within 24 hours.</DialogDescription>
            </DialogHeader>
            <div className="text-center py-4">
              <UserCheck className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <p className="text-muted-foreground">You'll receive an email once your profile is verified. Then you can edit your bio, add credits, and connect with the industry.</p>
            </div>
            <Button onClick={() => onOpenChange(false)} className="w-full">Done</Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
