import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Charity { id: number; name: string; }

export default function SignupPage() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otp, setOtp] = useState("");
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "", charity_id: "", charity_contribution_pct: "10" });
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    api.getCharities().then(setCharities).catch(() => {});
    if (location.state?.email) {
      setForm(f => ({ ...f, email: location.state.email }));
    }
    if (location.state?.step) {
      setStep(location.state.step);
    }
  }, [location.state]);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pct = parseFloat(form.charity_contribution_pct);
    if (pct < 10) { toast({ title: "Minimum 10%", description: "Charity contribution must be at least 10%.", variant: "destructive" }); return; }
    setLoading(true);
    try {
      await signup({ ...form, charity_id: form.charity_id ? parseInt(form.charity_id) : undefined, charity_contribution_pct: pct });
      toast({ 
        title: "Welcome! 🎉", 
        description: "Your account has been created successfully."
      });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.verifyOtp(form.email, otp);
      api.setToken(res.token);
      toast({ title: "Verified!", description: "Welcome to Score for Good!" });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Verification failed", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <PublicLayout>
      <section className="flex min-h-[80vh] items-center justify-center bg-gradient-hero px-4 py-16">
        <div className="w-full max-w-md animate-fade-in">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-elevated sm:p-10">
            {step === 'form' ? (
              <>
                <div className="mb-8 text-center">
                  <h1 className="font-display text-2xl font-bold text-foreground">Create Your Account</h1>
                  <p className="mt-2 text-sm text-muted-foreground">Join Score for Good and start making a difference</p>
                </div>
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">First Name</label>
                      <input type="text" value={form.first_name} onChange={update("first_name")} required placeholder="First name"
                        className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Last Name</label>
                      <input type="text" value={form.last_name} onChange={update("last_name")} required placeholder="Last name"
                        className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                    <input type="email" value={form.email} onChange={update("email")} required placeholder="you@example.com"
                      className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
                    <div className="relative">
                      <input type={showPw ? "text" : "password"} value={form.password} onChange={update("password")} required placeholder="Min 8 characters"
                        className="h-11 w-full rounded-lg border border-border bg-background px-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Select Your Charity</label>
                    <select value={form.charity_id} onChange={update("charity_id")}
                      className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Choose a charity...</option>
                      {charities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Charity Contribution (%)</label>
                    <input type="number" min="10" max="100" value={form.charity_contribution_pct} onChange={update("charity_contribution_pct")} required placeholder="e.g. 10"
                      className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                    <p className="mt-1 text-xs text-muted-foreground">Minimum 10%. Percentage of your subscription donated to your charity.</p>
                  </div>
                  <Button variant="hero" className="w-full" size="lg" type="submit" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Account
                  </Button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <h1 className="font-display text-2xl font-bold text-foreground">Verify Your Email</h1>
                  <p className="mt-2 text-sm text-muted-foreground">We've sent a <b>verification link</b> to {form.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground italic">Please click the button in your email to automatically verify and login.</p>
                </div>
                <form className="space-y-5" onSubmit={handleVerify}>
                  <div className="rounded-lg bg-secondary/30 p-4 text-center border border-border/50">
                    <p className="text-sm font-medium text-foreground mb-3">Already have the code?</p>
                    <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit code here"
                      className="h-11 w-full rounded-lg border border-border bg-background px-4 text-center text-lg font-bold tracking-widest text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <Button variant="hero" className="w-full" size="lg" type="submit" disabled={loading || !otp}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Verify with Code
                  </Button>
                  <div className="pt-2 text-center">
                    <button type="button" onClick={async () => {
                      try {
                        setLoading(true);
                        await api.resendOtp(form.email);
                        toast({ title: "OTP Resent", description: "A new code has been sent to your email." });
                      } catch(err: any) {
                        toast({ title: "Failed to resend", description: err.message, variant: "destructive" });
                      } finally {
                        setLoading(false);
                      }
                    }} disabled={loading} className="text-sm font-medium text-primary hover:underline">
                      Resend Verification Code
                    </button>
                  </div>
                  <button type="button" onClick={() => setStep('form')} className="w-full text-center text-sm text-muted-foreground hover:underline">
                    Back to signup
                  </button>
                </form>
              </>
            )}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
