import { AdminLayout } from "@/components/AdminLayout";
import { StatCard } from "@/components/StatCard";
import { Users, CreditCard, Trophy, Heart, IndianRupee } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.getAdminStats(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.getUsers(),
  });

  const { data: drawStats } = useQuery({
    queryKey: ['draw-stats'],
    queryFn: () => api.getDrawStats(),
  });

  const recentUsers = users.slice(0, 5);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platform overview and real-time metrics</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-28 rounded-2xl bg-secondary/30 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard icon={Users} label="Total Users" value={stats?.totalUsers ?? 0} trend="Registered accounts" />
          <StatCard icon={CreditCard} label="Active Subscribers" value={stats?.activeSubscribers ?? 0} trend="Verified members" />
          <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`} trend="Platform income" />
          <StatCard icon={Trophy} label="Total Prize Pool" value={`₹${(stats?.totalPool ?? 0).toLocaleString('en-IN')}`} trend="Total awarded" />
          <StatCard icon={Heart} label="Charity Contributions" value={`₹${(stats?.charityTotal ?? 0).toLocaleString('en-IN')}`} trend="Supporting causes" />
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Recent Signups</h3>
          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No users yet</p>
            ) : recentUsers.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between rounded-xl bg-secondary/30 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{u.plan || 'Monthly'}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {u.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Summary */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Platform Summary</h3>
            <div className="space-y-4">
              {[
                { label: "Total Registered Users", value: stats?.totalUsers ?? 0 },
                { label: "Active Subscribers", value: stats?.activeSubscribers ?? 0, color: 'text-green-600' },
                { label: "Total Revenue", value: `₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`, color: 'text-primary' },
                { label: "Total Prize Pool", value: `₹${(stats?.totalPool ?? 0).toLocaleString('en-IN')}` },
                { label: "Charity Contributions", value: `₹${(stats?.charityTotal ?? 0).toLocaleString('en-IN')}`, color: 'text-primary' },
              ].map((s: any) => (
                <div key={s.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  <span className={`font-semibold ${s.color || 'text-foreground'}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Draw Statistics */}
          {drawStats && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Draw Statistics</h3>
              <div className="space-y-4">
                {[
                  { label: "Total Draws", value: drawStats.totalDraws },
                  { label: "Completed Draws", value: drawStats.completedDraws },
                  { label: "Pending Draws", value: drawStats.pendingDraws },
                  { label: "Total Winners", value: drawStats.totalWinners },
                  { label: "Jackpot Rollovers", value: drawStats.jackpotRollovers },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
