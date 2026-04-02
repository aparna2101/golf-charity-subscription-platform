import { PublicLayout } from "@/components/PublicLayout";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserPlus, ClipboardList, Ticket, Heart, Trophy, ArrowRight } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Subscribe", desc: "Choose a monthly or yearly plan. Select your charity and set your contribution percentage.", color: "bg-gradient-gold" },
  { icon: ClipboardList, title: "Enter Scores", desc: "Submit your Stableford golf scores after each round. We track your last five for draw eligibility.", color: "bg-olive" },
  { icon: Ticket, title: "Join Monthly Draw", desc: "Your scores automatically enter you into the monthly prize draw. More rounds = more chances.", color: "bg-terracotta" },
  { icon: Heart, title: "Support Charity", desc: "A portion of your subscription goes directly to your chosen charity every month.", color: "bg-warm-coral" },
  { icon: Trophy, title: "Win Rewards", desc: "Match 3, 4, or 5 numbers to win tiered prizes. Unclaimed jackpots roll over!", color: "bg-gradient-gold" },
];

export default function HowItWorksPage() {
  return (
    <PublicLayout>
      <section className="bg-gradient-hero">
        <div className="container mx-auto px-4 py-20 lg:px-8">
          <SectionHeading
            badge="How It Works"
            title="Five Simple Steps to Make a Difference"
            subtitle="From subscription to reward — every step is designed to be effortless and impactful."
          />
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 lg:px-8">
        <div className="relative mx-auto max-w-2xl">
          {/* Connecting line */}
          <div className="absolute left-7 top-0 hidden h-full w-px bg-border md:block" />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <div key={step.title} className="relative flex gap-6 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${step.color}`}>
                  <step.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-soft flex-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Step {i + 1}</span>
                  <h3 className="mt-1 font-display text-xl font-bold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <Button variant="hero" size="xl" asChild>
            <Link to="/signup">
              Start Your Journey <ArrowRight className="ml-1 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
