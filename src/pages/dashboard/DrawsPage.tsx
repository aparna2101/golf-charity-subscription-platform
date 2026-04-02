import { DashboardLayout } from "@/components/DashboardLayout";
import { Trophy, Clock, Gift } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function DrawsPage() {
  const { data: drawResults = [], isLoading } = useQuery({
    queryKey: ['my-draw-results'],
    queryFn: () => api.getMyDrawResults(),
  });

  const { data: nextDraw } = useQuery({
    queryKey: ['next-draw'],
    queryFn: () => api.getNextDraw(),
  });

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.getProfile(),
  });

  const isActive = profile?.status === "Active";

  const formatDrawMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Draws & Rewards</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your prize draw entries and winnings</p>
      </div>

      {/* Prize tiers */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { match: "5-Number Match", prize: "₹10,00,000", desc: "Jackpot — rolls over if unclaimed", share: "40% of pool" },
          { match: "4-Number Match", prize: "₹2,50,000", desc: "Second tier prize", share: "35% of pool" },
          { match: "3-Number Match", prize: "₹25,000", desc: "Third tier prize", share: "25% of pool" },
        ].map((t) => (
          <div key={t.match} className="rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
            <Trophy className="mx-auto mb-2 h-6 w-6 text-gold" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.match}</p>
            <p className="mt-1 font-display text-2xl font-bold text-foreground">{t.prize}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
            <p className="mt-1 text-xs text-primary font-medium">{t.share}</p>
          </div>
        ))}
      </div>

      {/* Upcoming draw */}
      <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-display text-lg font-semibold text-foreground">Next Draw</h3>
        </div>
        <div className="rounded-xl bg-secondary/50 p-4">
          {nextDraw ? (
            <>
              <p className="font-display text-lg font-bold text-foreground">{formatDrawMonth(nextDraw.draw_date)} Monthly Draw</p>
              <p className="text-sm text-muted-foreground">
                Draw date: {new Date(nextDraw.draw_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                {isActive ? ' · You are eligible' : ' · Subscribe to participate'}
              </p>
              {isActive && (
                <span className="mt-2 inline-block rounded-full bg-olive-light px-3 py-1 text-xs font-semibold text-olive">Entry Confirmed ✓</span>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming draw scheduled. Stay tuned!</p>
          )}
        </div>
      </div>

      {/* History */}
      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="border-b border-border bg-secondary/30 px-6 py-3">
          <h3 className="text-sm font-semibold text-foreground">Draw History</h3>
        </div>
        {isLoading ? (
          <div className="px-6 py-8 text-center text-muted-foreground">Loading draw history...</div>
        ) : drawResults.length > 0 ? (
          <div className="divide-y divide-border/50">
            {drawResults.map((d: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{formatDrawMonth(d.draw_date)}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.match_type ? `${d.match_type} match` : 'No match'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-semibold ${d.prize_amount ? "text-primary" : "text-muted-foreground"}`}>
                    {d.prize_amount ? `₹${parseFloat(d.prize_amount).toLocaleString('en-IN')}` : '—'}
                  </span>
                  <p className="text-xs text-muted-foreground">{d.draw_status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-muted-foreground">
            <Trophy className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm">No draw history yet. Results appear here after draws are published.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
