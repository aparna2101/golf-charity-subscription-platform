import { PublicLayout } from "@/components/PublicLayout";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Trophy, Users, ArrowRight, Gift, Target, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const features = [
  { icon: Target, title: "Enter Your Scores", desc: "Submit your Stableford golf scores easily after each round." },
  { icon: Gift, title: "Monthly Prize Draws", desc: "Every subscriber is entered into exclusive monthly draws with real rewards." },
  { icon: Heart, title: "Support Charities", desc: "A portion of every subscription directly funds the charity you choose." },
  { icon: Trophy, title: "Win Rewards", desc: "Match numbers and win from jackpots, rollovers, and tiered prize pools." },
];

export default function HomePage() {
  const { data: publicStats } = useQuery({
    queryKey: ['public-stats'],
    queryFn: () => api.getPublicStats().catch(() => null),
    retry: false,
  });

  const { data: allCharities = [] } = useQuery({
    queryKey: ['public-charities'],
    queryFn: () => api.getCharities().catch(() => []),
    retry: false,
  });

  const adminStats = publicStats;
  const featuredCharity = allCharities.find((charity: any) => charity.featured) || allCharities[0] || null;
  const nextDrawPool = Number(publicStats?.nextDraw?.prize_pool || 0);
  const prizeHighlights = [
    { match: "5 Numbers", share: 0.4, color: "bg-gradient-gold text-primary-foreground" },
    { match: "4 Numbers", share: 0.35, color: "bg-secondary text-secondary-foreground" },
    { match: "3 Numbers", share: 0.25, color: "bg-champagne text-foreground" },
  ];

  const stats = [
    { value: adminStats ? `₹${(adminStats.charityTotal || 0).toLocaleString('en-IN')}` : '₹0', label: "Raised for Charity" },
    { value: publicStats ? (publicStats.activeSubscribers || 0).toLocaleString('en-IN') : '0', label: "Active Members" },
    { value: adminStats ? `₹${(adminStats.totalPool || 0).toLocaleString('en-IN')}` : '₹0', label: "Prize Pool" },
    { value: publicStats ? (publicStats.totalUsers || 0).toLocaleString('en-IN') : '0', label: "Registered Users" },
  ];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="container relative mx-auto px-4 py-24 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-6 inline-block rounded-full bg-gold-light px-5 py-2 text-xs font-semibold uppercase tracking-widest text-primary">
              Golf · Charity · Rewards
            </span>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Every Round You Play,<br />
              <span className="text-gradient-gold">Every Life You Change</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Subscribe, enter your golf scores, join exclusive monthly prize draws, and support the charity closest to your heart — all in one premium platform.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/signup">
                  Subscribe Now <ArrowRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/how-it-works">See How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto grid grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4 lg:px-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-2xl font-bold text-primary md:text-3xl">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works summary */}
      <section className="container mx-auto px-4 py-20 lg:px-8">
        <SectionHeading badge="How It Works" title="Simple, Rewarding, Impactful" subtitle="Four easy steps that connect your passion for golf with the power of giving." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div key={f.title} className="group rounded-2xl border border-border bg-card p-8 shadow-soft transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-gold">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Step {i + 1}</span>
              <h3 className="mt-2 font-display text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Charity */}
      <section className="bg-secondary/50">
        <div className="container mx-auto px-4 py-20 lg:px-8">
          <SectionHeading badge="Spotlight" title="Featured Charity" subtitle="Highlighting incredible organizations making a real difference." />
          {featuredCharity ? (
            <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-elevated">
              <div className="h-48 bg-gradient-warm flex items-center justify-center">
                <Heart className="h-16 w-16 text-warm-coral opacity-30" />
              </div>
              <div className="p-8">
                <h3 className="font-display text-2xl font-bold text-foreground">{featuredCharity.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {featuredCharity.description || 'Supporting communities through meaningful programs.'}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {featuredCharity.category && (
                    <span className="rounded-full bg-olive-light px-3 py-1 text-xs font-medium text-olive">{featuredCharity.category}</span>
                  )}
                  {featuredCharity.location && (
                    <span className="rounded-full bg-gold-light px-3 py-1 text-xs font-medium text-primary">{featuredCharity.location}</span>
                  )}
                </div>
                <Button variant="default" className="mt-6" asChild>
                  <Link to={`/charities/${featuredCharity.id}`}>Learn More</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-card p-12 shadow-elevated text-center">
              <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-40" />
              <p className="text-muted-foreground">Charities coming soon. Subscribe to be the first to support a cause.</p>
            </div>
          )}
        </div>
      </section>

      {/* Prize draw highlights */}
      <section className="container mx-auto px-4 py-20 lg:px-8">
        <SectionHeading badge="Rewards" title="Prize Draw Highlights" subtitle="Match numbers for incredible prizes — jackpots roll over when unclaimed!" />
        <div className="grid gap-6 sm:grid-cols-3">
          {prizeHighlights.map((d) => (
            <div key={d.match} className="rounded-2xl border border-border p-8 text-center shadow-soft transition-all hover:shadow-elevated hover:-translate-y-1">
              <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${d.color}`}>
                <Trophy className="h-7 w-7" />
              </div>
              <h3 className="font-display text-lg font-semibold">{d.match}</h3>
              <p className="mt-2 font-display text-3xl font-bold text-primary">
                {nextDrawPool > 0 ? `₹${Math.round(nextDrawPool * d.share).toLocaleString('en-IN')}` : `${Math.round(d.share * 100)}%`}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {nextDrawPool > 0 ? 'From the current scheduled draw pool' : 'Share of the active draw pool'}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gradient-hero">
        <div className="container mx-auto px-4 py-20 lg:px-8">
          <SectionHeading badge="Why Score for Good" title="More Than Just Golf" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Shield, title: "Secure & Transparent", desc: "Every rupee tracked. Full transparency on charity contributions and prize pools." },
              { icon: Users, title: "Growing Community", desc: "Join golfers who combine their passion with purpose." },
              { icon: Heart, title: "Real Impact", desc: "Choose your charity, set your contribution, and see the difference you make." },
            ].map((b) => (
              <div key={b.title} className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-light">
                  <b.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-display text-base font-semibold text-foreground">{b.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-gold">
        <div className="container mx-auto px-4 py-20 text-center lg:px-8">
          <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
            Ready to Make Every Round Count?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-primary-foreground/80">
            Join Score for Good today and start turning your golf passion into real charitable impact and exciting rewards.
          </p>
          <Button variant="outline" size="xl" className="mt-8 border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20" asChild>
            <Link to="/signup">Get Started Today <ArrowRight className="ml-1" /></Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
