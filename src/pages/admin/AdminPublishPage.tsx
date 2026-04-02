import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminPublishPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: draws = [], isLoading } = useQuery({
    queryKey: ['admin-draws'],
    queryFn: () => api.getDraws(),
  });

  const publishMutation = useMutation({
    mutationFn: (drawId: number) => api.publishDraw(drawId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-draws'] });
      toast({ title: "Published!", description: "Draw results published to all subscribers." });
    },
  });

  const unpublished = draws.filter((d: any) => !d.published && d.winning_numbers);
  const published = draws.filter((d: any) => d.published);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Publish Results</h1>
        <p className="mt-1 text-sm text-muted-foreground">Publish draw results to all subscribers</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Unpublished draws ready to publish */}
        {unpublished.length > 0 ? unpublished.map((d: any) => (
          <div key={d.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
              {new Date(d.draw_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} Results
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Winning numbers: <span className="font-semibold text-foreground">{d.winning_numbers || 'Not generated'}</span>
            </p>
            <p className="text-sm text-muted-foreground mb-4">Review simulation results and publish to members.</p>
            <Button variant="hero" onClick={() => publishMutation.mutate(d.id)} disabled={publishMutation.isPending}>
              <Send className="mr-1 h-4 w-4" /> Publish Results
            </Button>
          </div>
        )) : (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <p className="text-sm text-muted-foreground">No unpublished results available. Run a simulation first.</p>
          </div>
        )}

        {/* Published history */}
        <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
          <div className="border-b border-border bg-secondary/30 px-6 py-3">
            <h3 className="text-sm font-semibold text-foreground">Published History</h3>
          </div>
          {isLoading ? (
            <div className="px-6 py-8 text-center text-muted-foreground">Loading...</div>
          ) : published.length > 0 ? (
            <div className="divide-y divide-border/50">
              {published.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      {new Date(r.draw_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </span>
                    <p className="text-xs text-muted-foreground">Numbers: {r.winning_numbers || 'N/A'}</p>
                  </div>
                  <span className="rounded-full bg-olive-light px-2.5 py-0.5 text-xs font-semibold text-olive">Published</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-muted-foreground">No published results yet.</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
