import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { IndianRupee } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminPayoutsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: winners = [], isLoading } = useQuery({
    queryKey: ['admin-winners'],
    queryFn: () => api.getWinners(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.adminUpdateWinner(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-winners'] });
      toast({ title: "Payout status updated" });
    },
  });

  const totalPaidOut = winners.filter((w: any) => w.status === 'Paid')
    .reduce((sum: number, w: any) => sum + parseFloat(w.prize_amount || 0), 0);
  const pendingPayout = winners.filter((w: any) => w.status === 'Verified')
    .reduce((sum: number, w: any) => sum + parseFloat(w.prize_amount || 0), 0);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Payout Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track and manage winner payouts</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">Total Paid Out</p>
          <p className="font-display text-xl font-bold text-green-600">₹{totalPaidOut.toLocaleString('en-IN')}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">Pending Payout</p>
          <p className="font-display text-xl font-bold text-yellow-600">₹{pendingPayout.toLocaleString('en-IN')}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">Verified (Ready to Pay)</p>
          <p className="font-display text-xl font-bold text-blue-600">{winners.filter((w: any) => w.status === 'Verified').length}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left font-semibold text-foreground">Winner</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Prize</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Match Type</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Draw Date</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading payouts...</td></tr>
            ) : winners.length > 0 ? (
              winners.map((w: any) => (
                <tr key={w.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{w.user_name}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">₹{parseFloat(w.prize_amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{w.match_type}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      w.status === 'Paid' ? 'bg-green-100 text-green-700' :
                      w.status === 'Verified' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'}`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {w.draw_date ? new Date(w.draw_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {w.status === 'Verified' ? (
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-primary"
                        onClick={() => updateMutation.mutate({ id: w.id, status: 'Paid' })}>
                        <IndianRupee className="mr-1 h-3 w-3" /> Mark Paid
                      </Button>
                    ) : w.status === 'Paid' ? (
                      <span className="text-xs text-green-600 font-medium">✓ Paid</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Awaiting verification</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No payouts yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
