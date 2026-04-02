import { DashboardLayout } from "@/components/DashboardLayout";
import { Heart, MapPin, Percent, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function MyCharityPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDonate, setShowDonate] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.getProfile(),
  });

  const { data: dashStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.getUserDashboard(),
  });

  const [contributionPct, setContributionPct] = useState(profile?.charity_contribution_pct || 10);

  const saveMutation = useMutation({
    mutationFn: (pct: number) => api.updateProfile({ charity_contribution_pct: pct }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: "Contribution Updated", description: `Your charity contribution is now ${contributionPct}%.` });
    },
    onError: (err: any) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    }
  });

  const handleSaveContribution = () => {
    if (contributionPct < 10) {
      toast({ title: "Minimum 10%", description: "Charity contribution must be at least 10% of your subscription.", variant: "destructive" });
      setContributionPct(10);
      return;
    }
    saveMutation.mutate(contributionPct);
  };

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(donationAmount);
    if (!amount || amount <= 0) {
      toast({ title: "Invalid amount", description: "Please enter a valid donation amount.", variant: "destructive" });
      return;
    }
    toast({ title: "Donation Submitted", description: `Thank you for your ₹${amount.toFixed(2)} donation!` });
    setDonationAmount("");
    setShowDonate(false);
  };

  const charityContributed = dashStats?.charityContributed ?? 0;
  const joinedDate = profile?.joined_date
    ? new Date(profile.joined_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'N/A';

  const monthsActive = profile?.joined_date
    ? Math.max(1, Math.floor((Date.now() - new Date(profile.joined_date).getTime()) / (1000 * 60 * 60 * 24 * 30)))
    : 0;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">My Charity</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your selected charity and contribution details</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Charity */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-light">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                {profile?.charity_name || 'No Charity Selected'}
              </h3>
              {profile?.charity_location && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {profile.charity_location}
                </p>
              )}
            </div>
          </div>
          {profile?.charity_description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile.charity_description}
            </p>
          )}

          {/* Adjustable Contribution */}
          <div className="mt-6 rounded-xl bg-secondary/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Contribution Rate</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={contributionPct}
                onChange={(e) => setContributionPct(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="font-display text-lg font-bold text-primary w-14 text-right">{contributionPct}%</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Minimum 10% · Drag to increase your contribution</p>
            <Button variant="default" size="sm" className="mt-3" onClick={handleSaveContribution} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save Contribution'}
            </Button>
          </div>

          <div className="mt-4 rounded-xl bg-secondary/50 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total contributed</span>
              <span className="font-semibold text-primary">₹{charityContributed.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <Button variant="outline" className="mt-4">Change Charity</Button>
        </div>

        {/* Impact + Independent Donation */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-gradient-warm p-8">
            <h3 className="font-display text-lg font-semibold text-foreground">Your Impact</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your contributions help fund programs and support the charity you care about.
            </p>
            <div className="mt-6 space-y-3">
              <div className="rounded-xl bg-card/80 p-3">
                <p className="text-sm font-semibold text-foreground">₹{charityContributed.toLocaleString('en-IN')} donated</p>
                <p className="text-xs text-muted-foreground">Since joining in {joinedDate}</p>
              </div>
              <div className="rounded-xl bg-card/80 p-3">
                <p className="text-sm font-semibold text-foreground">{monthsActive} month{monthsActive !== 1 ? 's' : ''} active</p>
                <p className="text-xs text-muted-foreground">
                  {monthsActive >= 6 ? 'Consistent supporter' : 'Growing supporter'}
                </p>
              </div>
            </div>
          </div>

          {/* Independent Donation */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="h-5 w-5 text-primary" />
              <h3 className="font-display text-lg font-semibold text-foreground">Make a Donation</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Send an independent one-off donation to your chosen charity — not tied to gameplay.
            </p>
            {!showDonate ? (
              <Button variant="hero" onClick={() => setShowDonate(true)}>Donate Now</Button>
            ) : (
              <form onSubmit={handleDonate} className="space-y-3 animate-fade-in">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 500"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="hero" type="submit">Confirm Donation</Button>
                  <Button variant="ghost" type="button" onClick={() => setShowDonate(false)}>Cancel</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
