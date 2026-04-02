import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: string;
  className?: string;
}

export function StatCard({ icon: Icon, label, value, trend, className = "" }: StatCardProps) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-200 hover:shadow-elevated ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-foreground">{value}</p>
      {trend && <p className="mt-1 text-xs font-medium text-olive">{trend}</p>}
    </div>
  );
}
