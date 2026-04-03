import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Bell, Mail, Trophy, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const notificationItems = [
  { key: "draw_results", icon: Bell, label: "Draw results", desc: "Get notified when draw results are published" },
  { key: "winner_alerts", icon: Trophy, label: "Winner alerts", desc: "Immediate notification if you win" },
  { key: "charity_updates", icon: Heart, label: "Charity updates", desc: "News from your selected charity" },
  { key: "newsletter", icon: Mail, label: "Newsletter", desc: "Monthly platform updates and tips" },
];

export default function NotificationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => api.getNotificationPreferences(),
  });

  useEffect(() => {
    if (data) {
      setPreferences(data);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, boolean>) => api.updateNotificationPreferences(payload),
    onSuccess: (response) => {
      setPreferences(response);
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast({ title: "Preferences saved" });
    },
    onError: (error: any) => {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Notification Preferences</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose what you'd like to be notified about</p>
      </div>

      <div className="max-w-2xl space-y-4">
        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-soft">Loading preferences...</div>
        ) : (
          notificationItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={!!preferences[item.key]}
                  onChange={(event) => setPreferences((current) => ({ ...current, [item.key]: event.target.checked }))}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-muted peer-checked:bg-primary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-primary-foreground after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
          ))
        )}
        <Button variant="default" className="mt-4" onClick={() => saveMutation.mutate(preferences)} disabled={isLoading || saveMutation.isPending}>
          {saveMutation.isPending ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </DashboardLayout>
  );
}
