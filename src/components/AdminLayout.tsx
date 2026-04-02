import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Users, CreditCard, ClipboardList, Ticket, 
  Heart, Trophy, Upload, IndianRupee, BarChart3, Settings, 
  LogOut, Menu, X, Play, Send 
} from "lucide-react";
import { useState } from "react";

const navSections = [
  {
    label: "Main",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/users", label: "Users", icon: Users },
      { to: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
    ],
  },
  {
    label: "Golf & Draws",
    items: [
      { to: "/admin/scores", label: "Scores", icon: ClipboardList },
      { to: "/admin/draws", label: "Draw Management", icon: Ticket },
      { to: "/admin/simulate", label: "Simulate Draw", icon: Play },
      { to: "/admin/publish", label: "Publish Results", icon: Send },
    ],
  },
  {
    label: "Charity & Finance",
    items: [
      { to: "/admin/charities", label: "Charities", icon: Heart },
      { to: "/admin/winners", label: "Winners", icon: Trophy },
      { to: "/admin/proofs", label: "Proof Verification", icon: Upload },
      { to: "/admin/payouts", label: "Payouts", icon: IndianRupee },
    ],
  },
  {
    label: "Analytics",
    items: [
      { to: "/admin/reports", label: "Reports", icon: BarChart3 },
    ],
  },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform overflow-y-auto border-r border-border bg-card transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Link to="/admin" className="font-display text-lg font-bold">
            <span className="text-gradient-gold">Admin</span> Panel
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="mt-2 px-3 pb-20">
          {navSections.map((section) => (
            <div key={section.label} className="mb-4">
              <p className="mb-1 px-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {section.label}
              </p>
              {section.items.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-secondary text-primary"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="absolute bottom-4 left-3 right-3">
          <Link to="/" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary/50 transition-colors">
            <LogOut className="h-4 w-4" /> Exit Admin
          </Link>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-foreground/20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-8">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-gold font-body text-xs font-bold text-primary-foreground">
              A
            </div>
            <span className="hidden text-sm font-medium text-foreground sm:inline">Admin</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
