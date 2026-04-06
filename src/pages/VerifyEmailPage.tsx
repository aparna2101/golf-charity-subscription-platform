import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your account...");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const verifyUser = async () => {
      const email = searchParams.get("email");
      const token = searchParams.get("token");

      if (!email || !token) {
        setStatus("error");
        setMessage("Invalid verification link.");
        return;
      }

      try {
        const res = await api.verifyOtp(email, token);
        api.setToken(res.token);
        setStatus("success");
        setMessage("Email verified successfully! Redirecting you to the dashboard...");
        toast({ title: "Verified!", description: "Welcome to Score for Good!" });
        
        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Verification failed. Link might be expired.");
      }
    };

    verifyUser();
  }, [searchParams, navigate, toast]);

  return (
    <PublicLayout>
      <section className="flex min-h-[80vh] items-center justify-center bg-background px-4 py-16">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-border bg-card p-10 shadow-elevated">
            {status === "loading" && (
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h1 className="mt-6 text-xl font-bold font-display">Verifying...</h1>
                <p className="mt-2 text-muted-foreground">{message}</p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <h1 className="mt-6 text-xl font-bold font-display text-foreground">Verified!</h1>
                <p className="mt-2 text-muted-foreground">{message}</p>
                <button 
                  onClick={() => navigate("/dashboard")}
                  className="mt-6 h-11 w-full rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                >
                  Go to Dashboard
                </button>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center">
                <XCircle className="h-12 w-12 text-destructive" />
                <h1 className="mt-6 text-xl font-bold font-display text-foreground">Verification Failed</h1>
                <p className="mt-2 text-muted-foreground">{message}</p>
                <button 
                  onClick={() => navigate("/signup")}
                  className="mt-6 h-11 w-full rounded-lg border border-border bg-background text-foreground font-medium hover:bg-secondary transition-colors"
                >
                  Back to Signup
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
