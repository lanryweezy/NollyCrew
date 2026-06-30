import { lazy, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ResponsiveToastProvider } from "@/components/ResponsiveToast";
import OnboardingTour from "@/components/OnboardingTour";

// Lazy loaded pages
const LandingPage = lazy(() => import("@/components/LandingPage"));
const NotFound = lazy(() => import("@/pages/not-found"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const Settings = lazy(() => import("@/pages/Settings"));
const PublicProfile = lazy(() => import("@/pages/PublicProfile"));
const Bookmarks = lazy(() => import("@/pages/Bookmarks"));
const Applications = lazy(() => import("@/pages/Applications"));
const Referrals = lazy(() => import("@/pages/Referrals"));
const Payment = lazy(() => import("@/pages/Payment"));
const PaymentSuccess = lazy(() => import("@/pages/PaymentSuccess"));
const PaymentError = lazy(() => import("@/pages/PaymentError"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Jobs = lazy(() => import("@/pages/Jobs"));
const Projects = lazy(() => import("@/pages/Projects"));
const Profile = lazy(() => import("@/pages/Profile"));
const TalentSearch = lazy(() => import("@/pages/TalentSearch"));
const Messages = lazy(() => import("@/pages/Messages"));
const Auditions = lazy(() => import("@/pages/Auditions"));
const TalentProfile = lazy(() => import("@/pages/TalentProfile"));
const AITools = lazy(() => import("@/pages/AITools"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Calendar = lazy(() => import("@/pages/Calendar"));
const Collaboration = lazy(() => import("@/pages/Collaboration"));
const EnhancedAnalytics = lazy(() => import("@/pages/EnhancedAnalytics"));
const EnhancedCollaboration = lazy(() => import("@/pages/EnhancedCollaboration"));
const BossDashboard = lazy(() => import("@/pages/BossDashboard"));
const PostJob = lazy(() => import("@/pages/jobs/New"));
const ProjectDetail = lazy(() => import("@/pages/ProjectDetail"));
const JobDetail = lazy(() => import("@/pages/JobDetail"));
const JobApplications = lazy(() => import("@/pages/JobApplications"));
const AcceptInvitation = lazy(() => import("@/pages/AcceptInvitation"));
const KYC = lazy(() => import("@/pages/KYC"));
const SubscriptionsPage = lazy(() => import("@/pages/Subscriptions"));
const Support = lazy(() => import("@/pages/Support"));
const DailyProgressReport = lazy(() => import("@/pages/DailyProgressReport"));
const CallSheetsPage = lazy(() => import("@/pages/CallSheets"));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

function Router() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Switch>
            <Route path="/" component={LandingPage} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/reset-password/:token" component={ResetPassword} />
            <Route path="/verify-email/:token" component={VerifyEmail} />
            <Route path="/test-proxy" component={() => <div />} />
            <Route path="/payment" component={Payment} />
            <Route path="/payment/success" component={PaymentSuccess} />
            <Route path="/payment/error" component={PaymentError} />
            <Route path="/invitations/:token" component={AcceptInvitation} />
            <Route path="/u/:userId" component={PublicProfile} />

            {/* Protected Routes */}
            <Route path="/onboarding">
              <ProtectedRoute><Onboarding /></ProtectedRoute>
            </Route>
            <Route path="/dashboard">
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            </Route>
            <Route path="/jobs">
              <ProtectedRoute><Jobs /></ProtectedRoute>
            </Route>
            <Route path="/jobs/new">
              <ProtectedRoute><PostJob /></ProtectedRoute>
            </Route>
            <Route path="/jobs/:jobId/applications">
              <ProtectedRoute><JobApplications /></ProtectedRoute>
            </Route>
            <Route path="/jobs/:id">
              <ProtectedRoute><JobDetail /></ProtectedRoute>
            </Route>
            <Route path="/talent">
              <ProtectedRoute><TalentSearch /></ProtectedRoute>
            </Route>
            <Route path="/talent/:userId">
              <ProtectedRoute><TalentProfile /></ProtectedRoute>
            </Route>
            <Route path="/messages">
              <ProtectedRoute><Messages /></ProtectedRoute>
            </Route>
            <Route path="/auditions">
              <ProtectedRoute><Auditions /></ProtectedRoute>
            </Route>
            <Route path="/projects">
              <ProtectedRoute><Projects /></ProtectedRoute>
            </Route>
            <Route path="/projects/:id">
              <ProtectedRoute><ProjectDetail /></ProtectedRoute>
            </Route>
            <Route path="/profile">
              <ProtectedRoute><Profile /></ProtectedRoute>
            </Route>
            <Route path="/settings">
              <ProtectedRoute><Settings /></ProtectedRoute>
            </Route>
            <Route path="/kyc">
              <ProtectedRoute><KYC /></ProtectedRoute>
            </Route>
            <Route path="/subscriptions">
              <ProtectedRoute><SubscriptionsPage /></ProtectedRoute>
            </Route>
            <Route path="/support">
              <ProtectedRoute><Support /></ProtectedRoute>
            </Route>
            <Route path="/dpr">
              <ProtectedRoute><DailyProgressReport /></ProtectedRoute>
            </Route>
            <Route path="/call-sheets">
              <ProtectedRoute><CallSheetsPage /></ProtectedRoute>
            </Route>
            <Route path="/ai-tools">
              <ProtectedRoute><AITools /></ProtectedRoute>
            </Route>
            <Route path="/analytics">
              <ProtectedRoute><Analytics /></ProtectedRoute>
            </Route>
            <Route path="/calendar">
              <ProtectedRoute><Calendar /></ProtectedRoute>
            </Route>
            <Route path="/collaboration">
              <ProtectedRoute><Collaboration /></ProtectedRoute>
            </Route>
            <Route path="/enhanced-analytics">
              <ProtectedRoute><EnhancedAnalytics /></ProtectedRoute>
            </Route>
            <Route path="/enhanced-collaboration">
              <ProtectedRoute><EnhancedCollaboration /></ProtectedRoute>
            </Route>
            <Route path="/boss">
              <ProtectedRoute><BossDashboard /></ProtectedRoute>
            </Route>
            <Route path="/bookmarks">
              <ProtectedRoute><Bookmarks /></ProtectedRoute>
            </Route>
            <Route path="/applications">
              <ProtectedRoute><Applications /></ProtectedRoute>
            </Route>
            <Route path="/referrals">
              <ProtectedRoute><Referrals /></ProtectedRoute>
            </Route>

            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <ResponsiveToastProvider />
          <OnboardingTour />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
