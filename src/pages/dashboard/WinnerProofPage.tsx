import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, Clock, XCircle } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  Pending: { icon: Clock, color: "text-gold", bg: "bg-gold-light" },
  Verified: { icon: CheckCircle, color: "text-olive", bg: "bg-olive-light" },
  Paid: { icon: CheckCircle, color: "text-olive", bg: "bg-olive-light" },
  Rejected: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

export default function WinnerProofPage() {
  const [showUpload, setShowUpload] = useState(false);

  const { data: myWinnings = [], isLoading } = useQuery({
    queryKey: ['my-winnings'],
    queryFn: () => api.getMyWinnings(),
  });

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Winner Proof</h1>
          <p className="mt-1 text-sm text-muted-foreground">Upload proof and track payout status</p>
        </div>
        <Button variant="hero" onClick={() => setShowUpload(!showUpload)}>
          <Upload className="mr-1 h-4 w-4" /> Upload Proof
        </Button>
      </div>

      {showUpload && (
        <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-soft animate-fade-in">
          <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Upload Winner Proof</h3>
          <div className="rounded-xl border-2 border-dashed border-border bg-secondary/30 p-10 text-center">
            <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Drag and drop your screenshot or proof here</p>
            <p className="mt-1 text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
            <Button variant="outline" className="mt-4" size="sm">Browse Files</Button>
          </div>
          <div className="mt-4 flex gap-3">
            <Button variant="hero" type="button">Submit Proof</Button>
            <Button variant="ghost" onClick={() => setShowUpload(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Proof submissions */}
      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
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
            {myWinnings.map((p: any) => {
              const sc = statusConfig[p.status] || statusConfig.Pending;
              return (
                <div key={p.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {p.draw_date ? new Date(p.draw_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Draw'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ₹{parseFloat(p.prize_amount || 0).toLocaleString('en-IN')} ({p.match_type} match)
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${sc.bg} ${sc.color}`}>
                      <sc.icon className="h-3 w-3" />
                      {p.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
