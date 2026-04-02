import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, IndianRupee } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminWinnersPage() {
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
      toast({ title: "Winner status updated" });
    },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Winners Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">View, verify and manage winner payouts</p>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">Total Winners</p>
          <p className="font-display text-xl font-bold text-foreground">{winners.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">Pending Verification</p>
          <p className="font-display text-xl font-bold text-yellow-600">{winners.filter((w: any) => w.status === 'Pending').length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">Verified</p>
          <p className="font-display text-xl font-bold text-blue-600">{winners.filter((w: any) => w.status === 'Verified').length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">Paid Out</p>
          <p className="font-display text-xl font-bold text-green-600">{winners.filter((w: any) => w.status === 'Paid').length}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left font-semibold text-foreground">Winner</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Draw Date</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Match Type</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Prize</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading winners...</td></tr>
            ) : winners.length > 0 ? (
              winners.map((w: any) => (
                <tr key={w.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{w.user_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {w.draw_date ? new Date(w.draw_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-foreground">{w.match_type}</td>
                  <td className="px-4 py-3 text-foreground">₹{parseFloat(w.prize_amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      w.status === 'Paid' ? 'bg-green-100 text-green-700' :
                      w.status === 'Verified' ? 'bg-blue-100 text-blue-700' :
                      w.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'}`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {w.status === 'Pending' && (
                        <>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-olive" 
                            onClick={() => updateMutation.mutate({ id: w.id, status: 'Verified' })}>
                            <CheckCircle className="mr-1 h-3 w-3" /> Verify
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive"
                            onClick={() => updateMutation.mutate({ id: w.id, status: 'Rejected' })}>
                            <XCircle className="mr-1 h-3 w-3" /> Reject
                          </Button>
                        </>
                      )}
                      {w.status === 'Verified' && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-primary"
                          onClick={() => updateMutation.mutate({ id: w.id, status: 'Paid' })}>
                          <IndianRupee className="mr-1 h-3 w-3" /> Mark Paid
                        </Button>
                      )}
                      {(w.status === 'Paid' || w.status === 'Rejected') && (
                        <span className="text-xs text-muted-foreground">Completed</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No winners yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
