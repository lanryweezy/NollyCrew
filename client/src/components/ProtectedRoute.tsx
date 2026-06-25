import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

// Demo mode: all routes are accessible without auth
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <>{children}</>;
}
