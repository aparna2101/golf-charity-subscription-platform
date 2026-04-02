import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CreditCard, CalendarDays, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCancel, setShowCancel] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.getProfile(),
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.getSubscription(),
  });

  useEffect(() => {
    if (profile) {
      const parts = (profile.name || '').split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setEmail(profile.email || '');
    }
  }, [profile]);

  const profileMutation = useMutation({
    mutationFn: (data: any) => api.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: "Profile saved" });
    },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      setShowCancel(false);
      toast({ title: "Subscription cancellation requested" });
    },
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    profileMutation.mutate({ name: `${firstName} ${lastName}`.trim(), email });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updatePassword(currentPw, newPw);
      toast({ title: "Password updated" });
      setCurrentPw('');
      setNewPw('');
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const planPrice = profile?.plan === 'Yearly' ? '₹4,999/year' : '₹499/month';
  const planSaving = profile?.plan === 'Yearly' ? 'Save 17% compared to monthly' : 'Switch to yearly to save';

  const renewalDate = subscription?.end_date
    ? new Date(subscription.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'N/A';

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Profile & Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account, subscription, and preferences</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Personal Information */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Personal Information</h3>
          <form className="space-y-4" onSubmit={handleSaveProfile}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">First Name</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Last Name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <Button variant="default" disabled={profileMutation.isPending}>
              {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </div>

        {/* Subscription Management */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Subscription</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{profile?.plan || 'No'} Plan — {planPrice}</p>
                  <p className="text-xs text-muted-foreground">{planSaving}</p>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${profile?.status === 'Active' ? 'bg-olive-light text-olive' : 'bg-muted text-muted-foreground'}`}>
                {profile?.status || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-secondary/30 p-4">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Renewal Date</p>
                <p className="text-xs text-muted-foreground">{renewalDate} · Auto-renew enabled</p>
              </div>
            </div>
            <div className="flex gap-3">
              {!showCancel ? (
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setShowCancel(true)}>
                  Cancel Subscription
                </Button>
              ) : (
                <div className="flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-xs text-destructive">Are you sure?</span>
                  <Button variant="destructive" size="sm" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}>
                    Yes, Cancel
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowCancel(false)}>No, Keep</Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Change Password</h3>
          <form className="space-y-4" onSubmit={handlePasswordChange}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Current Password</label>
              <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">New Password</label>
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <Button variant="default">Update Password</Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
