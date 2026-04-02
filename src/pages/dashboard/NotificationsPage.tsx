import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Bell, Mail, Trophy, Heart } from "lucide-react";

const notifications = [
  { icon: Bell, label: "Draw results", desc: "Get notified when draw results are published", enabled: true },
  { icon: Trophy, label: "Winner alerts", desc: "Immediate notification if you win", enabled: true },
  { icon: Heart, label: "Charity updates", desc: "News from your selected charity", enabled: false },
  { icon: Mail, label: "Newsletter", desc: "Monthly platform updates and tips", enabled: true },
];

export default function NotificationsPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Notification Preferences</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose what you'd like to be notified about</p>
      </div>

      <div className="max-w-2xl space-y-4">
        {notifications.map((n) => (
          <div key={n.label} className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <n.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{n.label}</p>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" defaultChecked={n.enabled} className="peer sr-only" />
              <div className="h-6 w-11 rounded-full bg-muted peer-checked:bg-primary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-primary-foreground after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        ))}
        <Button variant="default" className="mt-4">Save Preferences</Button>
      </div>
    </DashboardLayout>
  );
}
