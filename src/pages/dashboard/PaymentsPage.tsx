import { DashboardLayout } from "@/components/DashboardLayout";
import { CreditCard, CheckCircle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function PaymentsPage() {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.getProfile(),
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.getSubscription(),
  });

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => api.getPayments(),
  });

  const planPrice = profile?.plan === 'Yearly' ? '₹4,999' : '₹499';
  const planLabel = profile?.plan === 'Yearly' ? 'Yearly' : 'Monthly';

  const getNextPaymentDate = () => {
    if (subscription?.end_date) {
      return new Date(subscription.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return 'N/A';
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">Subscription billing and payment history</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <CreditCard className="mb-2 h-5 w-5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Current Plan</p>
          <p className="mt-1 font-display text-lg font-bold text-foreground">{planLabel} · {planPrice}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <CheckCircle className="mb-2 h-5 w-5 text-olive" />
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="mt-1 font-display text-lg font-bold text-foreground">{profile?.status || 'N/A'}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <Clock className="mb-2 h-5 w-5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Next Payment</p>
          <p className="mt-1 font-display text-lg font-bold text-foreground">{getNextPaymentDate()}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="border-b border-border bg-secondary/30 px-6 py-3">
          <h3 className="text-sm font-semibold text-foreground">Payment History</h3>
        </div>
        {isLoading ? (
          <div className="px-6 py-8 text-center text-muted-foreground">Loading payments...</div>
        ) : payments.length > 0 ? (
          <div className="divide-y divide-border/50">
            {payments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(p.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-muted-foreground">Razorpay</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">₹{parseFloat(p.amount).toLocaleString('en-IN')}</p>
                  <span className="rounded-full bg-olive-light px-2 py-0.5 text-xs font-medium text-olive capitalize">{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-muted-foreground">
            <CreditCard className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm">No payment history yet. Subscribe to get started.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
