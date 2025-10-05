import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "@/components/LandingPage";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Payment from "@/pages/Payment";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentError from "@/pages/PaymentError";
import Dashboard from "@/pages/Dashboard";
import Onboarding from "@/pages/Onboarding";
import Jobs from "@/pages/Jobs";
import Projects from "@/pages/Projects";
import Profile from "@/pages/Profile";
import ProtectedRoute from "@/components/ProtectedRoute";
import TalentSearch from "@/pages/TalentSearch";
import Messages from "@/pages/Messages";
import Auditions from "@/pages/Auditions";
import TalentProfile from "@/pages/TalentProfile";
import TestProxy from "./test-proxy";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/test-proxy" component={TestProxy} />
      <Route path="/payment" component={Payment} />
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/payment/error" component={PaymentError} />
      
      {/* Protected Routes */}
      <Route path="/onboarding">
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/jobs">
        <ProtectedRoute>
          <Jobs />
        </ProtectedRoute>
      </Route>
      <Route path="/talent">
        <ProtectedRoute>
          <TalentSearch />
        </ProtectedRoute>
      </Route>
      <Route path="/messages">
        <ProtectedRoute>
          <Messages />
        </ProtectedRoute>
      </Route>
      <Route path="/auditions">
        <ProtectedRoute>
          <Auditions />
        </ProtectedRoute>
      </Route>
      <Route path="/talent/:userId">
        <ProtectedRoute>
          <TalentProfile />
        </ProtectedRoute>
      </Route>
      <Route path="/projects">
        <ProtectedRoute>
          <Projects />
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;