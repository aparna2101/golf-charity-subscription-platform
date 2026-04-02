import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
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
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/dashboard/scores" element={<ScoresPage />} />
          <Route path="/dashboard/draws" element={<DrawsPage />} />
          <Route path="/dashboard/charity" element={<MyCharityPage />} />
          <Route path="/dashboard/payments" element={<PaymentsPage />} />
          <Route path="/dashboard/winner" element={<WinnerProofPage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
          <Route path="/dashboard/notifications" element={<NotificationsPage />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptionsPage />} />
          <Route path="/admin/scores" element={<AdminScoresPage />} />
          <Route path="/admin/draws" element={<AdminDrawsPage />} />
          <Route path="/admin/simulate" element={<AdminSimulatePage />} />
          <Route path="/admin/publish" element={<AdminPublishPage />} />
          <Route path="/admin/charities" element={<AdminCharitiesPage />} />
          <Route path="/admin/winners" element={<AdminWinnersPage />} />
          <Route path="/admin/proofs" element={<AdminProofsPage />} />
          <Route path="/admin/payouts" element={<AdminPayoutsPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
