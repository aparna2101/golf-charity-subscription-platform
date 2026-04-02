import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { Heart, MapPin, ArrowLeft, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function CharityDetailPage() {
  const { id } = useParams();

  const { data: charity, isLoading } = useQuery({
    queryKey: ['charity', id],
    queryFn: () => api.getCharity(id || ''),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <p className="text-muted-foreground">Loading charity details...</p>
        </div>
      </PublicLayout>
    );
  }

  if (!charity) {
    return (
      <PublicLayout>
        <div className="flex h-[50vh] flex-col items-center justify-center">
          <p className="text-muted-foreground">Charity not found.</p>
          <Button variant="default" className="mt-4" asChild>
            <Link to="/charities">← Back to Charities</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Hero banner */}
      <section className="relative bg-gradient-warm">
        <div className="container mx-auto px-4 py-16 lg:px-8">
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link to="/charities"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Charities</Link>
          </Button>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-gold-light px-3 py-1 text-xs font-semibold text-primary">{charity.category || 'Community'}</span>
                {charity.location && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{charity.location}</span>
                )}
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">{charity.name}</h1>
              <p className="mt-3 max-w-2xl text-base text-muted-foreground">{charity.description}</p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Button variant="hero" asChild>
                <Link to="/signup">Support This Charity</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto grid gap-10 px-4 py-16 lg:grid-cols-3 lg:px-8">
        <div className="lg:col-span-2 space-y-10">
          {/* About */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
            <h2 className="font-display text-xl font-bold text-foreground">About</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {charity.description || 'This charity works to improve lives through targeted programs in sport, education, and personal development.'}
            </p>
          </div>

          {/* Statistics */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
            <h2 className="font-display text-xl font-bold text-foreground">Charity Statistics</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-secondary/30 p-4">
                <p className="text-xs text-muted-foreground">Supporters</p>
                <p className="font-display text-xl font-bold text-foreground">{(charity.members || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="rounded-xl bg-secondary/30 p-4">
                <p className="text-xs text-muted-foreground">Total Contributions</p>
                <p className="font-display text-xl font-bold text-primary">₹{parseFloat(charity.contributions || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="rounded-xl bg-secondary/30 p-4">
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="font-display text-lg font-bold text-foreground">{charity.category || 'Community'}</p>
              </div>
              <div className="rounded-xl bg-secondary/30 p-4">
                <p className="text-xs text-muted-foreground">Status</p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${charity.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                  {charity.status || 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-display text-lg font-semibold text-foreground">Impact</h3>
            <div className="mt-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <p className="font-display text-2xl font-bold text-primary">{(charity.members || 0).toLocaleString('en-IN')}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Active supporters on the platform</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-display text-lg font-semibold text-foreground">Contribute</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Subscribe to Score for Good and select this charity. You decide what percentage of your subscription goes directly to them.
            </p>
            <Button variant="default" className="mt-4 w-full" asChild>
              <Link to="/signup">Subscribe & Support</Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-gradient-warm p-6">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-warm-coral" />
              <h3 className="font-display text-lg font-semibold text-foreground">Every Round Counts</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Your subscription helps fund programs that change lives. Thank you for being part of the solution.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
