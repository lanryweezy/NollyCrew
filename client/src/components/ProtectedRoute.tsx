import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Film } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = "/login" 
}: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading, roles } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation(redirectTo);
      return;
    }
    // basic onboarding guardrail: if authenticated but has no roles, send to onboarding
    if (!loading && isAuthenticated && (!roles || roles.length === 0)) {
      setLocation('/onboarding');
    }
  }, [isAuthenticated, loading, roles, setLocation, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Film className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2 w-full">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
