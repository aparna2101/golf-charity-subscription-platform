import { PublicLayout } from "@/components/PublicLayout";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window { Razorpay: any; }
}

const plans = [
  {
    name: "Monthly",
    price: "₹499",
    period: "/month",
    desc: "Flexible monthly subscription with full access.",
    features: [
      "Unlimited score submissions",
      "Monthly prize draw entry",
      "Choose your charity",
      "Set contribution percentage",
      "Full dashboard access",
      "Winner proof upload",
    ],
    popular: false,
  },
  {
    name: "Yearly",
    price: "₹4,999",
    period: "/year",
    desc: "Save over 16% with annual billing.",
    features: [
      "Everything in Monthly",
      "2 bonus draw entries per year",
      "Priority charity spotlight",
      "Early access to new features",
      "Annual impact report",
      "Exclusive member badge",
    ],
    popular: true,
    savings: "Save ₹989",
  },
];

const comparison = [
  { feature: "Score submissions", monthly: "Unlimited", yearly: "Unlimited" },
  { feature: "Monthly draw entries", monthly: "1", yearly: "1 + 2 bonus" },
  { feature: "Charity selection", monthly: "✓", yearly: "✓" },
  { feature: "Dashboard access", monthly: "✓", yearly: "✓" },
  { feature: "Impact report", monthly: "—", yearly: "Annual" },
  { feature: "Priority spotlight", monthly: "—", yearly: "✓" },
  { feature: "Member badge", monthly: "—", yearly: "Exclusive" },
];

export default function PlansPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubscribe = async (plan: 'Monthly' | 'Yearly') => {
    if (!isAuthenticated) {
      navigate('/signup');
      return;
    }

    setLoading(plan);
    try {
      const orderData = await api.createSubscriptionOrder(plan);

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Score for Good',
        description: `${plan} Subscription`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          try {
            await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan,
            });
            toast({ title: "Payment Successful!", description: `Your ${plan} subscription is now active.` });
            navigate('/dashboard');
          } catch (err: any) {
            toast({ title: "Verification failed", description: err.message, variant: "destructive" });
          }
        },
        prefill: {},
        theme: { color: '#7c5c2e' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast({ title: "Payment failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <PublicLayout>
      <section className="bg-gradient-hero">
        <div className="container mx-auto px-4 py-20 lg:px-8">
          <SectionHeading
            badge="Pricing"
            title="Choose Your Plan"
            subtitle="Every subscription supports charity. Pick the plan that fits your game."
          />

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 transition-all hover:shadow-elevated ${
                  plan.popular
                    ? "border-primary bg-card shadow-gold"
                    : "border-border bg-card shadow-soft"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-6 rounded-full bg-gradient-gold px-4 py-1 text-xs font-semibold text-primary-foreground">
                    Most Popular
                  </span>
                )}
                {plan.savings && (
                  <span className="absolute -top-3 right-6 rounded-full bg-olive-light px-3 py-1 text-xs font-semibold text-olive">
                    {plan.savings}
                  </span>
                )}
                <h3 className="font-display text-2xl font-bold text-foreground">{plan.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{plan.desc}</p>
                <div className="mt-6">
                  <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-olive" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.popular ? "hero" : "default"}
                  className="mt-8 w-full"
                  size="lg"
                  onClick={() => handleSubscribe(plan.name as 'Monthly' | 'Yearly')}
                  disabled={loading === plan.name}
                >
                  {loading === plan.name ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    <>Subscribe Now <ArrowRight className="ml-1 h-4 w-4" /></>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="container mx-auto px-4 py-20 lg:px-8">
        <SectionHeading badge="Compare" title="Feature Comparison" />
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-6 py-4 text-left font-semibold text-foreground">Feature</th>
                <th className="px-6 py-4 text-center font-semibold text-foreground">Monthly</th>
                <th className="px-6 py-4 text-center font-semibold text-primary">Yearly</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.feature} className="border-b border-border/50 last:border-0">
                  <td className="px-6 py-3.5 text-foreground">{row.feature}</td>
                  <td className="px-6 py-3.5 text-center text-muted-foreground">{row.monthly}</td>
                  <td className="px-6 py-3.5 text-center font-medium text-foreground">{row.yearly}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Inactive state */}
      <section className="bg-secondary/30">
        <div className="container mx-auto px-4 py-16 text-center lg:px-8">
          <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-10 shadow-soft">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">Subscription Inactive</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Reactivate your subscription to enter draws, submit scores, and support your charity.
            </p>
            <Button variant="hero" className="mt-6" asChild>
              <Link to="/plans">Reactivate Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
