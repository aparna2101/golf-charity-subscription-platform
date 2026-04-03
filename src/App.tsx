import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";
import type { ReactNode } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PlansPage from "./pages/PlansPage";
import CharitiesPage from "./pages/CharitiesPage";
import CharityDetailPage from "./pages/CharityDetailPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import ScoresPage from "./pages/dashboard/ScoresPage";
import DrawsPage from "./pages/dashboard/DrawsPage";
import MyCharityPage from "./pages/dashboard/MyCharityPage";
import PaymentsPage from "./pages/dashboard/PaymentsPage";
import WinnerProofPage from "./pages/dashboard/WinnerProofPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import NotificationsPage from "./pages/dashboard/NotificationsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminSubscriptionsPage from "./pages/admin/AdminSubscriptionsPage";
import AdminScoresPage from "./pages/admin/AdminScoresPage";
import AdminDrawsPage from "./pages/admin/AdminDrawsPage";
import AdminSimulatePage from "./pages/admin/AdminSimulatePage";
import AdminPublishPage from "./pages/admin/AdminPublishPage";
import AdminCharitiesPage from "./pages/admin/AdminCharitiesPage";
import AdminWinnersPage from "./pages/admin/AdminWinnersPage";
import AdminProofsPage from "./pages/admin/AdminProofsPage";
import AdminPayoutsPage from "./pages/admin/AdminPayoutsPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return isAdmin ? children : <Navigate to="/dashboard" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/charities" element={<CharitiesPage />} />
          <Route path="/charities/:id" element={<CharityDetailPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* User Dashboard */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardOverview /></ProtectedRoute>} />
          <Route path="/dashboard/scores" element={<ProtectedRoute><ScoresPage /></ProtectedRoute>} />
          <Route path="/dashboard/draws" element={<ProtectedRoute><DrawsPage /></ProtectedRoute>} />
          <Route path="/dashboard/charity" element={<ProtectedRoute><MyCharityPage /></ProtectedRoute>} />
          <Route path="/dashboard/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
          <Route path="/dashboard/winner" element={<ProtectedRoute><WinnerProofPage /></ProtectedRoute>} />
          <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/dashboard/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/admin/subscriptions" element={<AdminRoute><AdminSubscriptionsPage /></AdminRoute>} />
          <Route path="/admin/scores" element={<AdminRoute><AdminScoresPage /></AdminRoute>} />
          <Route path="/admin/draws" element={<AdminRoute><AdminDrawsPage /></AdminRoute>} />
          <Route path="/admin/simulate" element={<AdminRoute><AdminSimulatePage /></AdminRoute>} />
          <Route path="/admin/publish" element={<AdminRoute><AdminPublishPage /></AdminRoute>} />
          <Route path="/admin/charities" element={<AdminRoute><AdminCharitiesPage /></AdminRoute>} />
          <Route path="/admin/winners" element={<AdminRoute><AdminWinnersPage /></AdminRoute>} />
          <Route path="/admin/proofs" element={<AdminRoute><AdminProofsPage /></AdminRoute>} />
          <Route path="/admin/payouts" element={<AdminRoute><AdminPayoutsPage /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
