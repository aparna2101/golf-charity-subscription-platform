import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CalendarDays, Plus, Info, Pencil, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Score = { id: number; date: string; score: number };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ScoresPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newScore, setNewScore] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editScore, setEditScore] = useState("");

  const { data: scores = [], isLoading } = useQuery({
    queryKey: ['scores'],
    queryFn: () => api.getScores(),
  });

  const addScoreMutation = useMutation({
    mutationFn: (data: { score: number, play_date: string }) => api.addScore(data.score, data.play_date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scores'] });
      setNewDate("");
      setNewScore("");
      setShowForm(false);
      toast({ title: "Score added", description: "Your score was saved successfully." });
    },
    onError: (err: any) => {
      toast({ title: "Failed to add score", description: err.message, variant: "destructive" });
    }
  });

  const handleAddScore = (e: React.FormEvent) => {
    e.preventDefault();
    const scoreNum = parseInt(newScore);
    if (!newDate) {
      toast({ title: "Date required", description: "Please select a date for your score.", variant: "destructive" });
      return;
    }
    if (!scoreNum || scoreNum < 1 || scoreNum > 45) {
      toast({ title: "Invalid score", description: "Score must be between 1 and 45 (Stableford format).", variant: "destructive" });
      return;
    }
    addScoreMutation.mutate({ score: scoreNum, play_date: newDate });
  };

  const handleEditSave = async (id: number) => {
    const scoreNum = parseInt(editScore);
    if (!scoreNum || scoreNum < 1 || scoreNum > 45) {
      toast({ title: "Invalid score", description: "Score must be between 1 and 45.", variant: "destructive" });
      return;
    }
    try {
      await api.updateScore(id, { score: scoreNum });
      queryClient.invalidateQueries({ queryKey: ['scores'] });
      toast({ title: "Score updated" });
      setEditingId(null);
    } catch (err: any) {
      toast({ title: "Failed to update", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) return <DashboardLayout><div className="flex h-screen items-center justify-center">Loading scores...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Golf Scores</h1>
          <p className="mt-1 text-sm text-muted-foreground">Stableford format · Range: 1–45</p>
        </div>
        <Button variant="hero" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-1 h-4 w-4" /> Add Score
        </Button>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-border bg-secondary/30 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-medium text-foreground">5-Score Rolling System</p>
          <p className="text-xs text-muted-foreground">
            Only your latest 5 scores are kept. When you add a 6th score, the oldest is automatically removed.
            Scores are used for monthly draw eligibility and displayed in reverse chronological order.
          </p>
        </div>
      </div>

      {showForm && (
        <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-soft animate-fade-in">
          <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Submit New Score</h3>
          <form className="flex flex-col gap-4 sm:flex-row sm:items-end" onSubmit={handleAddScore}>
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Date <span className="text-destructive">*</span></label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Stableford Score (1–45) <span className="text-destructive">*</span></label>
              <input
                type="number"
                min="1"
                max="45"
                required
                placeholder="e.g. 36"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="default" size="lg" type="submit" disabled={addScoreMutation.isPending}>
                {addScoreMutation.isPending ? "Submitting..." : "Submit Score"}
              </Button>
              <Button variant="ghost" size="lg" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
          {scores.length >= 5 && (
            <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" /> You have 5 scores. Adding a new one will remove your oldest score.
            </p>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="border-b border-border bg-secondary/30 px-6 py-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Latest 5 Scores</h3>
          <span className="text-xs text-muted-foreground">{scores.length}/5 slots used</span>
        </div>
        {scores.length === 0 ? (
          <div className="py-16 text-center">
            <Info className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No scores entered yet</p>
            <Button variant="hero" size="sm" className="mt-3" onClick={() => setShowForm(true)}>Add Your First Score</Button>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {scores.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between px-6 py-4 hover:bg-secondary/20 transition-colors">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{formatDate(s.date)}</span>
                </div>
                <div className="flex items-center gap-3">
                  {editingId === s.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="45"
                        value={editScore}
                        onChange={(e) => setEditScore(e.target.value)}
                        className="h-9 w-20 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        autoFocus
                      />
                      <Button variant="default" size="sm" onClick={() => handleEditSave(s.id)}>Save</Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}><X className="h-3 w-3" /></Button>
                    </div>
                  ) : (
                    <>
                      <span className="font-display text-xl font-bold text-foreground">{s.score}</span>
                      <span className="text-xs text-muted-foreground">pts</span>
                      <Button variant="ghost" size="sm" onClick={() => { setEditingId(s.id); setEditScore(String(s.score)); }}>
                        <Pencil className="h-3 w-3 mr-1" /> Edit
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

