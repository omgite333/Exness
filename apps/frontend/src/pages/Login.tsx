import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuthCheck } from "@/lib/useAuthCheck";
import { useSessionStore } from "@/lib/session";
import { ArrowRight, Mail, CheckCircle, AlertCircle, ArrowLeft, Zap, Shield, BarChart3 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);

  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: async () => {
      const cleanEmail = email.trim();
      await api.post("/auth/signup", { email: cleanEmail });
    },
  });

  const { isSuccess: isAuthSuccess } = useAuthCheck();
  const navigate = useNavigate();
  const isGuest = useSessionStore((s) => s.isGuest);

  useEffect(() => {
    if (isAuthSuccess && !isGuest) {
      navigate("/trade", { replace: true });
    }
  }, [isAuthSuccess, isGuest, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground flex">

      {/* LEFT PANEL - branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-background-secondary border-r border-border p-12">
        <div>
          <div 
            className="flex items-center gap-3 mb-20 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-sm font-bold text-background">EX</div>
            <span className="font-semibold text-foreground tracking-tight text-lg">Exness</span>
          </div>

          <div className="space-y-12">
            <div>
              <h1 className="text-4xl font-bold leading-tight mb-4">
                Trade smarter.
                <br />
                <span className="gradient-text">Move faster.</span>
              </h1>
              <p className="text-foreground-secondary leading-relaxed text-base max-w-sm">
                Professional perpetuals trading with sub-millisecond execution and real-time WebSocket feeds.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Mail, text: "No KYC - sign in with just your email" },
                { icon: Zap, text: "Demo account with $50,000 in virtual funds" },
                { icon: BarChart3, text: "Live BTC, ETH, SOL perpetuals up to 100x" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-sm text-foreground-secondary">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <item.icon size={18} className="text-primary" />
                  </div>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-foreground-muted">&copy; {new Date().getFullYear()} Exness. Demo platform only.</p>
      </div>

      {/* RIGHT PANEL - form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative">

        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-8 left-8 flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div 
            className="flex items-center gap-3 mb-12 lg:hidden cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-sm font-bold text-background">EX</div>
            <span className="font-semibold tracking-tight text-lg">Exness</span>
          </div>

          <h2 className="text-2xl font-bold mb-2 text-foreground">Welcome back</h2>
          <p className="text-foreground-muted text-sm mb-8">Enter your email to receive a secure sign-in link.</p>

          {!isSuccess ? (
            <form
              onSubmit={(e) => { e.preventDefault(); mutate(); }}
              className="space-y-4"
            >
              {/* Email field */}
              <div className={`relative rounded-xl border transition-all duration-200 ${focused ? "border-primary bg-primary/5" : "border-border bg-surface"}`}>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm outline-none text-foreground placeholder:text-foreground-muted rounded-xl border-none"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-danger-bg border border-danger/20 text-danger text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  {(error as Error).message || "Something went wrong. Please try again."}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-background font-semibold text-sm hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-primary"
              >
                {isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    Sending link...
                  </>
                ) : (
                  <>Send Magic Link <ArrowRight size={15} /></>
                )}
              </button>
            </form>
          ) : (
            /* Success state */
            <div className="text-center py-8 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-success-bg border border-success/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-success" size={28} />
              </div>
              <h3 className="font-semibold text-xl mb-2 text-foreground">Check your inbox</h3>
              <p className="text-foreground-secondary text-sm leading-relaxed">
                We sent a sign-in link to{" "}
                <span className="text-foreground font-medium">{email}</span>.
                Click it to access your account.
              </p>
              <p className="text-foreground-muted text-xs mt-4">{"Didn't"} get it? Check your spam folder.</p>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-border text-center">
            <p className="text-xs text-foreground-muted mb-3">Just want to explore?</p>
            <button
              onClick={() => navigate("/trade")}
              className="text-sm text-primary hover:text-primary-hover transition-colors font-medium"
            >
              Try the demo - no account needed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
