import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminScoresPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: scores = [], isLoading } = useQuery({
    queryKey: ['admin-scores'],
    queryFn: () => api.getAdminScores(0),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.adminDeleteScore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scores'] });
      toast({ title: "Score deleted" });
    },
  });

  const avgScore = scores.length > 0
    ? (scores.reduce((sum: number, s: any) => sum + s.score, 0) / scores.length).toFixed(1)
    : '0';

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Golf Score Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">{scores.length} scores submitted · Average: {avgScore} pts</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left font-semibold text-foreground">User</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Score (pts)</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading scores...</td></tr>
            ) : scores.length > 0 ? (
              scores.map((s: any) => (
                <tr key={s.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{s.user_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.user_email}</td>
                  <td className="px-4 py-3">
                    <span className="font-display text-lg font-bold text-foreground">{s.score}</span>
                    <span className="ml-1 text-xs text-muted-foreground">pts</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.date ? new Date(s.date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => {
                      if (confirm(`Delete this score?`)) deleteMutation.mutate(s.id);
                    }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No scores submitted yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
