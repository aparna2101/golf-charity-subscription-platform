import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "How It Works", to: "/how-it-works" },
    { label: "Subscription Plans", to: "/plans" },
    { label: "Charities", to: "/charities" },
  ],
  Account: [
    { label: "Log In", to: "/login" },
    { label: "Sign Up", to: "/signup" },
    { label: "Dashboard", to: "/dashboard" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "#" },
    { label: "Terms of Service", to: "#" },
    { label: "Cookie Policy", to: "#" },
  ],
};

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="container mx-auto px-4 py-16 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-display text-xl font-bold">
              Score<span className="text-gradient-gold">forGood</span>
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Play golf, support charities, win rewards. A premium subscription platform that turns every round into an act of giving.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-body text-sm font-semibold uppercase tracking-wider text-foreground/80">
                {title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © 2026 Score for Good. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            Made with <Heart className="h-3 w-3 text-warm-coral" /> for charity
          </p>
        </div>
      </div>
    </footer>
  );
}
