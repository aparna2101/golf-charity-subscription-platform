import { AdminLayout } from "@/components/AdminLayout";
import { StatCard } from "@/components/StatCard";
import { Users, CreditCard, Trophy, Heart, IndianRupee, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function AdminReportsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.getAdminStats(),
  });

  const { data: winners = [] } = useQuery({
    queryKey: ['admin-winners'],
    queryFn: () => api.getWinners(),
  });

  const { data: drawStats } = useQuery({
    queryKey: ['draw-stats'],
    queryFn: () => api.getDrawStats(),
  });

  const totalWinnersPaid = winners.filter((w: any) => w.status === 'Paid').length;
  const totalPaidOut = winners.filter((w: any) => w.status === 'Paid')
    .reduce((sum: number, w: any) => sum + parseFloat(w.prize_amount || 0), 0);
  const pendingPayouts = winners.filter((w: any) => w.status === 'Pending').length;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Live platform performance data from database</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-28 rounded-2xl bg-secondary/30 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard icon={Users} label="Total Users" value={stats?.totalUsers ?? 0} trend="Registered accounts" />
          <StatCard icon={CreditCard} label="Active Subscribers" value={stats?.activeSubscribers ?? 0} trend="Verified & active" />
          <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`} trend="Subscription income" />
          <StatCard icon={Trophy} label="Total Prize Pool" value={`₹${(stats?.totalPool ?? 0).toLocaleString('en-IN')}`} trend="Across all draws" />
          <StatCard icon={Heart} label="Charity Contributions" value={`₹${(stats?.charityTotal ?? 0).toLocaleString('en-IN')}`} trend="Total donated" />
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Winner Statistics</h3>
          <div className="space-y-3">
            {[
              { label: "Total Winners", value: winners.length },
              { label: "Winners Paid", value: totalWinnersPaid },
              { label: "Total Paid Out", value: `₹${totalPaidOut.toLocaleString('en-IN')}` },
              { label: "Pending Payouts", value: pendingPayouts },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between rounded-xl bg-secondary/30 px-4 py-3">
                <span className="text-sm text-foreground">{s.label}</span>
                <span className="text-sm font-semibold text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Draw Statistics</h3>
          <div className="space-y-3">
            {drawStats ? [
              { label: "Total Draws", value: drawStats.totalDraws },
              { label: "Completed", value: drawStats.completedDraws },
              { label: "Pending", value: drawStats.pendingDraws },
              { label: "Jackpot Rollovers", value: drawStats.jackpotRollovers },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between rounded-xl bg-secondary/30 px-4 py-3">
                <span className="text-sm text-foreground">{s.label}</span>
                <span className="text-sm font-semibold text-foreground">{s.value}</span>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">Loading...</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Platform Summary</h3>
          <div className="space-y-3">
            {[
              { label: "Total Users", value: stats?.totalUsers ?? 0 },
              { label: "Active Members", value: stats?.activeSubscribers ?? 0 },
              { label: "Revenue", value: `₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}` },
              { label: "Prize Pool Total", value: `₹${(stats?.totalPool ?? 0).toLocaleString('en-IN')}` },
              { label: "Charity Total", value: `₹${(stats?.charityTotal ?? 0).toLocaleString('en-IN')}` },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between rounded-xl bg-secondary/30 px-4 py-3">
                <span className="text-sm text-foreground">{s.label}</span>
                <span className="text-sm font-semibold text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
