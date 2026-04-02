import { PublicLayout } from "@/components/PublicLayout";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, Heart, MapPin } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const categories = ["All", "Youth", "Health", "Education", "Environment", "Community", "Sport"];

export default function CharitiesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: charities = [], isLoading } = useQuery({
    queryKey: ['public-charities'],
    queryFn: () => api.getCharities(),
  });

  const filtered = charities.filter((c: any) => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "All" || c.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const featured = charities.filter((c: any) => c.featured);

  return (
    <PublicLayout>
      <section className="bg-gradient-hero">
        <div className="container mx-auto px-4 py-16 lg:px-8">
          <SectionHeading
            badge="Our Charities"
            title="Choose Your Cause"
            subtitle="Browse verified charities and select the one closest to your heart."
          />
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="container mx-auto px-4 py-16 lg:px-8">
          <h3 className="mb-6 font-display text-xl font-bold text-foreground">Featured Charities</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {featured.map((c: any) => (
              <div key={c.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:shadow-elevated">
                <div className="flex h-32 items-center justify-center bg-gradient-warm">
                  <Heart className="h-10 w-10 text-warm-coral/40" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-gold-light px-2.5 py-0.5 text-xs font-semibold text-primary">Featured</span>
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">{c.category || 'Community'}</span>
                  </div>
                  <h4 className="font-display text-lg font-semibold text-foreground">{c.name}</h4>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">{c.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{c.location || 'India'}</span>
                    <Button variant="default" size="sm" asChild>
                      <Link to={`/charities/${c.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Search & Filter */}
      <section className="container mx-auto px-4 pb-20 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search charities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map(i => <div key={i} className="h-48 rounded-2xl bg-secondary/30 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c: any) => (
              <div key={c.id} className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:shadow-elevated hover:-translate-y-1">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-light">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">{c.category || 'Community'}</span>
                </div>
                <h4 className="font-display text-base font-semibold text-foreground">{c.name}</h4>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{c.location || 'India'}</span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/charities/${c.id}`}>Details →</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">No charities found. Try adjusting your search or filters.</p>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
