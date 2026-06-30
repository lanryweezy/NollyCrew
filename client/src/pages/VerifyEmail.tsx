import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { apiFetch } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Film } from "lucide-react";

export default function VerifyEmail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const token = params?.token;

  useEffect(() => {
    if (token) verifyEmail();
  }, [token]);

  async function verifyEmail() {
    try {
      await apiFetch('/auth/verify', { method: 'POST', body: JSON.stringify({ token }) });
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || "Verification failed");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Film className="w-6 h-6 text-primary" />
          </div>
          {loading ? (
            <><Loader2 className="w-8 h-8 mx-auto animate-spin mb-4" /><p>Verifying your email...</p></>
          ) : success ? (
            <><CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" /><h2 className="text-xl font-bold mb-2">Email Verified!</h2><p className="text-muted-foreground mb-6">Your email has been verified. You now have a verified badge.</p><Button onClick={() => setLocation("/profile")}>Go to Profile</Button></>
          ) : (
            <><XCircle className="w-12 h-12 mx-auto text-destructive mb-4" /><h2 className="text-xl font-bold mb-2">Verification Failed</h2><p className="text-muted-foreground mb-6">{error}</p><Button variant="outline" onClick={() => setLocation("/")}>Go Home</Button></>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
