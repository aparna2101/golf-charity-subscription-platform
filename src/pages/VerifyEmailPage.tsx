import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { useAuth } from "@/lib/auth";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <PublicLayout>
      <section className="flex min-h-[80vh] items-center justify-center bg-background px-4 py-16">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-border bg-card p-10 shadow-elevated">
            <div className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <h1 className="mt-6 text-xl font-bold font-display text-foreground">No Verification Needed</h1>
              <p className="mt-2 text-muted-foreground">
                User email verification has been removed. You can sign up and access your dashboard immediately.
              </p>
              <button
                onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
                className="mt-6 h-11 w-full rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                {isAuthenticated ? "Go to Dashboard" : "Go to Login"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
