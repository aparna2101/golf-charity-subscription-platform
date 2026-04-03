import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Play, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminSimulatePage() {
  const [simResult, setSimResult] = useState<any>(null);
  const { toast } = useToast();

  const { data: draws = [] } = useQuery({
    queryKey: ['admin-draws'],
    queryFn: () => api.getDraws(),
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.getAdminStats(),
  });

  const pendingDraws = draws.filter((d: any) => d.status === 'Pending');
  const latestPending = pendingDraws.length > 0 ? pendingDraws[0] : null;

  const simulateMutation = useMutation({
    mutationFn: (drawId: number) => api.simulateDraw(drawId),
    onSuccess: (data) => {
      setSimResult(data);
      toast({ title: "Simulation Complete", description: "Draw simulation ran successfully." });
    },
    onError: (err: any) => {
      toast({ title: "Simulation failed", description: err.message, variant: "destructive" });
    }
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Draw Simulation</h1>
        <p className="mt-1 text-sm text-muted-foreground">Simulate the monthly draw before publishing</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
            {latestPending ? `Draw: ${new Date(latestPending.draw_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}` : 'No Pending Draw'}
          </h3>
          <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Active subscribers:</span> <span className="font-semibold text-foreground">{stats?.activeSubscribers ?? 0}</span></div>
            <div><span className="text-muted-foreground">Total prize pool:</span> <span className="font-semibold text-foreground">₹{(stats?.totalPool ?? 0).toLocaleString('en-IN')}</span></div>
            <div><span className="text-muted-foreground">Total users:</span> <span className="font-semibold text-foreground">{stats?.totalUsers ?? 0}</span></div>
            <div><span className="text-muted-foreground">Charity total:</span> <span className="font-semibold text-foreground">₹{(stats?.charityTotal ?? 0).toLocaleString('en-IN')}</span></div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="hero"
              onClick={() => latestPending && simulateMutation.mutate(latestPending.id)}
              disabled={!latestPending || simulateMutation.isPending}
            >
              <Play className="mr-1 h-4 w-4" />
              {simulateMutation.isPending ? 'Running...' : 'Run Simulation'}
            </Button>
            {simResult && (
              <Button variant="outline" onClick={() => setSimResult(null)}>
                <RefreshCw className="mr-1 h-4 w-4" /> Reset
              </Button>
            )}
          </div>
          {!latestPending && (
            <p className="mt-3 text-xs text-muted-foreground">Create a draw first from Draw Management to run simulation.</p>
          )}
        </div>

        {simResult && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft animate-fade-in">
            <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Simulation Results</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-gradient-warm p-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Winning Numbers</p>
                  <p className="font-display text-lg font-bold text-foreground">
                    {simResult.winning_numbers?.join(' - ') || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Eligible Entries</p>
                  <p className="font-display text-lg font-bold text-foreground">{simResult.eligible_entries}</p>
                </div>
              </div>
              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Generated Winners</p>
                {simResult.winners?.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {simResult.winners.map((winner: any) => (
                      <div key={`${winner.user_id}-${winner.match_type}`} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{winner.user_name} · {winner.match_type}</span>
                        <span className="font-medium text-primary">₹{Number(winner.prize_amount || 0).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">No eligible users with scores were available for this draw.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
