import { DashboardLayout } from "@/components/DashboardLayout";
import { Heart, MapPin, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function MyCharityPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [contributionPct, setContributionPct] = useState(10);
  const [selectedCharityId, setSelectedCharityId] = useState("");

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.getProfile(),
  });

  const { data: charities = [] } = useQuery({
    queryKey: ['public-charities'],
    queryFn: () => api.getCharities(),
  });

  const { data: dashStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.getUserDashboard(),
  });

  useEffect(() => {
    if (profile?.charity_contribution_pct !== undefined) {
      setContributionPct(profile.charity_contribution_pct);
    }
    if (profile?.charity_id) {
      setSelectedCharityId(String(profile.charity_id));
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (payload: { charity_id?: number; charity_contribution_pct?: number }) => api.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({ title: "Charity settings updated" });
    },
    onError: (error: any) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  const handleSaveContribution = () => {
    if (contributionPct < 10) {
      toast({ title: "Minimum 10%", description: "Charity contribution must be at least 10% of your subscription.", variant: "destructive" });
      setContributionPct(10);
      return;
    }
    updateMutation.mutate({ charity_contribution_pct: contributionPct });
  };

  const handleChangeCharity = () => {
    if (!selectedCharityId) {
      toast({ title: "Select a charity", description: "Choose a charity before saving.", variant: "destructive" });
      return;
    }

    updateMutation.mutate({ charity_id: Number(selectedCharityId) });
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
        <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-light">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">{profile?.charity_name || 'No Charity Selected'}</h3>
              {profile?.charity_location && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {profile.charity_location}
                </p>
              )}
            </div>
          </div>
          {profile?.charity_description && (
            <p className="text-sm leading-relaxed text-muted-foreground">{profile.charity_description}</p>
          )}

          <div className="mt-6 rounded-xl bg-secondary/50 p-4">
            <div className="mb-3 flex items-center gap-2">
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
                onChange={(event) => setContributionPct(Number(event.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="w-14 text-right font-display text-lg font-bold text-primary">{contributionPct}%</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Minimum 10% · Increase your contribution anytime.</p>
            <Button variant="default" size="sm" className="mt-3" onClick={handleSaveContribution} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Contribution'}
            </Button>
          </div>

          <div className="mt-4 rounded-xl bg-secondary/50 p-4">
            <p className="mb-2 text-sm font-semibold text-foreground">Change Charity</p>
            <select
              value={selectedCharityId}
              onChange={(event) => setSelectedCharityId(event.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select charity</option>
              {charities.map((charity: any) => (
                <option key={charity.id} value={charity.id}>{charity.name}</option>
              ))}
            </select>
            <Button variant="outline" className="mt-3" onClick={handleChangeCharity} disabled={updateMutation.isPending || !selectedCharityId}>
              Save Charity
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-gradient-warm p-8">
            <h3 className="font-display text-lg font-semibold text-foreground">Your Impact</h3>
            <p className="mt-2 text-sm text-muted-foreground">Your subscription contributions are calculated from real paid transactions.</p>
            <div className="mt-6 space-y-3">
              <div className="rounded-xl bg-card/80 p-3">
                <p className="text-sm font-semibold text-foreground">₹{charityContributed.toLocaleString('en-IN')} donated</p>
                <p className="text-xs text-muted-foreground">Since joining in {joinedDate}</p>
              </div>
              <div className="rounded-xl bg-card/80 p-3">
                <p className="text-sm font-semibold text-foreground">{monthsActive} month{monthsActive !== 1 ? 's' : ''} active</p>
                <p className="text-xs text-muted-foreground">{monthsActive >= 6 ? 'Consistent supporter' : 'Growing supporter'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-display text-lg font-semibold text-foreground">How Contributions Work</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Every paid subscription allocates your selected percentage to the charity on your profile. Admin charity totals and the public frontend both reflect the same database values.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
