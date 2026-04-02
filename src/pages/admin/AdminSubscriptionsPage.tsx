import { AdminLayout } from "@/components/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function AdminSubscriptionsPage() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.getUsers(),
  });

  const activeCount = users.filter((u: any) => u.status === 'Active').length;
  const monthlyCount = users.filter((u: any) => u.plan === 'Monthly').length;
  const yearlyCount = users.filter((u: any) => u.plan === 'Yearly').length;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Subscription Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {activeCount} active · {monthlyCount} monthly · {yearlyCount} yearly
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left font-semibold text-foreground">User</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Plan</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Charity</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : users.length > 0 ? (
              users.map((u: any) => (
                <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3 text-foreground">{u.plan || 'Monthly'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.charity_name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      u.status === 'Active' ? 'bg-green-100 text-green-700' :
                      u.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-muted text-muted-foreground'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {u.joined_date ? new Date(u.joined_date).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No subscribers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
