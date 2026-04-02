import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Heart, Trophy, ClipboardList, CreditCard, CalendarDays,
  Lock, CheckCircle
} from "lucide-react";

export default function DashboardOverview() {
  const { user } = useAuth();
  
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.getProfile(),
  });

  const { data: scores = [] } = useQuery({
    queryKey: ['scores'],
    queryFn: () => api.getScores(),
  });

  const { data: dashStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.getUserDashboard(),
  });

  const { data: nextDraw } = useQuery({
    queryKey: ['next-draw'],
    queryFn: () => api.getNextDraw(),
  });

  const isActive = profile?.status === "Active";

  const formatNextDraw = () => {
    if (nextDraw?.draw_date) {
      const d = new Date(nextDraw.draw_date);
      return {
        month: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      };
    }
    return { month: 'Coming Soon', date: 'Not scheduled yet' };
  };

  const drawInfo = formatNextDraw();

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Welcome back, {user?.name?.split(' ')[0] || 'Golfer'}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Here's your Score for Good overview</p>
      </div>

      {!isActive && (
        <div className="mb-8 rounded-2xl border border-border bg-muted p-8 text-center shadow-soft">
          <Lock className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <h3 className="font-display text-lg font-bold text-foreground">Subscription Inactive</h3>
          <p className="mt-1 text-sm text-muted-foreground">Reactivate to access draws, score entry, and charity support.</p>
          <Button variant="hero" className="mt-4" asChild>
            <Link to="/plans">Reactivate Now</Link>
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CreditCard} label="Subscription" value={profile?.plan || "No Plan"} trend="Status overview" />
        <StatCard icon={Heart} label="Your Charity" value={profile?.charity_name || "None Selected"} trend="Making impact" />
        <StatCard icon={Trophy} label="Total Winnings" value={`₹${(dashStats?.totalWon ?? 0).toLocaleString('en-IN')}`} trend="Check results" />
        <StatCard icon={ClipboardList} label="Scores Entered" value={scores.length.toString()} trend="Latest stats" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Scores */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-foreground">Latest Scores</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/scores">View All</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {scores.length > 0 ? scores.slice(0, 5).map((s: any) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 px-4 py-3">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{new Date(s.date).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold text-foreground">{s.score}</span>
                  <span className="text-xs text-muted-foreground">pts</span>
                </div>
              </div>
            )) : (
              <p className="text-center text-sm text-muted-foreground py-8">No scores entered yet.</p>
            )}
          </div>
        </div>

        {/* Winnings Overview */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-foreground">Winnings Overview</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/winner">View Proofs</Link>
              </Button>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="text-xs text-muted-foreground">Total Won</p>
                <p className="mt-1 font-display text-xl font-bold text-primary">₹{(dashStats?.totalWon ?? 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="text-xs text-muted-foreground">Charity Contributed</p>
                <div className="mt-1 flex items-center gap-1">
                  <Heart className="h-4 w-4 text-primary" />
                  <span className="font-display text-sm font-bold text-foreground">₹{(dashStats?.charityContributed ?? 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Draw */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-display text-lg font-semibold text-foreground">Upcoming Draw</h3>
            <div className="mt-4 rounded-xl bg-gradient-warm p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{drawInfo.month}</p>
              <p className="mt-1 font-display text-xl font-bold text-foreground">Monthly Prize Draw</p>
              <p className="mt-1 text-sm text-muted-foreground">Draw date: {drawInfo.date}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isActive ? "bg-olive-light text-olive" : "bg-muted text-muted-foreground"}`}>
                  {isActive ? "Eligible ✓" : "Ineligible"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
