import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminDrawsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [drawDate, setDrawDate] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: draws = [], isLoading } = useQuery({
    queryKey: ['admin-draws'],
    queryFn: () => api.getDraws(),
  });

  const { data: drawStats } = useQuery({
    queryKey: ['draw-stats'],
    queryFn: () => api.getDrawStats(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { draw_date: string; prize_pool?: number }) => api.createDraw(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-draws'] });
      queryClient.invalidateQueries({ queryKey: ['draw-stats'] });
      toast({ title: "Draw created" });
      setShowCreate(false);
      setDrawDate('');
      setPrizePool('');
    },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Draw Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Configure, simulate, and publish draws</p>
        </div>
        <Button variant="hero" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="mr-1 h-4 w-4" /> Create Draw
        </Button>
      </div>

      {/* Draw statistics */}
      {drawStats && (
        <div className="mb-6 grid gap-4 sm:grid-cols-5">
          <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <p className="text-xs text-muted-foreground">Total Draws</p>
            <p className="font-display text-xl font-bold text-foreground">{drawStats.totalDraws}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="font-display text-xl font-bold text-green-600">{drawStats.completedDraws}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="font-display text-xl font-bold text-yellow-600">{drawStats.pendingDraws}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <p className="text-xs text-muted-foreground">Total Winners</p>
            <p className="font-display text-xl font-bold text-primary">{drawStats.totalWinners}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <p className="text-xs text-muted-foreground">Jackpot Rollovers</p>
            <p className="font-display text-xl font-bold text-foreground">{drawStats.jackpotRollovers}</p>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-soft animate-fade-in">
          <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Create New Monthly Draw</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Draw Date *</label>
              <input type="date" value={drawDate} onChange={e => setDrawDate(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Prize Pool (₹)</label>
              <input type="number" value={prizePool} onChange={e => setPrizePool(e.target.value)} placeholder="Auto-calculated from subscriptions"
                className="h-10 w-full rounded-lg border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Draw logic: Random generation (lottery-style). Prize pool is auto-calculated from active subscriber count if left empty.
          </p>
          <div className="mt-4 flex gap-3">
            <Button variant="hero" onClick={() => createMutation.mutate({ draw_date: drawDate, prize_pool: prizePool ? parseFloat(prizePool) : undefined })} disabled={!drawDate || createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Draw'}
            </Button>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left font-semibold text-foreground">Draw Date</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Prize Pool</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Winning Numbers</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Published</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading draws...</td></tr>
            ) : draws.length > 0 ? (
              draws.map((d: any) => (
                <tr key={d.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {d.draw_date ? new Date(d.draw_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      d.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">₹{parseFloat(d.prize_pool || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.winning_numbers || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${d.published ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                      {d.published ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No draws created yet. Click "Create Draw" to start.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
