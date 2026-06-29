import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Film, Loader2, CheckCircle, XCircle, Users } from "lucide-react";

export default function AcceptInvitation() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const token = params?.token;

  useEffect(() => {
    if (!isAuthenticated) {
      // Store token and redirect to login
      localStorage.setItem('pending_invitation', token || '');
      setLocation('/login');
      return;
    }
    if (token && profile) {
      acceptInvitation();
    }
  }, [token, isAuthenticated, profile]);

  async function acceptInvitation() {
    setAccepting(true);
    try {
      const data = await apiFetch(`/invitations/${token}/accept`, { method: 'POST' });
      setResult(data);
      toast({ title: "Welcome to the project!" });
      localStorage.removeItem('pending_invitation');
    } catch (e: any) {
      setError(e.message || "Failed to accept invitation");
    }
    setAccepting(false);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="max-w-md mx-auto px-4 py-20">
        <Card>
          <CardContent className="pt-6 text-center">
            {loading && !error && (
              <>
                <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
                <h2 className="text-xl font-bold mb-2">Accepting Invitation...</h2>
                <p className="text-muted-foreground">Please wait while we process your invitation.</p>
              </>
            )}

            {accepting && (
              <>
                <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
                <h2 className="text-xl font-bold mb-2">Joining Project...</h2>
              </>
            )}

            {result && (
              <>
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">You're In!</h2>
                <p className="text-muted-foreground mb-6">{result.message}</p>
                <Button onClick={() => setLocation('/projects')}>
                  <Film className="w-4 h-4 mr-2" /> Go to Projects
                </Button>
              </>
            )}

            {error && (
              <>
                <XCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
                <h2 className="text-xl font-bold mb-2">Invitation Error</h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button variant="outline" onClick={() => setLocation('/')}>
                  Go Home
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
