import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminProofsPage() {
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
      toast({ title: "Status updated" });
    },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const getStatusIcon = (status: string) => {
    if (status === 'Verified' || status === 'Paid') return <CheckCircle className="h-3 w-3" />;
    if (status === 'Rejected') return <XCircle className="h-3 w-3" />;
    return <Clock className="h-3 w-3" />;
  };

  const getStatusClass = (status: string) => {
    if (status === 'Verified' || status === 'Paid') return 'bg-green-100 text-green-700';
    if (status === 'Rejected') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Proof Verification</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and verify winner proof submissions · {winners.filter((w: any) => w.status === 'Pending').length} pending
        </p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left font-semibold text-foreground">Winner</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Draw Date</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Prize</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Match</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Proof</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Loading proofs...</td></tr>
            ) : winners.length > 0 ? (
              winners.map((w: any) => (
                <tr key={w.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{w.user_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {w.draw_date ? new Date(w.draw_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">₹{parseFloat(w.prize_amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{w.match_type}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusClass(w.status)}`}>
                      {getStatusIcon(w.status)} {w.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {w.proof_url ? (
                      <a href={w.proof_url} target="_blank" rel="noreferrer" className="text-primary underline text-xs">View</a>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {w.status === 'Pending' && (
                        <>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-olive"
                            onClick={() => updateMutation.mutate({ id: w.id, status: 'Verified' })}>
                            Approve
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive"
                            onClick={() => updateMutation.mutate({ id: w.id, status: 'Rejected' })}>
                            Reject
                          </Button>
                        </>
                      )}
                      {w.status === 'Verified' && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-primary"
                          onClick={() => updateMutation.mutate({ id: w.id, status: 'Paid' })}>
                          Mark Paid
                        </Button>
                      )}
                      {(w.status === 'Paid' || w.status === 'Rejected') && (
                        <span className="text-xs text-muted-foreground italic">Done</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No proof submissions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
