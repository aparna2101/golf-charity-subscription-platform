import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, Clock, XCircle, Link2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  Pending: { icon: Clock, color: "text-gold", bg: "bg-gold-light" },
  Verified: { icon: CheckCircle, color: "text-olive", bg: "bg-olive-light" },
  Paid: { icon: CheckCircle, color: "text-olive", bg: "bg-olive-light" },
  Rejected: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

export default function WinnerProofPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [proofUrl, setProofUrl] = useState("");

  const { data: myWinnings = [], isLoading } = useQuery({
    queryKey: ['my-winnings'],
    queryFn: () => api.getMyWinnings(),
  });

  const proofMutation = useMutation({
    mutationFn: ({ id, url }: { id: number; url: string }) => api.submitWinnerProof(id, url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-winnings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-winners'] });
      toast({ title: "Proof submitted" });
      setEditingId(null);
      setProofUrl("");
    },
    onError: (error: any) => {
      toast({ title: "Submit failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Winner Proof</h1>
        <p className="mt-1 text-sm text-muted-foreground">Submit your proof link and track payout status</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="border-b border-border bg-secondary/30 px-6 py-3">
          <h3 className="text-sm font-semibold text-foreground">Your Submissions</h3>
        </div>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : myWinnings.length === 0 ? (
          <div className="py-16 text-center">
            <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No winnings yet. Results appear here when you win a draw.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {myWinnings.map((winning: any) => {
              const status = statusConfig[winning.status] || statusConfig.Pending;
              const canSubmit = winning.status === 'Pending' || winning.status === 'Rejected';

              return (
                <div key={winning.id} className="px-6 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {winning.draw_date ? new Date(winning.draw_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Draw'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ₹{parseFloat(winning.prize_amount || 0).toLocaleString('en-IN')} ({winning.match_type} match)
                      </p>
                      {winning.proof_url && (
                        <a href={winning.proof_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-primary underline">
                          <Link2 className="h-3 w-3" /> View submitted proof
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${status.bg} ${status.color}`}>
                        <status.icon className="h-3 w-3" />
                        {winning.status}
                      </span>
                      {canSubmit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingId(winning.id);
                            setProofUrl(winning.proof_url || "");
                          }}
                        >
                          {winning.proof_url ? 'Update Proof' : 'Submit Proof'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {editingId === winning.id && (
                    <div className="mt-4 rounded-2xl border border-border bg-secondary/20 p-4">
                      <label className="mb-2 block text-sm font-medium text-foreground">Proof URL</label>
                      <input
                        type="url"
                        value={proofUrl}
                        onChange={(event) => setProofUrl(event.target.value)}
                        placeholder="https://..."
                        className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <div className="mt-3 flex gap-3">
                        <Button
                          variant="hero"
                          onClick={() => proofMutation.mutate({ id: winning.id, url: proofUrl })}
                          disabled={!proofUrl || proofMutation.isPending}
                        >
                          {proofMutation.isPending ? 'Submitting...' : 'Submit Proof'}
                        </Button>
                        <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
